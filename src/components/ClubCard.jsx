import { Link } from 'react-router-dom'
import Crest from './Crest.jsx'
import Flag from './Flag.jsx'
import Icon from './Icon.jsx'
import { formatMoney } from '@/lib/format.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { getClubHighlights } from '@/lib/data.js'
import './Cards.css'

// Tarjeta resumen de club para el listado /clubes y bloques de portada.
// Muestra escudo real + datos calculados + destacados (estrella, fichaje y venta récord).
// "Libre" para operaciones a coste 0; importe normal en el resto.
const fee = (v) => (v === 0 ? 'Libre' : formatMoney(v))

export default function ClubCard({ club, playerCount }) {
  const { starPlayer, recordSigning, recordSale } = getClubHighlights(club.id)

  return (
    <Link to={`/clubes/${club.slug}`} className="card interactive club-card">
      <div className="club-head">
        <Crest name={club.name} color={club.primaryColor} size={52} logoUrl={clubLogoUrl(club.id)} />
        <div>
          <h3>{club.name}</h3>
          <div className="club-sub">{club.league} · <Flag country={club.country} withName /></div>
        </div>
      </div>

      <div className="club-stats">
        <div className="cs">
          <div className="v num">{formatMoney(club.squadValue)}</div>
          <div className="l">Valor</div>
        </div>
        <div className="cs">
          <div className="v num">{club.averageAge}</div>
          <div className="l">Edad media</div>
        </div>
        <div className="cs">
          <div className="v num">{playerCount ?? club.playerIds.length}</div>
          <div className="l">Jugadores</div>
        </div>
      </div>

      {/* Destacados: estrella + récords de fichaje/venta */}
      <div className="club-highlights">
        {starPlayer && (
          <div className="hl-row">
            <span className="hl-ico hl-star"><Icon name="star" size={15} /></span>
            <span className="hl-label">Estrella</span>
            <span className="hl-name">{starPlayer.name}</span>
            <span className="hl-val num">{formatMoney(starPlayer.marketValue)}</span>
          </div>
        )}
        {recordSigning?.player && (
          <div className="hl-row">
            <span className="hl-ico hl-in"><Icon name="arrow-in" size={15} /></span>
            <span className="hl-label">Fichaje récord</span>
            <span className="hl-name">{recordSigning.player.name}</span>
            <span className="hl-val num">{fee(recordSigning.fee)}</span>
          </div>
        )}
        {recordSale?.player && (
          <div className="hl-row">
            <span className="hl-ico hl-out"><Icon name="arrow-out" size={15} /></span>
            <span className="hl-label">Venta récord</span>
            <span className="hl-name">{recordSale.player.name}</span>
            <span className="hl-val num">{fee(recordSale.fee)}</span>
          </div>
        )}
      </div>

      <div className="club-foot">
        <span><Icon name="stadium" size={14} /> {club.stadium}</span>
        <span><Icon name="coach" size={14} /> {club.coach}</span>
      </div>
    </Link>
  )
}
