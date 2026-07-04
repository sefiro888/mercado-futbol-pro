import { useState } from 'react'
import { Link } from 'react-router-dom'
import Crest from './Crest.jsx'
import Flag from './Flag.jsx'
import Icon from './Icon.jsx'
import { shortPosition, lineOf, LINE_COLOR } from '@/lib/positions.js'
import { PLAYER_STATUS, resolve } from '@/lib/taxonomy.js'
import { formatMoney } from '@/lib/format.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import './PlayerSquadCard.css'

// Nivel del jugador (1-3 estrellas) según su valor de mercado.
const tierOf = (v = 0) => (v >= 70 ? 3 : v >= 25 ? 2 : 1)

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
}

// Carta de jugador estilo cromo (FUT) interactivo y premium.
export default function PlayerSquadCard({ player, club }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const posColor = LINE_COLOR[lineOf(player.position)]
  const status = resolve(PLAYER_STATUS, player.status)
  const clubColor = club?.primaryColor || '#22c55e'
  const stars = tierOf(player.marketValue)
  const photoUrl = !imgError ? playerPhotoUrl(player) : null

  return (
    <Link
      to={`/jugadores/${player.slug}`}
      className={`squad-card tier-${stars}`}
      style={{ '--club-c': clubColor, '--pos-c': posColor }}
    >
      {/* Silueta de futbolista en el fondo para rellenar si no hay foto */}
      {!photoUrl && (
        <span className="sc-silhouette" aria-hidden="true">
          <Icon name="footballer" size={140} />
        </span>
      )}

      <div className="sc-top">
        <div className="sc-id">
          <span className="sc-number">{player.shirtNumber ?? '–'}</span>
          <span className="sc-pos">{shortPosition(player.position)}</span>
          <span className="sc-stars" aria-label={`Nivel ${stars}`}>
            {Array.from({ length: stars }).map((_, i) => (
              <Icon key={i} name="star" size={9} />
            ))}
          </span>
        </div>
        <div className="sc-flags">
          <Flag country={player.nationality} size={18} />
          {club && <Crest name={club.name} color={clubColor} size={20} logoUrl={clubLogoUrl(club.id)} />}
        </div>
      </div>

      <div className={`sc-avatar-container ${photoUrl && !imgLoaded ? 'img-skeleton' : ''}`}>
        {photoUrl ? (
          <img
            className="sc-photo-render"
            src={photoUrl}
            alt={player.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="sc-avatar-placeholder">
            <svg viewBox="0 0 100 100" className="sc-avatar-placeholder-svg">
              <defs>
                <linearGradient id="avatar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.16)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
                </linearGradient>
              </defs>
              <path
                d="M50,14 A14,14 0 1,0 50,42 A14,14 0 1,0 50,14 Z M22,76 C22,58 32,50 50,50 C68,50 78,58 78,76 Z"
                fill="url(#avatar-grad)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.2"
              />
            </svg>
            <span className="sc-avatar-placeholder-initials">{initials(player.name)}</span>
          </div>
        )}
      </div>

      <div className="sc-name" title={player.name}>{player.name}</div>

      <div className="sc-bottom">
        <span className="sc-value">{formatMoney(player.marketValue)}</span>
        <span className={`sc-status tone-${status.tone}`}>{status.label}</span>
      </div>
    </Link>
  )
}
