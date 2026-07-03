# 🟢 Conectar Mercado Fútbol Pro a Supabase

Guía paso a paso para pasar de los **datos demo** a una **base de datos real** en
Supabase. Mientras no hagas esto, la web sigue funcionando con los JSON de demo
(no se rompe nada).

> El código ya está preparado. Solo tienes que: crear el proyecto, pegar 2 claves,
> crear las tablas y cargar los datos. Unos 10 minutos.

---

## Resumen de lo que ya está hecho en el código

| Pieza | Archivo | Qué hace |
|-------|---------|----------|
| Cliente Supabase | `src/lib/supabase.js` | Conexión con la clave pública (carga perezosa). |
| Capa de datos | `src/lib/data.js` | `initData()` carga de Supabase o, si falla, usa los demo. |
| Arranque | `src/main.jsx` | Llama a `initData()` antes de pintar la web. |
| Esquema | `supabase/schema.sql` | Crea las 6 tablas + seguridad (RLS). |
| Carga de datos | `scripts/seed-supabase.mjs` (`npm run seed`) | Sube los JSON a Supabase. |

---

## Paso 0 — Instalar dependencias (una vez)

```bash
npm install
```

Esto instala `@supabase/supabase-js`, ya añadido al `package.json`.

## Paso 1 — Crear el proyecto en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta (plan gratuito).
2. **New project** → ponle nombre, contraseña de base de datos y región.
3. Espera ~1 minuto a que se aprovisione.

## Paso 2 — Crear las tablas

1. En el panel del proyecto: **SQL Editor** → **New query**.
2. Copia y pega **todo** el contenido de [`supabase/schema.sql`](supabase/schema.sql).
3. Pulsa **Run**. Deberías ver "Success". Ya tienes las 6 tablas con lectura
   pública y escritura bloqueada (RLS).

## Paso 3 — Copiar tus claves

En **Project Settings → API** encontrarás:

| Clave | Dónde va | ¿Secreta? |
|-------|----------|-----------|
| **Project URL** | `VITE_SUPABASE_URL` y `SUPABASE_URL` | No |
| **anon public** | `VITE_SUPABASE_ANON_KEY` | No (protegida por RLS) |
| **service_role** | `SUPABASE_SERVICE_ROLE_KEY` | **SÍ — solo local, nunca en el frontend** |

Crea un archivo **`.env.local`** en la raíz del proyecto (ya está en `.gitignore`)
copiando `.env.example`, y rellénalo así:

```bash
# Frontend (públicas)
VITE_DATA_SOURCE=supabase
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...la-anon...

# Solo para el seed local (secreta)
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...la-service-role...
```

## Paso 4 — Cargar los datos demo en Supabase

```bash
npm run seed
```

Sube clubes, jugadores, fichajes, rumores, noticias y fuentes en el orden
correcto. Verás un ✓ por cada tabla.

## Paso 5 — Arrancar la web con datos reales

```bash
npm run dev
```

Con `VITE_DATA_SOURCE=supabase`, la web ahora lee de Supabase. En la consola del
navegador verás `[data] Datos cargados desde Supabase.`

> ¿Quieres volver a los datos demo? Pon `VITE_DATA_SOURCE=local` (o borra la
> línea) y reinicia `npm run dev`.

---

## Cómo funciona el cambio de origen

`src/lib/data.js` mantiene un almacén en memoria que arranca con los JSON de demo.
Al iniciar, `initData()`:

- Si `VITE_DATA_SOURCE` **no** es `supabase` → se queda con los demo.
- Si es `supabase` y hay claves → carga las 6 tablas y reemplaza el almacén.
- Si Supabase falla por lo que sea → **conserva los demo** y lo avisa por consola.

Como la interfaz pública de `data.js` no cambia, **ningún componente se toca**.

## Seguridad (recordatorio)

- En el frontend solo va la **anon key**, y las tablas tienen **RLS** con lectura
  pública y escritura denegada.
- La **service_role** solo se usa en `npm run seed` (tu máquina). Nunca con prefijo
  `VITE_`, nunca en git.
- Próximos pasos (cron, panel editorial, API de noticias): ver
  [`ROADMAP_AUTOMATIZACION.md`](ROADMAP_AUTOMATIZACION.md).
