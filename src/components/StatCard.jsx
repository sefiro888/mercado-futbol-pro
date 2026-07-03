import Icon from './Icon.jsx'
import './Cards.css'

// Tarjeta de estadística/dato destacado (valor + etiqueta + pista opcional).
// `icon`   → icono temático (Icon) que aparece junto a la etiqueta y como marca
//            de agua grande en la esquina.
// `accent` → color de acento (CSS) para el icono y el borde superior.
export default function StatCard({ label, value, hint, icon, accent }) {
  const style = accent ? { '--accent-c': accent } : undefined
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
      <div className="stat-value num">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}
