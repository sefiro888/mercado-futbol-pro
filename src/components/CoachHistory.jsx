import coachesData from '@/data/coaches.json'
import './CoachHistory.css'

function netLabel(spend, income) {
  const net = income - spend
  if (Math.abs(net) < 5) return { text: 'Equilibrado', cls: 'net-zero' }
  if (net > 0) return { text: `+${net} M€ ingresado`, cls: 'net-pos' }
  return { text: `${net} M€ gastado`, cls: 'net-neg' }
}

function formatPeriod(from, to) {
  const fYear = from ? from.slice(0, 4) : '?'
  const tYear = to ? to.slice(0, 4) : 'hoy'
  if (fYear === tYear) return fYear
  return `${fYear} – ${tYear}`
}

function CoachCard({ coach, index }) {
  const { text: netText, cls: netCls } = netLabel(coach.spend ?? 0, coach.income ?? 0)
  const isCurrent = !coach.to

  return (
    <div className={`coach-card ${isCurrent ? 'coach-card--current' : ''}`}>
      <div className="coach-index">{index + 1}</div>

      <div className="coach-avatar">
        <span className="coach-initials">
          {coach.name.split(' ').filter(Boolean).slice(-1)[0]?.[0] ?? '?'}
        </span>
        {isCurrent && <span className="coach-badge-now">HOY</span>}
      </div>

      <div className="coach-info">
        <div className="coach-name">{coach.name}</div>
        <div className="coach-period">{formatPeriod(coach.from, coach.to)}</div>
        {coach.note && <div className="coach-note">{coach.note}</div>}
      </div>

      <div className="coach-stats">
        <div className="coach-stat">
          <span className="coach-stat-label">Gasto</span>
          <span className="coach-stat-val red">{coach.spend ?? 0} M€</span>
        </div>
        <div className="coach-stat">
          <span className="coach-stat-label">Ingresos</span>
          <span className="coach-stat-val green">{coach.income ?? 0} M€</span>
        </div>
        <div className={`coach-net ${netCls}`}>{netText}</div>
      </div>

      {coach.trophies && coach.trophies.length > 0 && (
        <div className="coach-trophies">
          {coach.trophies.map((t) => (
            <span className="coach-trophy-pill" key={t}>🏆 {t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CoachHistory({ clubId }) {
  const history = coachesData[clubId]

  if (!history || history.length === 0) {
    return <p className="muted">Historial de entrenadores no disponible.</p>
  }

  const totalSpend = history.reduce((s, c) => s + (c.spend ?? 0), 0)
  const totalIncome = history.reduce((s, c) => s + (c.income ?? 0), 0)
  const totalNet = totalIncome - totalSpend

  return (
    <div className="coach-history">
      <div className="coach-summary">
        <div className="cs-item">
          <span className="cs-label">Entrenadores</span>
          <span className="cs-val">{history.length}</span>
        </div>
        <div className="cs-item">
          <span className="cs-label">Gasto total</span>
          <span className="cs-val red">{totalSpend} M€</span>
        </div>
        <div className="cs-item">
          <span className="cs-label">Ingresos totales</span>
          <span className="cs-val green">{totalIncome} M€</span>
        </div>
        <div className="cs-item">
          <span className="cs-label">Balance neto</span>
          <span className={`cs-val ${totalNet >= 0 ? 'green' : 'red'}`}>
            {totalNet >= 0 ? '+' : ''}{totalNet} M€
          </span>
        </div>
      </div>

      <div className="coach-list">
        {history.map((coach, i) => (
          <CoachCard key={`${coach.name}-${coach.from}`} coach={coach} index={i} />
        ))}
      </div>
    </div>
  )
}
