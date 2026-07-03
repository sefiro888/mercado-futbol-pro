// =============================================================================
// Taxonomías del portal: estados, niveles de fiabilidad, categorías y operaciones.
// Centralizar aquí etiquetas y colores mantiene la coherencia visual y permite
// traducir o ampliar valores en un solo sitio.
// Las claves de color son nombres semánticos resueltos por CSS (var(--state-*)).
// =============================================================================

// --- Estado de un fichaje (tabla de traspasos) ---
export const TRANSFER_STATUS = {
  confirmado: { label: 'Confirmado', tone: 'success' },
  avanzado: { label: 'Avanzado', tone: 'info' },
  rumor: { label: 'Rumor', tone: 'warning' },
  descartado: { label: 'Descartado', tone: 'danger' },
}

// --- Estado de un rumor (más granular) ---
export const RUMOUR_STATUS = {
  rumor: { label: 'Rumor', tone: 'warning' },
  contactos: { label: 'Contactos', tone: 'warning' },
  negociacion: { label: 'Negociación', tone: 'info' },
  'oferta-enviada': { label: 'Oferta enviada', tone: 'info' },
  'acuerdo-cercano': { label: 'Acuerdo cercano', tone: 'info-strong' },
  confirmado: { label: 'Confirmado', tone: 'success' },
  descartado: { label: 'Descartado', tone: 'danger' },
}

// --- Nivel de fiabilidad (noticias, rumores y fuentes) ---
export const RELIABILITY = {
  oficial: {
    label: 'Oficial',
    tone: 'success-strong',
    help: 'Comunicado de club, liga o federación.',
  },
  alta: {
    label: 'Fiabilidad alta',
    tone: 'success',
    help: 'Dos o más fuentes fiables coinciden.',
  },
  media: {
    label: 'Fiabilidad media',
    tone: 'info',
    help: 'Una fuente fiable lo publica.',
  },
  baja: {
    label: 'Fiabilidad baja',
    tone: 'warning',
    help: 'Rumor sin confirmación fuerte.',
  },
  descartado: {
    label: 'Descartado',
    tone: 'danger',
    help: 'Una fuente fiable informa de que no sigue adelante.',
  },
}

// --- Categorías de noticias ---
export const NEWS_CATEGORY = {
  fichaje: { label: 'Fichaje', tone: 'success' },
  rumor: { label: 'Rumor', tone: 'warning' },
  renovacion: { label: 'Renovación', tone: 'info' },
  lesion: { label: 'Lesión', tone: 'danger' },
  mercado: { label: 'Mercado', tone: 'neutral' },
  analisis: { label: 'Análisis', tone: 'info-strong' },
}

// --- Tipo de operación (rumores) ---
export const OPERATION_TYPE = {
  compra: { label: 'Compra' },
  cesion: { label: 'Cesión' },
  libre: { label: 'Agente libre' },
  renovacion: { label: 'Renovación' },
}

// --- Estado deportivo de un jugador (plantilla) ---
export const PLAYER_STATUS = {
  titular: { label: 'Titular', tone: 'success' },
  suplente: { label: 'Suplente', tone: 'neutral' },
  cedido: { label: 'Cedido', tone: 'info' },
  lesionado: { label: 'Lesionado', tone: 'danger' },
  cantera: { label: 'Cantera', tone: 'info-strong' },
}

/** Helper seguro: devuelve la entrada de una taxonomía o un fallback legible. */
export function resolve(map, key) {
  return map[key] || { label: key || '—', tone: 'neutral' }
}
