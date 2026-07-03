import Badge from './Badge.jsx'
import { resolve } from '@/lib/taxonomy.js'

// Badge de estado reutilizable para fichajes, rumores y jugadores.
// Recibe el mapa de taxonomía correspondiente (TRANSFER_STATUS, RUMOUR_STATUS...).
export default function StatusBadge({ map, value }) {
  const { label, tone } = resolve(map, value)
  return <Badge tone={tone}>{label}</Badge>
}
