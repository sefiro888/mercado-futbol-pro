import { useState } from 'react'
import { Link } from 'react-router-dom'
import Crest from './Crest.jsx'
import Section from './Section.jsx'
import StatCard from './StatCard.jsx'
import StatusBadge from './StatusBadge.jsx'
import SourceBadge from './SourceBadge.jsx'
import NewsCard from './NewsCard.jsx'
import RumourCard from './RumourCard.jsx'
import MarketValueChart from './MarketValueChart.jsx'
import Flag from './Flag.jsx'
import { PLAYER_STATUS } from '@/lib/taxonomy.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { buildRadarAxes } from '@/lib/profileRadar.js'
import RadarChart from './RadarChart.jsx'
import WatchlistButton from './WatchlistButton.jsx'
import ShareCardButton from './ShareCardButton.jsx'
import ShareButton from './ShareButton.jsx'
import { formatMoney, formatDate, formatHeight } from '@/lib/format.js'
import PlayerCard from './PlayerCard.jsx'
import {
  getClubById,
  getNewsByPlayer,
  getRumoursByPlayer,
  getTransfersByPlayer,
  getSources,
  getPlayerRankInClub,
  getSimilarPlayers,
} from '@/lib/data.js'
import './Profile.css'

// Item de la cuadrícula de datos clave.
function DG({ k, children }) {
  return (
    <div className="dg-item">
      <div className="dg-k">{k}</div>
      <div className="dg-v">{children}</div>
    </div>
  )
}

// Deriva el listado de clubes por los que ha pasado a partir del historial.
// Genera un historial estadístico detallado por temporada (trayectoria e historial de goles).
/*
function buildCareerStats(player) {
  const stats = player.stats || {}
  const history = player.transferHistory || []
  const position = (player.position || '').toLowerCase()
  
  const currentClub = getClubById(player.currentClubId)
  const currentClubName = currentClub ? currentClub.name : 'Agente libre'
  
  const rows = [
    {
      season: '2026/27',
      club: currentClubName,
      clubId: player.currentClubId,
      appearances: stats.appearances ?? 28,
      goals: stats.goals ?? (position.includes('delantero') || position.includes('extremo') ? 14 : position.includes('medio') ? 4 : 1),
      assists: stats.assists ?? (position.includes('delantero') || position.includes('extremo') ? 5 : position.includes('medio') ? 8 : 2),
      minutes: stats.minutes ?? (stats.appearances ? stats.appearances * 78 : 2100)
    }
  ]

  const sortedTransfers = [...history].sort((a, b) => Number(b.season) - Number(a.season))
  
  sortedTransfers.forEach((t, index) => {
    const fromClub = getClubById(t.fromClubId)
    const clubName = fromClub ? fromClub.name : t.fromClubName || 'Desconocido'
    
    let baseApps = 30 - index * 2
    if (baseApps < 10) baseApps = 12
    
    let baseGoals = 0
    let baseAssists = 0
    
    if (position.includes('delantero') || position.includes('extremo')) {
      baseGoals = Math.max(1, Math.round(t.fee ? t.fee / 8 : 6))
      baseAssists = Math.max(1, Math.round(baseApps / 6))
    } else if (position.includes('mediapunta') || position.includes('medio')) {
      baseGoals = Math.max(0, Math.round(t.fee ? t.fee / 15 : 3))
      baseAssists = Math.max(1, Math.round(t.fee ? t.fee / 10 : 5))
    } else if (position.includes('defensa') || position.includes('lateral')) {
      baseGoals = Math.max(0, Math.round(baseApps / 15))
      baseAssists = Math.max(0, Math.round(baseApps / 12))
    }
    
    if (position.includes('portero')) {
      baseGoals = 0
      baseAssists = 0
    }
    
    const prevSeasonYear = Number(t.season)
    const seasonLabel = `${prevSeasonYear - 1}/${String(prevSeasonYear).slice(-2)}`
    
    rows.push({
      season: seasonLabel,
      club: clubName,
      clubId: t.fromClubId,
      appearances: baseApps,
      goals: baseGoals,
      assists: baseAssists,
      minutes: baseApps * 82
    })
  })
  
  if (history.length === 0 && player.currentClubId) {
    const currentYear = 2026
    for (let i = 1; i <= 2; i++) {
      const year = currentYear - i
      const seasonLabel = `${year}/${String(year + 1).slice(-2)}`
      
      let baseApps = 32 - i * 4
      let baseGoals = position.includes('delantero') || position.includes('extremo') ? 10 - i * 2 : 2
      let baseAssists = position.includes('medio') ? 7 - i : 3
      if (position.includes('portero')) {
        baseGoals = 0
        baseAssists = 0
      }
      
      rows.push({
        season: seasonLabel,
        club: currentClubName,
        clubId: player.currentClubId,
        appearances: baseApps,
        goals: baseGoals,
        assists: baseAssists,
        minutes: baseApps * 85
      })
    }
  }

  return rows
}

*/
function verifiedSeasonFromDate(date) {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  const start = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1
  return `${start}/${String(start + 1).slice(-2)}`
}

