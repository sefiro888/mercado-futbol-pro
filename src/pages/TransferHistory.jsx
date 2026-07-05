import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { playerPhotoUrl } from '@/lib/photos.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { getAllPlayers, getAllClubs, getAllTransfers } from '@/lib/data.js'
import { formatDate } from '@/lib/format.js'
import './TransferHistory.css'

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

const SEASONS = ['Todas', '2026/27', '2025/26', '2024/25', '2023/24', '2022/23', '2021/22', '2020/21', '2019/20', '2018/19', '2017/18']

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
    <div className="th-entry">
      <div className="th-dot" />

      <div className="th-card">
        {/* Jugador */}
        <div className="th-player">
          <div className="th-photo">
            {photoUrl ? (
              <img src={photoUrl} alt="" onError={() => setImgErr(true)} className="th-photo-img" />
            ) : (
              <span className="th-photo-init">
                {playerName.split(' ').slice(-1)[0]?.[0] ?? '?'}
              </span>
            )}
          </div>
          <div className="th-player-info">
            {playerLink ? (
              <Link className="th-player-name" to={playerLink}>{playerName}</Link>
            ) : (
              <span className="th-player-name">{playerName}</span>
            )}
            {player?.position && <span className="th-player-pos">{player.position}</span>}
          </div>
        </div>

        {/* Flecha de transferencia */}
        <div className="th-clubs">
          {fromClub ? (
            <Link className="th-club" to={`/clubes/${fromClub.id}`}>
              <MiniCrest club={fromClub} />
              <span className="th-club-name">{fromClub.name}</span>
            </Link>
          ) : (
            <span className="th-club">
              <MiniCrest club={null} />
              <span className="th-club-name">{transfer.fromClubId ?? transfer.fromClubName ?? '—'}</span>
            </span>
          )}

          <span className="th-arrow">→</span>

          {toClub ? (
            <Link className="th-club" to={`/clubes/${toClub.id}`}>
              <MiniCrest club={toClub} />
              <span className="th-club-name">{toClub.name}</span>
            </Link>
          ) : (
            <span className="th-club">
              <MiniCrest club={null} />
              <span className="th-club-name">{transfer.toClubId ?? transfer.toClubName ?? '—'}</span>
            </span>
          )}
        </div>

        {/* Cuota */}
        <div className={`th-fee ${feeCls}`}>{feeText}</div>
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

export default function TransferHistory() {
  const [seasonFilter, setSeasonFilter] = useState('Todas')
  const allTransfers = getAllTransfers()
  const players = getAllPlayers()
  const clubs = getAllClubs()

  const filtered = useMemo(() => {
    let ts = allTransfers.filter((t) => t.status === 'confirmado')
    if (seasonFilter !== 'Todas') {
      ts = ts.filter((t) => t.season === seasonFilter)
    }
    return ts
  }, [allTransfers, seasonFilter])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  const totalFee = filtered.reduce((s, t) => s + (t.transferFee ?? 0), 0)
  const biggestFee = filtered.reduce((max, t) => Math.max(max, t.transferFee ?? 0), 0)

  return (
    <div className="container section transfer-history">
      <div className="th-hero">
        <div className="eyebrow">Archivo de traspasos</div>
        <h1>Historial de fichajes</h1>
        <p className="th-sub">Todos los traspasos confirmados de los últimos 10 años. Datos detallados, clubs, cuantías reales.</p>
      </div>

      {/* Stats rápidas */}
      <div className="th-stats">
        <div className="th-stat">
          <span className="th-stat-val">{filtered.length}</span>
          <span className="th-stat-label">Fichajes en total</span>
        </div>
        <div className="th-stat">
          <span className="th-stat-val">{Math.round(totalFee)} M€</span>
          <span className="th-stat-label">Inversión total</span>
        </div>
        <div className="th-stat">
          <span className="th-stat-val">{biggestFee} M€</span>
          <span className="th-stat-label">Mayor traspaso</span>
        </div>
        <div className="th-stat">
          <span className="th-stat-val">{groups.length}</span>
          <span className="th-stat-label">Fechas con movimiento</span>
        </div>
      </div>

      {/* Filtro por temporada */}
      <div className="th-filters">
        {SEASONS.map((s) => (
          <button
            key={s}
            className={`chip ${seasonFilter === s ? 'chip-active' : ''}`}
            onClick={() => setSeasonFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {groups.length === 0 ? (
        <p className="muted" style={{ padding: '2rem 0' }}>Sin fichajes para este filtro.</p>
      ) : (
        <div className="timeline">
          {groups.map(([date, transfers]) => (
            <div className="th-group" key={date}>
              <div className="th-date-label">
                <span>{date !== 'Fecha desconocida' ? formatDate(date) : date}</span>
              </div>
              <div className="th-entries">
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
