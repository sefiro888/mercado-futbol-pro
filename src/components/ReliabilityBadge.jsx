import Badge from './Badge.jsx'
import { RELIABILITY, resolve } from '@/lib/taxonomy.js'

// Etiqueta de fiabilidad (oficial / alta / media / baja / descartado).
// El title muestra la regla de clasificación al pasar el ratón.
export default function ReliabilityBadge({ level }) {
  const { label, tone, help } = resolve(RELIABILITY, level)
  return (
    <Badge tone={tone} title={help}>
      {label}
    </Badge>
  )
}