function buildRegisteredTransferHistory(player, registeredTransfers) {
  const manual = (player.transferHistory || []).map((t, index) => ({
    id: `manual-${index}`,
    date: t.date || null,
    season: t.season || verifiedSeasonFromDate(t.date) || 'Sin fecha',
    fromClubId: t.fromClubId,
    fromClubName: t.fromClubName,
    toClubId: t.toClubId,
    toClubName: t.toClubName,
    fee: t.fee,
    status: t.status || 'confirmado',
    sources: t.sources || t.sourceIds || [],
  }))
  const registered = registeredTransfers.map((t) => ({
    id: t.id,
    date: t.transferDate || null,
    season: verifiedSeasonFromDate(t.transferDate) || 'Sin fecha',
    fromClubId: t.fromClubId,
    fromClubName: t.fromClubName,
    toClubId: t.toClubId,
    toClubName: t.toClubName,
    fee: t.transferFee,
    status: t.status,
    sources: t.sources || [],
  }))
  const seen = new Set()

  return [...manual, ...registered]
    .filter((t) => {
      const key = `${t.date || t.season}-${t.fromClubId || t.fromClubName}-${t.toClubId || t.toClubName}-${t.fee}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => {
      if (a.date && b.date) return new Date(b.date) - new Date(a.date)
      return String(b.season).localeCompare(String(a.season), 'es')
    })
}

function buildVerifiedClubHistory(player, transferHistory) {
  const ordered = [...transferHistory].sort((a, b) => {
    if (a.date && b.date) return new Date(a.date) - new Date(b.date)
    return String(a.season).localeCompare(String(b.season), 'es')
  })
  const ids = []

  ordered.forEach((h) => {
    if (h.fromClubId) ids.push(h.fromClubId)
    if (h.toClubId) ids.push(h.toClubId)
  })
  if (player.currentClubId) ids.push(player.currentClubId)

  return ids
    .filter((id, index) => id && ids.indexOf(id) === index)
    .map(getClubById)
    .filter(Boolean)
}

function buildVerifiedCareerStats(player) {
  const explicitRows = player.seasonStats || player.statsBySeason || []
  const rows = explicitRows.map((row, index) => ({
    id: row.id || `${row.season || 'season'}-${index}`,
    season: row.season || 'Sin temporada',
    competition: row.competition || 'Todas',
    club: row.club || getClubById(row.clubId)?.name || getClubById(player.currentClubId)?.name || 'Sin club',
    clubId: row.clubId || player.currentClubId,
    appearances: row.appearances,
    goals: row.goals,
    assists: row.assists,
    minutes: row.minutes,
    sources: row.sources || row.sourceIds || [],
  }))
  const stats = player.stats || {}
  const hasExplicitSummary = ['appearances', 'goals', 'assists', 'minutes'].some((key) => stats[key] != null)

  if (rows.length === 0 && hasExplicitSummary) {
    rows.push({
      id: 'summary-stats',
      season: stats.season || '2026/27',
      competition: stats.competition || 'Todas',
      club: getClubById(player.currentClubId)?.name || 'Sin club',
      clubId: player.currentClubId,
      appearances: stats.appearances,
      goals: stats.goals,
      assists: stats.assists,
      minutes: stats.minutes,
      sources: stats.sources || stats.sourceIds || [],
    })
  }

  return rows
}

function formatTransferFee(fee) {
  if (fee == null) return 'No disp.'
  return fee === 0 ? 'Libre' : formatMoney(fee)
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
}

export default function PlayerProfile({ player }) {
  const club = getClubById(player.currentClubId)
  const news = getNewsByPlayer(player.id)
  const rumours = getRumoursByPlayer(player.id)
  const transfers = getTransfersByPlayer(player.id)
  const transferHistory = buildRegisteredTransferHistory(player, transfers)
  const clubHistory = buildVerifiedClubHistory(player, transferHistory)
  const careerStats = buildVerifiedCareerStats(player)
  const [imgError, setImgError] = useState(false)
  const photoUrl = !imgError ? playerPhotoUrl(player) : null

  // Fuentes agregadas (traspasos + rumores), sin duplicados.
  const sourceIds = [
    ...new Set([
      ...transfers.flatMap((t) => t.sources || []),
      ...transferHistory.flatMap((t) => t.sources || []),
      ...careerStats.flatMap((row) => row.sources || []),
      ...rumours.flatMap((r) => r.sources || []),
    ]),
  ]
  const sources = getSources(sourceIds)
  const stats = player.stats || {}

  // Datos derivados (reales) para enriquecer la ficha.
  const rankInfo = getPlayerRankInClub(player)
  const similar = getSimilarPlayers(player, 4)
  const contractYear = player.contractUntil ? new Date(player.contractUntil).getFullYear() : null
  const yearsLeft = contractYear ? Math.max(0, contractYear - new Date().getFullYear()) : null
  const valuePct = rankInfo.topValue ? Math.round((player.marketValue / rankInfo.topValue) * 100) : 0
  const ordinal = rankInfo.rank === 1 ? '1º' : `${rankInfo.rank}º`
  const radar = buildRadarAxes(player, club)

  return (
    <div className="container section">
      {/* Hero */}
      <header className="profile-hero" style={{ '--hero-color': club?.primaryColor }}>
        {club && clubLogoUrl(club.id) && (
          <img className="hero-watermark" src={clubLogoUrl(club.id)} alt="" aria-hidden="true" loading="lazy" />
        )}
        {photoUrl && (
          <img className="hero-player-watermark" src={photoUrl} alt="" aria-hidden="true" loading="lazy" onError={() => setImgError(true)} />
        )}
        <div className="profile-hero-inner">
          {photoUrl ? (
            <div className="profile-hero-photo-wrap" style={{ borderColor: club?.primaryColor }}>
              <img className="profile-hero-photo" src={photoUrl} alt={player.name} onError={() => setImgError(true)} />
            </div>
          ) : (
            <div className="profile-hero-placeholder-avatar">
              <svg viewBox="0 0 100 100" className="profile-placeholder-svg">
                <defs>
                  <linearGradient id="profile-avatar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.03)" />
                  </linearGradient>
                </defs>
                <path
                  d="M50,14 A14,14 0 1,0 50,42 A14,14 0 1,0 50,14 Z M22,76 C22,58 32,50 50,50 C68,50 78,58 78,76 Z"
                  fill="url(#profile-avatar-grad)"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1.2"
                />
              </svg>
              <span className="profile-placeholder-initials">{initials(player.name)}</span>
            </div>
          )}
          <div>
            <div className="eyebrow">{player.position}</div>
            <h1>{player.name}</h1>
            <div className="hero-sub">
              {club ? (
                <Link to={`/clubes/${club.slug}`} className="hero-club">
                  <Crest name={club.name} color={club.primaryColor} size={20} logoUrl={clubLogoUrl(club.id)} />
                  {club.name}
                </Link>
              ) : (
                <span className="free-agent-badge">Agente libre</span>
              )} · dorsal {player.shirtNumber ?? '—'}
            </div>
            <div className="hero-tags">
              <StatusBadge map={PLAYER_STATUS} value={player.status} />
              <span className="chip"><Flag country={player.nationality} /> {player.nationality}</span>
              <span className="chip">Valor: {formatMoney(player.marketValue)}</span>
              <WatchlistButton id={player.slug} type="player" name={player.name} size="sm" />
              <ShareCardButton player={player} size="sm" />
              <ShareButton path={`/jugadores/${player.slug}`} title={`${player.name} — Mercado Fútbol Pro`} text={`Consulta el perfil de ${player.name} en Mercado Fútbol Pro`} size="sm" label="Compartir ficha" />
            </div>
          </div>
        </div>
      </header>

      {/* Tarjetas destacadas */}
      <div className="grid grid-4">
        <StatCard label="Valor de mercado" value={formatMoney(player.marketValue)} hint={club ? `${ordinal} del equipo` : 'N/A'} icon="briefcase" accent="#22c55e" />
        <StatCard label="Ranking en el club" value={club ? `${ordinal}` : 'N/A'} hint={club ? `de ${rankInfo.total} jugadores` : 'Agente libre'} icon="trophy" accent="#fbbf24" />
        <StatCard label="Contrato" value={contractYear ?? '—'} hint={yearsLeft != null ? `${yearsLeft} año${yearsLeft === 1 ? '' : 's'} restante${yearsLeft === 1 ? '' : 's'}` : 'Sin contrato'} icon="calendar" accent="#38bdf8" />
        <StatCard label="Edad" value={player.age} hint={`${formatHeight(player.height)} · ${player.dominantFoot}`} icon="person" accent="#a78bfa" />
      </div>

      {/* Peso del jugador en el valor de la plantilla */}
      {club && (
        <div className="value-weight">
          <div className="vw-head">
            <span>Peso en la plantilla del {club.name}</span>
            <span className="num">{valuePct}%</span>
          </div>
          <div className="vw-bar">
            <div className="vw-fill" style={{ width: `${valuePct}%` }} />
          </div>
          <p className="dim vw-note">Comparado con el jugador más valioso del club ({formatMoney(rankInfo.topValue)}).</p>
        </div>
      )}

      {/* Radar de perfil: percentiles REALES frente a su demarcación */}
      <div className="card radar-card">
        <h3 className="radar-title">Perfil frente a su demarcación</h3>
        <RadarChart axes={radar.axes} color={club?.primaryColor || 'var(--brand)'} />
        <p className="dim radar-note">
          Percentiles calculados sobre los {radar.peers} jugadores de su misma línea en la base
          de datos (valor, edad, contrato, peso en plantilla y rol). Sin atributos inventados.
        </p>
      </div>

      <div className="data-audit-grid">
        <div className="data-audit-card">
          <span>Historial de fichajes</span>
          <strong>{transferHistory.length}</strong>
          <small>{transferHistory.length ? 'movimientos registrados' : 'pendiente de completar'}</small>
        </div>
        <div className="data-audit-card">
          <span>Estadísticas reales</span>
          <strong>{careerStats.length ? `${careerStats.length}` : 'Pendiente'}</strong>
          <small>{careerStats.length ? 'temporadas cargadas' : 'sin fuente verificada'}</small>
        </div>
        <div className="data-audit-card">
          <span>Fuentes enlazadas</span>
          <strong>{sources.length}</strong>
          <small>{sources.length ? 'referencias disponibles' : 'sin referencias'}</small>
        </div>
      </div>

      {/* Datos personales */}
      <Section title="Datos personales">
        <div className="data-grid">
          <DG k="Nacimiento">{formatDate(player.birthDate)}</DG>
          <DG k="Edad">{player.age} años</DG>
          <DG k="Nacionalidad"><Flag country={player.nationality} withName /></DG>
          <DG k="Altura">{formatHeight(player.height)}</DG>
          <DG k="Pie dominante">{player.dominantFoot}</DG>
        </div>
      </Section>

      {/* Datos deportivos */}
      <Section title="Datos deportivos">
        <div className="data-grid">
          <DG k="Posición">{player.position}</DG>
          <DG k="Club actual">{club?.name ?? 'Agente libre'}</DG>
          <DG k="Dorsal">{player.shirtNumber ?? '—'}</DG>
          <DG k="Contrato hasta">{formatDate(player.contractUntil)}</DG>
          <DG k="Valor de mercado">{formatMoney(player.marketValue)}</DG>
          <DG k="Partidos">{stats.appearances ?? '—'}</DG>
          <DG k="Goles">{stats.goals ?? '—'}</DG>
          <DG k="Asistencias">{stats.assists ?? '—'}</DG>
          <DG k="Minutos">{stats.minutes ?? '—'}</DG>
        </div>
      </Section>

      {/* Estadisticas verificadas por temporada */}
      <Section
        title="Estadísticas por temporada"
        empty={careerStats.length === 0 ? 'Sin estadísticas verificadas por temporada. Añade seasonStats con fuente real para mostrarlas aquí.' : null}
      >
        {careerStats.length > 0 && (
        <div className="table-wrap">
          <table className="data player-career-table">
            <thead>
              <tr>
                <th>Temporada</th>
                <th>Competición</th>
                <th>Club</th>
                <th className="ta-right">PJ</th>
                <th className="ta-right">Goles</th>
                <th className="ta-right">Asistencias</th>
                <th className="ta-right">Minutos</th>
                <th>Fuentes</th>
              </tr>
            </thead>
            <tbody>
              {careerStats.map((row) => (
                <tr key={row.id}>
                  <td data-label="Temporada" className="strong">{row.season}</td>
                  <td data-label="Competición">{row.competition}</td>
                  <td data-label="Club">
                    {row.clubId ? (
                      <Link to={`/clubes/${getClubById(row.clubId)?.slug}`} className="cell-link cell-club">
                        <Crest name={row.club} color={getClubById(row.clubId)?.primaryColor} size={16} logoUrl={clubLogoUrl(row.clubId)} />
                        {row.club}
                      </Link>
                    ) : (
                      <span className="dim">{row.club}</span>
                    )}
                  </td>
                  <td data-label="PJ" className="num ta-right">{row.appearances}</td>
                  <td data-label="Goles" className="num ta-right strong text-gradient">{row.goals}</td>
                  <td data-label="Asistencias" className="num ta-right">{row.assists}</td>
                  <td data-label="Minutos" className="num ta-right dim">{row.minutes}'</td>
                  <td data-label="Fuentes">
                    <div className="row-wrap">
                      {getSources(row.sources).length
                        ? getSources(row.sources).map((s) => <SourceBadge key={s.id} source={s} />)
                        : <span className="dim">Pendiente</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Section>

      {/* Evolución de valor de mercado */}
      <Section
        title="Evolución del valor de mercado"
        empty={!player.marketValueHistory?.length ? 'Sin histórico de valor verificado. Se mostrará cuando exista una serie real con fuente.' : null}
      >
        {player.marketValueHistory?.length > 0 && <MarketValueChart history={player.marketValueHistory} clubColor={club?.primaryColor} />}
      </Section>

      {/* Historial de clubes */}
      <Section title="Historial de clubes">
        <div className="club-history-timeline">
          {clubHistory.map((c, i) => (
            <div key={`${c.id}-${i}`} className="club-history-node">
              <Link to={`/clubes/${c.slug}`} className="club-history-pill" style={{ '--club-c': c.primaryColor || 'var(--brand)' }}>
                <Crest name={c.name} color={c.primaryColor} size={20} logoUrl={clubLogoUrl(c.id)} />
                <span>{c.name}</span>
              </Link>
              {i < clubHistory.length - 1 && (
                <span className="club-history-connector" aria-hidden="true">→</span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Historial de transferencias */}
      <Section
        title="Historial de transferencias"
        empty={transferHistory.length === 0 ? 'Sin movimientos registrados en la base. Pendiente de completar con fuentes reales.' : null}
      >
        {transferHistory.length > 0 && (
          <div className="visual-timeline-container">
            <div className="visual-timeline">
              {transferHistory
                .map((h) => {
                  const from = getClubById(h.fromClubId)
                  const to = getClubById(h.toClubId)
                  const itemSources = getSources(h.sources)
                  return (
                    <div key={h.id} className="vt-item" style={{ '--to-club-c': to?.primaryColor || 'var(--brand)' }}>
                      <div className="vt-season-badge">{h.date ? formatDate(h.date) : h.season}</div>
                      
                      <div className="vt-clubs">
                        {from ? (
                          <Link to={`/clubes/${from.slug}`} className="vt-club-link">
                            <Crest name={from.name} color={from.primaryColor} size={24} logoUrl={clubLogoUrl(from.id)} />
                            <span className="vt-club-name">{from.name}</span>
                          </Link>
                        ) : (
                          <span className="vt-club-text">{h.fromClubName || 'Libre'}</span>
                        )}
                        
                        <span className="vt-arrow">→</span>
                        
                        {to ? (
                          <Link to={`/clubes/${to.slug}`} className="vt-club-link vt-club-to">
                            <Crest name={to.name} color={to.primaryColor} size={24} logoUrl={clubLogoUrl(to.id)} />
                            <span className="vt-club-name">{to.name}</span>
                          </Link>
                        ) : (
                          <span className="vt-club-text">{h.toClubName || 'Sin club'}</span>
                        )}
                        <div className="vt-sources">
                          {itemSources.length
                            ? itemSources.map((s) => <SourceBadge key={s.id} source={s} />)
                            : <span className="dim">Fuente pendiente</span>}
                        </div>
                      </div>
                      
                      <div className="vt-fee-badge num">{formatTransferFee(h.fee)}</div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </Section>

      {/* Rumores relacionados */}
      <Section title="Rumores relacionados" empty={rumours.length === 0 ? 'Sin rumores activos.' : null}>
        {rumours.length > 0 && (
          <div className="grid grid-auto">
            {rumours.map((r) => <RumourCard key={r.id} rumour={r} />)}
          </div>
        )}
      </Section>

      {/* Noticias relacionadas */}
      <Section title="Noticias relacionadas" empty={news.length === 0 ? 'Sin noticias relacionadas.' : null}>
        {news.length > 0 && (
          <div className="grid grid-auto">
            {news.map((n) => <NewsCard key={n.id} item={n} />)}
          </div>
        )}
      </Section>

      {/* Jugadores similares */}
      <Section title="Jugadores similares" empty={similar.length === 0 ? 'Sin jugadores similares.' : null}>
        {similar.length > 0 && (
          <div className="grid grid-auto">
            {similar.map((p) => <PlayerCard key={p.id} player={p} />)}
          </div>
        )}
      </Section>

      {/* Bloque de fuentes */}
      <Section title="Fuentes" empty={sources.length === 0 ? 'Sin fuentes registradas.' : null}>
        {sources.length > 0 && (
          <div className="row-wrap">
            {sources.map((s) => <SourceBadge key={s.id} source={s} />)}
          </div>
        )}
      </Section>
    </div>
  )
}
