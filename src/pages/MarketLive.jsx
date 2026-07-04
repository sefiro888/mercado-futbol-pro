import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import DeadlineCountdown from '@/components/DeadlineCountdown.jsx'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { getAllPlayers, getAllClubs, getAllTransfers } from '@/lib/data.js'
import { formatDate } from '@/lib/format.js'
import './MarketLive.css'

function MiniCrest({ club }) {
  const [err, setErr] = useState(false)
  const url = club ? clubLogoUrl(club.id) : null
  if (url && !err) {
    return (
      <span className="mc-wrap" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <img src={url} alt="" onError={() => setErr(true)} className="mc-img" />
      </span>
    )
  }
  const letter = (club?.name ?? '?')[0]
  const bg = club?.primaryColor ?? '#555'
  return (
    <span className="mc-wrap" style={{ background: bg }}>
      <span className="mc-letter">{letter}</span>
    </span>
  )
}

const LEAGUES = ['Todas', 'LaLiga', 'Premier League', 'Serie A', 'Bundesliga', 'Ligue 1', 'Liga Portugal', 'Brasileirão']

function getPlayerName(transfer, players) {
  const p = players.find((pl) => pl.id === transfer.playerId || pl.slug === transfer.playerId)
  return p?.name ?? transfer.playerId ?? '—'
}

function getPlayerLink(transfer, players) {
  const p = players.find((pl) => pl.id === transfer.playerId || pl.slug === transfer.playerId)
  return p ? `/jugadores/${p.slug}` : null
}

function getClubLeague(clubId, clubs) {
  return clubs.find((c) => c.id === clubId)?.league ?? ''
}

function feeBadge(fee) {
  if (!fee || fee === 0) return { text: 'Libre', cls: 'fee-free' }
  if (fee >= 100) return { text: `${fee} M€`, cls: 'fee-big' }
  if (fee >= 50) return { text: `${fee} M€`, cls: 'fee-mid' }
  return { text: `${fee} M€`, cls: 'fee-low' }
}

function TransferRow({ transfer, players, clubs }) {
  const [imgErr, setImgErr] = useState(false)
  const player = players.find((p) => p.id === transfer.playerId || p.slug === transfer.playerId)
  const playerName = player?.name ?? transfer.playerId ?? '—'
  const playerLink = player ? `/jugadores/${player.slug}` : null
  const photoUrl = player && !imgErr ? playerPhotoUrl(player) : null

  const fromClub = clubs.find((c) => c.id === transfer.fromClubId)
  const toClub = clubs.find((c) => c.id === transfer.toClubId)

  const { text: feeText, cls: feeCls } = feeBadge(transfer.transferFee)

  return (
    <div className="tl-entry">
      <div className="tl-dot" />

      <div className="tl-card">
        {/* Jugador */}
        <div className="tl-player">
          <div className="tl-photo">
            {photoUrl ? (
              <img src={photoUrl} alt="" onError={() => setImgErr(true)} className="tl-photo-img" />
            ) : (
              <span className="tl-photo-init">
                {playerName.split(' ').slice(-1)[0]?.[0] ?? '?'}
              </span>
            )}
          </div>
          <div className="tl-player-info">
            {playerLink ? (
              <Link className="tl-player-name" to={playerLink}>{playerName}</Link>
            ) : (
              <span className="tl-player-name">{playerName}</span>
            )}
            {player?.position && <span className="tl-player-pos">{player.position}</span>}
          </div>
        </div>

        {/* Flecha de transferencia */}
        <div className="tl-clubs">
          {fromClub ? (
            <Link className="tl-club" to={`/clubes/${fromClub.id}`}>
              <MiniCrest club={fromClub} />
              <span className="tl-club-name">{fromClub.name}</span>
            </Link>
          ) : (
            <span className="tl-club">
              <MiniCrest club={null} />
              <span className="tl-club-name">{transfer.fromClubId ?? '—'}</span>
            </span>
          )}

          <span className="tl-arrow">→</span>

          {toClub ? (
            <Link className="tl-club" to={`/clubes/${toClub.id}`}>
              <MiniCrest club={toClub} />
              <span className="tl-club-name">{toClub.name}</span>
            </Link>
          ) : (
            <span className="tl-club">
              <MiniCrest club={null} />
              <span className="tl-club-name">{transfer.toClubId ?? '—'}</span>
            </span>
          )}
        </div>

        {/* Cuota */}
        <div className={`tl-fee ${feeCls}`}>{feeText}</div>
      </div>
    </div>
  )
}

function groupByDate(transfers) {
  const groups = {}
  for (const t of transfers) {
    const d = t.transferDate ?? 'Fecha desconocida'
    if (!groups[d]) groups[d] = []
    groups[d].push(t)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

export default function MarketLive() {
  const [leagueFilter, setLeagueFilter] = useState('Todas')
  const allTransfers = getAllTransfers()
  const players = getAllPlayers()
  const clubs = getAllClubs()

  const filtered = useMemo(() => {
    let ts = allTransfers.filter((t) => t.status === 'confirmado')
    if (leagueFilter !== 'Todas') {
      ts = ts.filter((t) => {
        const fromLeague = getClubLeague(t.fromClubId, clubs)
        const toLeague = getClubLeague(t.toClubId, clubs)
        return fromLeague === leagueFilter || toLeague === leagueFilter
      })
    }
    return ts
  }, [allTransfers, clubs, leagueFilter])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  const totalFee = filtered.reduce((s, t) => s + (t.transferFee ?? 0), 0)
  const biggestFee = filtered.reduce((max, t) => Math.max(max, t.transferFee ?? 0), 0)

  return (
    <div className="container section market-live">
      <div className="ml-hero">
        <div className="eyebrow">Mercado de fichajes 2026</div>
        <h1>Mercado en vivo</h1>
        <p className="ml-sub">Cronología de todos los fichajes confirmados este verano. Actualizado regularmente.</p>
      </div>

      {/* Cuenta atrás */}
      <div className="ml-countdown">
        <DeadlineCountdown />
      </div>

      {/* Stats rápidas */}
      <div className="ml-stats">
        <div className="ml-stat">
          <span className="ml-stat-val">{filtered.length}</span>
          <span className="ml-stat-label">Fichajes confirmados</span>
        </div>
        <div className="ml-stat">
          <span className="ml-stat-val">{Math.round(totalFee)} M€</span>
          <span className="ml-stat-label">Gasto total</span>
        </div>
        <div className="ml-stat">
          <span className="ml-stat-val">{biggestFee} M€</span>
          <span className="ml-stat-label">Mayor traspaso</span>
        </div>
        <div className="ml-stat">
          <span className="ml-stat-val">{groups.length}</span>
          <span className="ml-stat-label">Días con actividad</span>
        </div>
      </div>

      {/* Filtro por liga */}
      <div className="ml-filters">
        {LEAGUES.map((l) => (
          <button
            key={l}
            className={`chip ${leagueFilter === l ? 'chip-active' : ''}`}
            onClick={() => setLeagueFilter(l)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {groups.length === 0 ? (
        <p className="muted" style={{ padding: '2rem 0' }}>Sin fichajes para este filtro.</p>
      ) : (
        <div className="timeline">
          {groups.map(([date, transfers]) => (
            <div className="tl-group" key={date}>
              <div className="tl-date-label">
                <span>{date !== 'Fecha desconocida' ? formatDate(date) : date}</span>
              </div>
              <div className="tl-entries">
                {transfers.map((t) => (
                  <TransferRow key={t.id} transfer={t} players={players} clubs={clubs} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
