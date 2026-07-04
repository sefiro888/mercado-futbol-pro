import './RadarChart.css'

// Radar SVG minimalista sin librerías. `axes` = [{ label, value 0-100 }].
// El color se hereda del club vía la prop `color`.
export default function RadarChart({ axes, size = 280, color = '#22c55e' }) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 46
  const n = axes.length

  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (i, f) => [cx + Math.cos(angle(i)) * r * f, cy + Math.sin(angle(i)) * r * f]
  const ring = (f) => axes.map((_, i) => pt(i, f).join(',')).join(' ')
  const data = axes.map((a, i) => pt(i, Math.max(0.05, a.value / 100)).join(',')).join(' ')

  return (
    <svg
      className="radar-chart"
      viewBox={`-38 0 ${size + 76} ${size}`}
      role="img"
      aria-label={`Radar: ${axes.map((a) => `${a.label} ${a.value}`).join(', ')}`}
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} className="radar-ring" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="radar-spoke" />
      })}
      <polygon points={data} className="radar-area" style={{ fill: color, stroke: color }} />
      {axes.map((a, i) => {
        const [x, y] = pt(i, Math.max(0.05, a.value / 100))
        return <circle key={i} cx={x} cy={y} r={3.4} className="radar-dot" style={{ fill: color }} />
      })}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 1.24)
        return (
          <text key={i} x={x} y={y} className="radar-label" textAnchor="middle" dominantBaseline="middle">
            <tspan x={x} dy="-0.35em">{a.label}</tspan>
            <tspan x={x} dy="1.15em" className="radar-label-value">{a.value}</tspan>
          </text>
        )
      })}
    </svg>
  )
}
