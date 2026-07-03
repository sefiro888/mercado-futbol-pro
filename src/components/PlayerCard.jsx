import { useState } from 'react'
import { Link } from 'react-router-dom'
import Crest from './Crest.jsx'
import StatusBadge from './StatusBadge.jsx'
import Flag from './Flag.jsx'
import { PLAYER_STATUS } from '@/lib/taxonomy.js'
import { formatMoney } from '@/lib/format.js'
import { getClubById } from '@/lib/data.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import './Cards.css'

// Calcula la tendencia reciente del valor (último vs. penúltimo registro).
function valueTrend(history = []) {
  if (history.length < 2) return 0
  return history[history.length - 1].value - history[history.length - 2].value
}

// Tarjeta resumen de jugador para el listado /jugadores y bloques de tendencia.
export default function PlayerCard({ player }) {
  const club = getClubById(player.currentClubId)
  const trend = valueTrend(player.marketValueHistory)
  const [imgError, setImgError] = useState(false)
  const photoUrl = player && !imgError ? playerPhotoUrl(player) : null

  return (
    <Link to={`/jugadores/${player.slug}`} className="card interactive player-card">
      <div className="pc-head">
        {photoUrl ? (
          <div className="pc-avatar-wrap" style={{ borderColor: club?.primaryColor || 'var(--brand)' }}>
            <img className="pc-avatar" src={photoUrl} alt="" onError={() => setImgError(true)} />
          </div>
        ) : (
          <Crest name={player.name} variant="avatar" size={48} color={club?.primaryColor || 'var(--brand)'} />
        )}
        <div>
          <h3>{player.name}</h3>
          <div className="pc-sub">
            {player.position}
            {club ? (
              <span className="pc-club">
                <Crest name={club.name} color={club.primaryColor} size={16} logoUrl={clubLogoUrl(club.id)} />
                {club.name}
              </span>
            ) : (
              <span className="pc-club free-agent-tag">Agente libre</span>
            )}
          </div>
        </div>
      </div>

      <div className="pc-grid">
        <div><span className="k">Edad: </span>{player.age}</div>
        <div><span className="k">Dorsal: </span>{player.shirtNumber ?? '—'}</div>
        <div><span className="k">País: </span><Flag country={player.nationality} withName /></div>
        <div><StatusBadge map={PLAYER_STATUS} value={player.status} /></div>
      </div>

      <div className="pc-value">
        <span className="k">Valor de mercado</span>
        <span className="pc-value-right">
          <span className="v num">{formatMoney(player.marketValue)}</span>
          {trend !== 0 && (
            <span
              className={`pc-trend num ${trend > 0 ? 'trend-up' : 'trend-down'}`}
              title={trend > 0 ? 'En alza' : 'A la baja'}
            >
              {trend > 0 ? '▲' : '▼'} {trend > 0 ? '+' : ''}{formatMoney(Math.abs(trend))}
            </span>
          )}
        </span>
      </div>
    </Link>
  )
}
