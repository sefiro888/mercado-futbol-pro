import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import ReliabilityBadge from './ReliabilityBadge.jsx'
import SourceBadge from './SourceBadge.jsx'
import Badge from './Badge.jsx'
import Icon from './Icon.jsx'
import Crest from './Crest.jsx'
import { RUMOUR_STATUS, OPERATION_TYPE, resolve } from '@/lib/taxonomy.js'
import { formatDate } from '@/lib/format.js'
import { getPlayerById, getClubById, getSources, getRumourOutcome } from '@/lib/data.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import PredictionBar from './PredictionBar.jsx'
import './RumourCard.css'

// Tarjeta de rumor contrastado. Incluye botón para desplegar las fuentes.
export default function RumourCard({ rumour }) {
  const [showSources, setShowSources] = useState(false)
  const [imgError, setImgError] = useState(false)

  const player = getPlayerById(rumour.playerId)
  const current = getClubById(rumour.currentClubId)
  const interested = getClubById(rumour.interestedClubId)
  const sources = getSources(rumour.sources)
  const operation = resolve(OPERATION_TYPE, rumour.operationType)
  const isRenewal = rumour.operationType === 'renovacion'
  // "Caliente": fiabilidad alta/oficial y operación todavía viva.
  const isHot = ['alta', 'oficial'].includes(rumour.reliability) && rumour.status !== 'descartado'
  // Veredicto contra la realidad: se cruza con los traspasos confirmados.
  const outcome = getRumourOutcome(rumour)

  const photoUrl = player && !imgError ? playerPhotoUrl(player) : null
  const clubColor = interested?.primaryColor || current?.primaryColor || '#a78bfa'

  return (
    <article 
      className={`card interactive rumour-card rel-${rumour.reliability || 'neutral'} ${isHot ? 'is-hot' : ''}`}
      style={{ '--club-c': clubColor }}
    >
      {/* Silueta o foto de fondo premium */}
      {photoUrl && (
        <img 
          className="rumour-player-bg" 
          src={photoUrl} 
          alt="" 
          aria-hidden="true" 
          onError={() => setImgError(true)} 
        />
      )}

      <div className="rumour-top">
        <div className="rumour-badges">
          <StatusBadge map={RUMOUR_STATUS} value={rumour.status} />
          <ReliabilityBadge level={rumour.reliability} />
          <span className="chip">{operation.label}</span>
          {outcome === 'cumplido' && <Badge tone="success">✓ Se cumplió</Badge>}
          {outcome === 'fallido' && <Badge tone="danger">✗ No se cumplió</Badge>}
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
        {current ? (
          <Link to={`/clubes/${current.slug}`} className="club-pill cell-link cell-club">
            <Crest name={current.name} color={current.primaryColor} size={18} logoUrl={clubLogoUrl(current.id)} />
            <span>{current.name}</span>
          </Link>
        ) : (
          <span className="club-pill">{rumour.currentClubName || rumour.currentClubId || '—'}</span>
        )}

        <span className="arrow" aria-hidden="true">{isRenewal ? '↻' : '→'}</span>

        {isRenewal ? (
          <span className="club-pill renewal-pill">Renovación</span>
        ) : interested ? (
          <Link to={`/clubes/${interested.slug}`} className="club-pill cell-link cell-club">
            <Crest name={interested.name} color={interested.primaryColor} size={18} logoUrl={clubLogoUrl(interested.id)} />
            <span>{interested.name}</span>
          </Link>
        ) : (
          <span className="club-pill">{rumour.interestedClubName || rumour.interestedClubId || '—'}</span>
        )}
      </div>

      <p className="rumour-summary muted">{rumour.summary}</p>

      <div className="rumour-foot">
        <PredictionBar rumourId={rumour.id} rumourStatus={rumour.status} />
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
