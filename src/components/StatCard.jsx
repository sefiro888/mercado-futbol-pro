import Icon from './Icon.jsx'
import { useCountUp } from '@/lib/useCountUp.js'
import './Cards.css'

// Si el valor empieza por un número ("1996 M€", "40,7 M€", "49"), lo separa en
// parte numérica + sufijo para poder animarlo. Si no (p. ej. "Isak (145 M€)"),
// devuelve null y el valor se muestra tal cual.
function parseNumeric(value) {
  if (typeof value === 'number') return { num: value, suffix: '', decimals: 0 }
  if (typeof value !== 'string') return null
  const m = value.match(/^(\d[\d.]*(?:,\d+)?)\s?(.*)$/)
  if (!m) return null
  const raw = m[1].replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')
  const num = Number(raw)
  if (!Number.isFinite(num)) return null
  const decimals = raw.includes('.') ? 1 : 0
  return { num, suffix: m[2] ? ` ${m[2]}` : '', decimals }
}

// Tarjeta de estadística/dato destacado (valor + etiqueta + pista opcional).
// `icon`   → icono temático (Icon) que aparece junto a la etiqueta y como marca
//            de agua grande en la esquina.
// `accent` → color de acento (CSS) para el icono y el borde superior.
// Los valores numéricos cuentan hacia arriba al entrar en pantalla.
export default function StatCard({ label, value, hint, icon, accent }) {
  const parsed = parseNumeric(value)
  const [ref, display] = useCountUp(parsed?.num ?? 0, { decimals: parsed?.decimals ?? 0 })
  const style = accent ? { '--accent-c': accent } : undefined

  const shown = parsed
    ? `${parsed.decimals > 0 ? String(display).replace('.', ',') : display}${parsed.suffix}`
    : value

  return (
    <div className={`card stat-card ${accent ? 'has-accent' : ''}`} style={style}>
      {icon && (
        <span className="stat-watermark" aria-hidden="true">
          <Icon name={icon} size={72} />
        </span>
      )}
      <div className="stat-label">
        {icon && <span className="stat-label-ico"><Icon name={icon} size={15} /></span>}
        {label}
      </div>
      <div className="stat-value num" ref={ref}>{shown}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}
