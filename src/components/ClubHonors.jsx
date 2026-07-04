import honorsData from '@/data/honors.json'
import './ClubHonors.css'

const TROPHY_META = {
  liga:      { icon: '🏆', color: '#f59e0b', priority: 1 },
  champions: { icon: '⭐', color: '#facc15', priority: 2 },
  copa:      { icon: '🥇', color: '#818cf8', priority: 3 },
  mundial:   { icon: '🌍', color: '#34d399', priority: 4 },
  europa:    { icon: '🏅', color: '#f87171', priority: 5 },
  supercopa: { icon: '🎖️', color: '#94a3b8', priority: 6 },
}

export default function ClubHonors({ clubId }) {
  const honors = honorsData[clubId] || {}
  const entries = Object.entries(honors)
    .filter(([, v]) => v && v.count > 0)
    .sort((a, b) => (TROPHY_META[a[0]]?.priority ?? 9) - (TROPHY_META[b[0]]?.priority ?? 9))

  if (entries.length === 0) {
    return (
      <div className="honors-empty">
        <p className="muted">Palmarés no disponible para este club.</p>
      </div>
    )
  }

  return (
    <div className="honors-grid">
      {entries.map(([key, trophy]) => {
        const meta = TROPHY_META[key] || { icon: '🏆', color: '#a78bfa', priority: 9 }
        return (
          <div className="honors-card" key={key} style={{ '--trophy-color': meta.color }}>
            <div className="honors-icon">{meta.icon}</div>
            <div className="honors-count">{trophy.count}</div>
            <div className="honors-label">{trophy.label}</div>
            <div className="honors-last">Último: {trophy.last}</div>
          </div>
        )
      })}
    </div>
  )
}

/** Strip compacto para el hero del club */
export function HonorsStrip({ clubId }) {
  const honors = honorsData[clubId] || {}
  const entries = Object.entries(honors)
    .filter(([, v]) => v && v.count > 0)
    .sort((a, b) => (TROPHY_META[a[0]]?.priority ?? 9) - (TROPHY_META[b[0]]?.priority ?? 9))

  if (entries.length === 0) return null

  return (
    <div className="honors-strip">
      {entries.map(([key, trophy]) => {
        const meta = TROPHY_META[key] || { icon: '🏆', color: '#a78bfa' }
        return (
          <span className="honors-pill" key={key} title={`${trophy.label}: ${trophy.count} (último ${trophy.last})`}>
            <span className="honors-pill-icon">{meta.icon}</span>
            <span className="honors-pill-count">{trophy.count}</span>
            <span className="honors-pill-label">{trophy.label}</span>
          </span>
        )
      })}
    </div>
  )
}
