import { formatMoney } from '@/lib/format.js'
import './MarketValueChart.css'

// Gráfico de evolución del valor de mercado.
// SVG puro (sin librerías) para mantener la web ligera. Es responsive vía viewBox.
export default function MarketValueChart({ history = [], clubColor }) {
  if (!history || history.length < 2) {
    return <p className="muted">Sin datos suficientes para el gráfico.</p>
  }

  const W = 640
  const H = 220
  const PAD = { top: 20, right: 16, bottom: 28, left: 44 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const values = history.map((d) => d.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1

  // Escalas lineales simples.
  const x = (i) => PAD.left + (i / (history.length - 1)) * innerW
  const y = (v) => PAD.top + innerH - ((v - min) / span) * innerH

  const points = history.map((d, i) => [x(i), y(d.value)])
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const areaPath =
    `${linePath} L ${points[points.length - 1][0].toFixed(1)} ${PAD.top + innerH} ` +
    `L ${points[0][0].toFixed(1)} ${PAD.top + innerH} Z`

  // Tres marcas en el eje Y (mín, medio, máx).
  const yTicks = [min, (min + max) / 2, max]

  const last = history[history.length - 1]
  const first = history[0]
  const trend = last.value - first.value

  return (
    <div className="mv-chart" style={clubColor ? { '--brand': clubColor } : undefined}>
      <div className="mv-head">
        <div>
          <span className="mv-current num">{formatMoney(last.value)}</span>
          <span className={`mv-trend num ${trend >= 0 ? 'pos' : 'neg'}`}>
            {trend >= 0 ? '▲' : '▼'} {formatMoney(Math.abs(trend))} desde {first.date}
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolución del valor de mercado" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mvFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Líneas de referencia + etiquetas del eje Y */}
        {yTicks.map((tick, i) => {
          const ty = y(tick)
          return (
            <g key={i}>
              <line x1={PAD.left} y1={ty} x2={W - PAD.right} y2={ty} className="mv-grid" />
              <text x={PAD.left - 8} y={ty + 4} className="mv-axis" textAnchor="end">
                {Math.round(tick)}
              </text>
            </g>
          )
        })}

        {/* Área + línea. pathLength="1" normaliza el trazo para animar el dibujado. */}
        <path d={areaPath} fill="url(#mvFill)" className="mv-area" />
        <path d={linePath} className="mv-line" fill="none" pathLength="1" />

        {/* Puntos y etiquetas del eje X.
            Las etiquetas de los extremos se alinean hacia dentro para no recortarse. */}
        {points.map((p, i) => {
          const anchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'
          return (
            <g key={i}>
              <circle
                cx={p[0]}
                cy={p[1]}
                r="3.5"
                className="mv-dot"
                style={{ animationDelay: `${0.5 + (i / points.length) * 0.8}s` }}
              />
              <text x={p[0]} y={H - 8} className="mv-axis" textAnchor={anchor}>
                {history[i].date}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
