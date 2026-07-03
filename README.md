# ⚽ Mercado Fútbol Pro

Portal deportivo de **noticias, fichajes y rumores contrastados** con tablas de
traspasos y análisis económico. MVP visual y funcional construido con **React + Vite**,
con datos de demostración en JSON y arquitectura preparada para conectarse a APIs,
RSS o una base de datos (Supabase) en el futuro.

> ⚠️ **Todos los datos son ficticios y de demostración.** Clubes, jugadores, cifras,
> noticias y fuentes son inventados para mostrar la estructura del portal. No se
> reproducen noticias reales ni se atribuyen frases a medios reales.

---

## 🚀 Ejecutar el proyecto en local

Requisitos: **Node.js 18+** y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar el servidor de desarrollo
npm run dev
```

Abre la URL que indique la terminal (por defecto **http://localhost:5173**).

### Otros comandos

```bash
npm run build     # Compila la versión de producción en /dist
npm run preview   # Sirve localmente la build de producción
```

---

## 🧱 Estructura del proyecto

```
futbol/
├─ index.html                 # HTML base + SEO (title, meta, Open Graph)
├─ vite.config.js             # Config de Vite (alias "@" → /src)
├─ ROADMAP_AUTOMATIZACION.md  # Cómo conectar APIs / Supabase / cron en el futuro
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.jsx                # Punto de entrada (React + Router)
   ├─ App.jsx                 # Rutas de la aplicación
   ├─ config/
   │  └─ site.js              # ⭐ Nombre y marca del portal (fácil de cambiar)
   ├─ data/                   # Datos de demostración (separados del diseño)
   │  ├─ news.json
   │  ├─ transfers.json
   │  ├─ clubs.json
   │  ├─ players.json
   │  ├─ rumours.json
   │  └─ sources.json
   ├─ lib/                    # Lógica reutilizable (sin React)
   │  ├─ data.js              # ⭐ Capa de acceso a datos (preparada para API/Supabase)
   │  ├─ calculations.js      # Fórmulas económicas de los fichajes
   │  ├─ format.js            # Formato de dinero, fechas, %, altura
   │  ├─ taxonomy.js          # Estados, fiabilidad, categorías (+ colores)
   │  └─ seo.js               # Meta dinámicos + schema.org (NewsArticle/SportsTeam/Person)
   ├─ components/             # Componentes reutilizables
   │  ├─ Header / Footer / SearchBar
   │  ├─ NewsCard / ClubCard / PlayerCard / RumourCard / StatCard
   │  ├─ TransferTable / TransferRow / FilterPanel
   │  ├─ ReliabilityBadge / StatusBadge / SourceBadge / Badge
   │  ├─ MarketValueChart (SVG, sin librerías)
   │  └─ ClubProfile / PlayerProfile / Crest / Section
   ├─ pages/                  # Una por ruta
   │  ├─ Home / News / Transfers / Clubs / ClubDetail
   │  └─ Players / PlayerDetail / Rumours / NotFound
   └─ styles/
      └─ index.css            # Sistema de diseño (tema oscuro + variables)
```

---

## 🧮 Fórmulas de fichajes

Implementadas en [`src/lib/calculations.js`](src/lib/calculations.js):

| Cálculo | Fórmula |
|---|---|
| **Diferencia vs valor de mercado** | `transferFee - marketValue` → «+X M€ sobre valor» / «X M€ por debajo» |
| **Ganancia/pérdida del vendedor** | `transferFee - previousPurchaseFee` → «No disponible» si no hay compra previa |
| **% de diferencia** | `((transferFee - marketValue) / marketValue) * 100` (redondeado) |

Estas funciones son **puras** (sin dependencias del DOM), por lo que se pueden
reutilizar en un backend o testear fácilmente.

---

## 🎨 Cambiar el nombre / la marca

El nombre del portal es provisional. Edita **un solo archivo**,
[`src/config/site.js`](src/config/site.js):

```js
export const SITE = {
  name: 'Mercado Fútbol Pro',   // ← cámbialo aquí
  tagline: 'Noticias, fichajes y rumores contrastados',
  // ...
}
```

Los colores y la tipografía se controlan con variables CSS en
[`src/styles/index.css`](src/styles/index.css) (bloque `:root`).

---

## 🏷️ Clasificación de rumores

| Etiqueta | Significado |
|---|---|
| **Oficial** | Comunicado de club, liga o federación. |
| **Alta** | Dos o más fuentes fiables coinciden. |
| **Media** | Una fuente fiable lo publica. |
| **Baja** | Rumor sin confirmación fuerte. |
| **Descartado** | Una fuente fiable informa de que no sigue adelante. |

---

## 📐 Características

- ✅ Diseño oscuro premium, **100% responsive** (en móvil las tablas se convierten en tarjetas).
- ✅ Tabla de fichajes con **filtros** (club, liga, posición, estado, precio, jugador, nacionalidad) y **ordenación**.
- ✅ Fichas completas de **clubes** (con plantilla) y **jugadores** (con gráfico de valor).
- ✅ Página de **rumores** con fiabilidad y fuentes desplegables.
- ✅ **SEO**: title/description por página, Open Graph y esquemas schema.org preparados.
- ✅ Datos **separados del diseño** y capa de acceso lista para datos reales.

Consulta [`ROADMAP_AUTOMATIZACION.md`](ROADMAP_AUTOMATIZACION.md) para la evolución
hacia datos reales y automatización.

---

## ⚖️ Compromiso editorial

- No se copian noticias completas: solo **resumen propio, fecha, fuente y enlace**.
- No se usan **logos reales** sin licencia (se usan placeholders con iniciales).
- No se hace **scraping agresivo**.
- No se incluyen **claves API** en el frontend.
- No es una web de apuestas.
