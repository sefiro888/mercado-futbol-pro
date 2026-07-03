# 🛣️ Roadmap de automatización — Mercado Fútbol Pro

Este documento describe cómo evolucionar el MVP (datos JSON estáticos) hacia una
plataforma con datos reales y actualización automática. La arquitectura actual ya
está preparada para ello: **todos los datos pasan por `src/lib/data.js`**, así que
cambiar el origen de datos no obliga a tocar los componentes.

> ⚠️ Reglas de oro que se mantienen en todas las fases:
> - **No copiar contenido completo de medios.** Solo título, resumen propio, fecha, fuente y enlace.
> - **Sin claves secretas en el frontend.** Las claves privadas viven en el backend / funciones serverless.
> - **Sin scraping agresivo.** Respetar `robots.txt`, límites de petición y términos de uso.
> - **Sin logos reales sin licencia.** Usar placeholders hasta tener derechos.

---

## Estado actual (Fase 0 — MVP)

```
Componentes React  ──►  src/lib/data.js  ──►  src/data/*.json
                         (capa de acceso)      (datos de demostración)
```

`data.js` ya expone funciones `async` (`fetchCollection`) pensadas para que el día
de mañana resuelvan contra una API o base de datos sin cambiar las firmas.

---

## 1. API de noticias

**Objetivo:** sustituir `news.json` por noticias reales.

- Contratar/usar una API de noticias deportivas (NewsAPI, GNews, etc.).
- Crear una **función serverless** (Vercel/Netlify Functions, Supabase Edge Functions)
  que llame a la API con la **clave guardada en el servidor**.
- La función NO devuelve el cuerpo del artículo: extrae y guarda únicamente
  `title`, `summary` (resumen propio o el `description` corto de la fuente),
  `sourceName`, `sourceUrl`, `publishedAt`, `image`.
- El frontend consume tu endpoint, nunca la API original.

```
Navegador ─► /api/news (serverless, con la clave) ─► API externa de noticias
```

## 2. API de datos deportivos

**Objetivo:** poblar clubes, jugadores, plantillas y valores de mercado.

- Integrar una API de datos deportivos (API-Football, SportMonks, etc.).
- Mapear su respuesta al **modelo de datos** ya definido (ver `src/data/*.json`).
- Cachear en base de datos para no exceder cuotas y ganar velocidad.
- Mantener un campo `source`/`updatedAt` por entidad para trazabilidad.

## 3. Base de datos Supabase

**Objetivo:** persistencia, consultas y panel de administración.

- Crear tablas: `clubs`, `players`, `transfers`, `rumours`, `news`, `sources`
  (mismos campos que el modelo actual).
- En el frontend usar **solo la `anon key`** (pública) con **Row Level Security**:
  lectura pública, escritura restringida a usuarios autenticados (editores).
- Reescribir el cuerpo de las funciones de `src/lib/data.js` para consultar Supabase:

```js
// Ejemplo de migración (data.js)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY, // clave PÚBLICA con RLS
)

export async function fetchCollection(name) {
  const { data, error } = await supabase.from(name).select('*')
  if (error) throw error
  return data
}
```

> Las claves `service_role` y de APIs de pago **jamás** se ponen en el cliente;
> se usan solo dentro de Edge Functions / cron.

## 4. Cron diario para actualizar datos

**Objetivo:** mantener todo fresco sin intervención manual.

- Programar un **cron** (Supabase Scheduled Functions, GitHub Actions, Vercel Cron).
- Tarea diaria:
  1. Llamar a las APIs de noticias y datos deportivos.
  2. Normalizar al modelo de datos.
  3. Recalcular valores derivados (diferencia, ganancia, % — ver `src/lib/calculations.js`).
  4. Hacer *upsert* en Supabase.
  5. Marcar rumores caducados / cerrar operaciones confirmadas.

## 5. Panel privado para revisar rumores antes de publicar

**Objetivo:** control editorial humano.

- Ruta protegida (`/admin`) con login (Supabase Auth).
- Cola de rumores en estado **borrador** → un editor revisa, asigna fiabilidad y
  fuentes, y pulsa **publicar**.
- Solo los rumores `publicados` aparecen en la web pública.
- Registrar quién publica y cuándo (auditoría).

## 6. Sistema de fuentes y fiabilidad

**Objetivo:** automatizar parte de la clasificación que hoy es manual.

- Tabla `sources` con `reliabilityLevel` por medio (ya existe en el modelo).
- Regla automática sugerida (revisable por el editor):
  - **Oficial:** la fuente es un club/liga/federación.
  - **Alta:** ≥ 2 fuentes fiables coinciden en el mismo rumor.
  - **Media:** 1 fuente fiable.
  - **Baja:** fuentes no verificadas.
  - **Descartado:** una fuente fiable informa de que la operación no sigue.
- Estas reglas ya están codificadas como referencia en `src/lib/taxonomy.js` (`RELIABILITY`).

## 7. Evitar copiar contenido completo de medios

- El pipeline **descarta** el cuerpo del artículo: nunca se almacena ni se muestra.
- Se genera un **resumen propio** (manual o con un modelo de IA con instrucciones de
  no reproducir frases textuales) limitado a 1–2 frases.
- Siempre se muestra y enlaza la **fuente original** (`sourceUrl`) con `rel="nofollow noopener"`.

## 8. Qué se guarda de cada noticia

Solo estos campos (los mismos del MVP):

| Campo         | Se guarda | Notas                                  |
|---------------|-----------|----------------------------------------|
| `title`       | ✅        | Titular                                |
| `summary`     | ✅        | Resumen **propio**, breve              |
| `publishedAt` | ✅        | Fecha                                  |
| `sourceName`  | ✅        | Nombre del medio                       |
| `sourceUrl`   | ✅        | Enlace a la fuente original            |
| `image`       | ⚠️        | Solo si hay derechos / es placeholder  |
| Cuerpo / texto completo | ❌ | **Nunca** se almacena ni se publica  |

---

## Orden recomendado de implementación

1. Supabase + migración de `data.js` (Fase 3) → base sólida.
2. API de datos deportivos (Fase 2) + cron (Fase 4).
3. API de noticias (Fase 1) con resumen propio (Fase 7/8).
4. Panel editorial (Fase 5) + sistema de fiabilidad (Fase 6).

## Mejoras transversales

- **SEO/SSR:** migrar a un framework con renderizado en servidor (Next.js / Astro /
  Remix) para indexar mejor las fichas. El módulo `src/lib/seo.js` ya genera los
  esquemas `NewsArticle`, `SportsTeam` y `Person` listos para inyectar como JSON-LD.
- **Sitemap.xml** dinámico a partir de los slugs.
- **Caché** de respuestas (CDN / `stale-while-revalidate`).
- **Tests** de las fórmulas económicas (`src/lib/calculations.js`).
