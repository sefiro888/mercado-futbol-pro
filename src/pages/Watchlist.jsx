import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getWatchlistItems, removeFromWatchlist } from '@/lib/watchlist.js'
import { getAllPlayers, getAllClubs } from '@/lib/data.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { clubLogoUrl } from '@/lib/logos.js'
import './Watchlist.css'

function PlayerItem({ slug, addedAt, allPlayers, onRemove }) {
  const [imgErr, setImgErr] = useState(false)
  const player = useMemo(() => allPlayers.find((p) => p.slug === slug), [allPlayers, slug])
  if (!player) return null
  const photoUrl = !imgErr ? playerPhotoUrl(player) : null
  const date = new Date(addedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

  return (
    <div className="wl-item">
      <Link to={`/jugadores/${player.slug}`} className="wl-item-link">
        <div className="wl-item-photo">
          {photoUrl
            ? <img src={photoUrl} alt="" onError={() => setImgErr(true)} className="wl-item-photo-img" />
            : <span className="wl-item-init">{player.name.split(' ').slice(-1)[0][0]}</span>
          }
        </div>
        <div className="wl-item-info">
          <span className="wl-item-name">{player.name}</span>
          <span className="wl-item-meta">{player.position} · {player.club?.name ?? player.clubId}</span>
        </div>
        <span className="wl-item-val">{player.marketValue ? `${player.marketValue} M€` : '—'}</span>
      </Link>
      <div className="wl-item-actions">
        <span className="wl-item-date">{date}</span>
        <button className="wl-remove" onClick={() => onRemove(slug)} title="Dejar de seguir">✕</button>
      </div>
    </div>
  )
}

function ClubItem({ id, addedAt, allClubs, onRemove }) {
  const [logoErr, setLogoErr] = useState(false)
  const club = useMemo(() => allClubs.find((c) => c.id === id), [allClubs, id])
  if (!club) return null
  const logoUrl = !logoErr ? clubLogoUrl(club.id) : null
  const date = new Date(addedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

  return (
    <div className="wl-item">
      <Link to={`/clubes/${club.id}`} className="wl-item-link">
        <div className="wl-item-photo" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {logoUrl
            ? <img src={logoUrl} alt="" onError={() => setLogoErr(true)} className="wl-item-photo-img wl-logo" />
            : <span className="wl-item-init" style={{ background: club.primaryColor ?? '#555' }}>{club.name[0]}</span>
          }
        </div>
        <div className="wl-item-info">
          <span className="wl-item-name">{club.name}</span>
          <span className="wl-item-meta">{club.league} · {club.country}</span>
        </div>
        <span className="wl-item-val">{club.squadValue ? `${club.squadValue} M€` : '—'}</span>
      </Link>
      <div className="wl-item-actions">
        <span className="wl-item-date">{date}</span>
        <button className="wl-remove" onClick={() => onRemove(id)} title="Dejar de seguir">✕</button>
      </div>
    </div>
  )
}

export default function Watchlist() {
  const [items, setItems] = useState(() => getWatchlistItems())
  const allPlayers = useMemo(() => getAllPlayers(), [])
  const allClubs = useMemo(() => getAllClubs(), [])

  useEffect(() => {
    function onWatchlistChange() {
      setItems(getWatchlistItems())
    }
    window.addEventListener('mfp-watchlist', onWatchlistChange)
    return () => window.removeEventListener('mfp-watchlist', onWatchlistChange)
  }, [])

  function handleRemove(id) {
    removeFromWatchlist(id)
    setItems(getWatchlistItems())
  }

  const entries = Object.entries(items).sort((a, b) => b[1].addedAt - a[1].addedAt)
  const players = entries.filter(([, v]) => v.type === 'player')
  const clubs   = entries.filter(([, v]) => v.type === 'club')
  const total   = entries.length

  return (
    <div className="watchlist page-fade-in">
      <div className="wl-hero">
        <p className="wl-eyebrow">PERSONAL</p>
        <h1>Mis seguidos</h1>
        <p className="wl-sub">
          {total > 0
            ? `${total} elemento${total !== 1 ? 's' : ''} guardado${total !== 1 ? 's' : ''}. Tus favoritos se conservan en este dispositivo.`
            : 'Todavía no sigues a ningún jugador ni club.'
          }
        </p>
      </div>

      {total === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">♡</div>
          <h2>Lista vacía</h2>
          <p>Pulsa el botón <strong>Seguir</strong> en el perfil de cualquier jugador o club para añadirlo aquí.</p>
          <div className="wl-empty-actions">
            <Link className="btn btn-primary" to="/jugadores">Ver jugadores</Link>
            <Link className="btn" to="/clubes">Ver clubes</Link>
          </div>
        </div>
      ) : (
        <>
          {players.length > 0 && (
            <section className="wl-section">
              <h2 className="wl-section-title">Jugadores <span className="wl-count">{players.length}</span></h2>
              <div className="wl-list">
                {players.map(([slug, meta]) => (
                  <PlayerItem key={slug} slug={slug} addedAt={meta.addedAt} allPlayers={allPlayers} onRemove={handleRemove} />
                ))}
              </div>
            </section>
          )}

          {clubs.length > 0 && (
            <section className="wl-section">
              <h2 className="wl-section-title">Clubes <span className="wl-count">{clubs.length}</span></h2>
              <div className="wl-list">
                {clubs.map(([id, meta]) => (
                  <ClubItem key={id} id={id} addedAt={meta.addedAt} allClubs={allClubs} onRemove={handleRemove} />
                ))}
              </div>
            </section>
          )}

          <button
            className="wl-clear"
            onClick={() => {
              entries.forEach(([id]) => removeFromWatchlist(id))
              setItems({})
            }}
          >
            Limpiar todo
          </button>
        </>
      )}
    </div>
  )
}
