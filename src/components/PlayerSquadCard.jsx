import { Link } from 'react-router-dom'
import Crest from './Crest.jsx'
import Flag from './Flag.jsx'
import Icon from './Icon.jsx'
import { shortPosition, lineOf, LINE_COLOR } from '@/lib/positions.js'
import { PLAYER_STATUS, resolve } from '@/lib/taxonomy.js'
import { formatMoney } from '@/lib/format.js'
import { clubLogoUrl } from '@/lib/logos.js'
import './PlayerSquadCard.css'

// Nivel del jugador (1-3 estrellas) según su valor de mercado.
const tierOf = (v = 0) => (v >= 70 ? 3 : v >= 25 ? 2 : 1)

// Carta de jugador estilo cromo (FUT). Se tiñe con el color del club.
// Muestra la foto real del jugador si existe (player.photo); si no, una silueta
// de futbolista con las iniciales — nunca el escudo del club.
export default function PlayerSquadCard({ player, club }) {
  const posColor = LINE_COLOR[lineOf(player.position)]
  const status = resolve(PLAYER_STATUS, player.status)
  const clubColor = club?.primaryColor || '#22c55e'
  const stars = tierOf(player.marketValue)

  return (
    <Link
      to={`/jugadores/${player.slug}`}
      className={`squad-card tier-${stars}`}
      style={{ '--club-c': clubColor, '--pos-c': posColor }}
    >
      {/* Silueta de futbolista de fondo (representa al jugador). */}
      <span className="sc-silhouette" aria-hidden="true">
        <Icon name="footballer" size={140} />
      </span>

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

      <div className="sc-avatar">
        {player.photo ? (
          <img className="sc-photo" src={player.photo} alt={player.name} loading="lazy" />
        ) : (
          <Crest name={player.name} variant="avatar" size={74} color={clubColor} />
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
