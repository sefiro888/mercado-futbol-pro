// =============================================================================
// Utilidades de formato (números, dinero, fechas).
// Sin dependencias externas: usa Intl nativo del navegador.
// =============================================================================

const LOCALE = 'es-ES'

/**
 * Formatea un importe en millones de euros.
 * @param {number|null|undefined} millions - cantidad ya expresada en millones.
 * @returns {string} p.ej. "45 M€" o "—" si no hay dato.
 */
export function formatMoney(millions) {
  if (millions === null || millions === undefined || Number.isNaN(millions)) {
    return '—'
  }
  const formatter = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })
  return `${formatter.format(millions)} M€`
}

/**
 * Formatea un porcentaje ya calculado (entero o con decimales).
 * @param {number|null} value
 * @returns {string} p.ej. "+27 %" / "-12 %"
 */
export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const rounded = Math.round(value)
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded} %`
}

/**
 * Fecha legible en español a partir de un ISO string (YYYY-MM-DD).
 * @param {string} iso
 * @returns {string} p.ej. "12 jul 2024"
 */
export function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * Devuelve la altura en formato "1,82 m" a partir de centímetros.
 * @param {number} cm
 */
export function formatHeight(cm) {
  if (!cm) return '—'
  return `${(cm / 100).toFixed(2).replace('.', ',')} m`
}
