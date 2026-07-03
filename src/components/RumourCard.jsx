import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import ReliabilityBadge from './ReliabilityBadge.jsx'
import SourceBadge from './SourceBadge.jsx'
import Icon from './Icon.jsx'
import { RUMOUR_STATUS, OPERATION_TYPE, resolve } from '@/lib/taxonomy.js'
import { formatDate } from '@/lib/format.js'
import { getPlayerById, getClubById, getSources } from '@/lib/data.js'
import './RumourCard.css'

// Tarjeta de rumor contrastado. Incluye botón para desplegar las fuentes.
export default function RumourCard({ rumour }) {
  const [showSources, setShowSources] = useState(false)

  const player = getPlayerById(rumour.playerId)
  const current = getClubById(rumour.currentClubId)
  const interested = getClubById(rumour.interestedClubId)
  const sources = getSources(rumour.sources)
  const operation = resolve(OPERATION_TYPE, rumour.operationType)
  const isRenewal = rumour.operationType === 'renovacion'
  // "Caliente": fiabilidad alta/oficial y operación todavía viva.
  const isHot = ['alta', 'oficial'].includes(rumour.reliability) && rumour.status !== 'descartado'

  return (
    <article className={`card rumour-card ${isHot ? 'is-hot' : ''}`}>
      <div className="rumour-top">
        <div className="rumour-badges">
          <StatusBadge map={RUMOUR_STATUS} value={rumour.status} />
          <ReliabilityBadge level={rumour.reliability} />
          <span className="chip">{operation.label}</span>
        </div>
        <span className="rumour-date dim">Act. {formatDate(rumour.lastUpdated)}</span>
      </div>

      <h3 className="rumour-title">
        {isHot && (
          <span className="hot-flame" title="Rumor caliente">
            <Icon name="flame" size={18} />
          </span>
        )}{' '}
        {player ? (
          <Link to={`/jugadores/${player.slug}`}>{player.name}</Link>
        ) : (
          rumour.playerId
        )}
      </h3>

      <div className="rumour-route">
        <span className="club-pill">{current?.name ?? '—'}</span>
        <span className="arrow" aria-hidden="true">{isRenewal ? '↻' : '→'}</span>
        <span className="club-pill">{isRenewal ? 'Renovación' : interested?.name ?? '—'}</span>
      </div>

      <p className="rumour-summary muted">{rumour.summary}</p>

      <div className="rumour-foot">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowSources((v) => !v)}
          aria-expanded={showSources}
        >
          {showSources ? 'Ocultar fuentes' : `Ver fuentes (${sources.length})`}
        </button>
      </div>

      {showSources && (
        <div className="rumour-sources row-wrap">
          {sources.length > 0
            ? sources.map((s) => <SourceBadge key={s.id} source={s} />)
            : <span className="dim">Sin fuentes registradas.</span>}
        </div>
      )}
    </article>
  )
}
