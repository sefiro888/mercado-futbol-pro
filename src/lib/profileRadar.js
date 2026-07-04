// =============================================================================
// Radar del jugador construido SOLO con datos reales del dataset:
// percentiles frente a los jugadores de su misma demarcación (línea).
// Nada de atributos inventados tipo videojuego.
// =============================================================================
import { getAllPlayers } from './data.js'
import { lineOf } from './positions.js'

// Percentil (0-100) de `value` dentro de `values` (mayor = mejor).
function percentile(value, values) {
  if (!values.length || value == null) return 0
  const below = values.filter((v) => v < value).length
  return Math.round((below / values.length) * 100)
}

const STATUS_SCORE = { titular: 90, cantera: 70, suplente: 55, lesionado: 50, cedido: 45 }

function yearsLeft(p) {
  if (!p.contractUntil) return 0
  return Math.max(0, new Date(p.contractUntil).getFullYear() - new Date().getFullYear())
}

// Devuelve los 5 ejes del radar y el número de jugadores comparados.
export function buildRadarAxes(player, club) {
  const peers = getAllPlayers().filter((p) => lineOf(p.position) === lineOf(player.position))
  const values = peers.map((p) => p.marketValue || 0)
  const ages = peers.map((p) => p.age).filter((a) => a != null)
  const contracts = peers.map(yearsLeft)

  const weight = club?.squadValue
    ? Math.min(100, Math.round(((player.marketValue || 0) / club.squadValue) * 400))
    : 0

  return {
    peers: peers.length,
    axes: [
      { label: 'Valor', value: percentile(player.marketValue || 0, values) },
      { label: 'Juventud', value: player.age != null ? 100 - percentile(player.age, ages) : 0 },
      { label: 'Contrato', value: percentile(yearsLeft(player), contracts) },
      { label: 'Peso en club', value: weight },
      { label: 'Protagonismo', value: STATUS_SCORE[player.status] ?? 50 },
    ],
  }
}
