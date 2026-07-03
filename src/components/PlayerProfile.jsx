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
import { formatMoney, formatHeight, formatDate } from '@/lib/format.js'
import { clubLogoUrl } from '@/lib/logos.js'
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
function buildClubHistory(player) {
  const history = player.transferHistory || []
  if (history.length === 0) return [getClubById(player.currentClubId)].filter(Boolean)
  const ordered = [...history].sort((a, b) => Number(a.season) - Number(b.season))
  const clubs = [getClubById(ordered[0].fromClubId)]
  ordered.forEach((h) => clubs.push(getClubById(h.toClubId)))
  return clubs.filter(Boolean)
}

export default function PlayerProfile({ player }) {
  const club = getClubById(player.currentClubId)
  const news = getNewsByPlayer(player.id)
  const rumours = getRumoursByPlayer(player.id)
  const transfers = getTransfersByPlayer(player.id)
  const clubHistory = buildClubHistory(player)

  // Fuentes agregadas (traspasos + rumores), sin duplicados.
  const sourceIds = [
    ...new Set([
      ...transfers.flatMap((t) => t.sources || []),
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

  return (
    <div className="container section">
      {/* Hero */}
      <header className="profile-hero" style={{ '--hero-color': club?.primaryColor }}>
        {club && clubLogoUrl(club.id) && (
          <img className="hero-watermark" src={clubLogoUrl(club.id)} alt="" aria-hidden="true" loading="lazy" />
        )}
        <div className="profile-hero-inner">
          <Crest name={player.name} variant="avatar" size={84} color={club?.primaryColor} />
          <div>
            <div className="eyebrow">{player.position}</div>
            <h1>{player.name}</h1>
            <div className="hero-sub">
              {club ? (
                <Link to={`/clubes/${club.slug}`} className="hero-club">
                  <Crest name={club.name} color={club.primaryColor} size={20} logoUrl={clubLogoUrl(club.id)} />
                  {club.name}
                </Link>
              ) : 'Sin club'} · dorsal {player.shirtNumber ?? '—'}
            </div>
            <div className="hero-tags">
              <StatusBadge map={PLAYER_STATUS} value={player.status} />
              <span className="chip"><Flag country={player.nationality} /> {player.nationality}</span>
              <span className="chip">Valor: {formatMoney(player.marketValue)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tarjetas destacadas */}
      <div className="grid grid-4">
        <StatCard label="Valor de mercado" value={formatMoney(player.marketValue)} hint={club ? `${ordinal} del equipo` : null} icon="money" accent="#22c55e" />
        <StatCard label="Ranking en el club" value={`${ordinal}`} hint={`de ${rankInfo.total} jugadores`} icon="trophy" accent="#fbbf24" />
        <StatCard label="Contrato" value={contractYear ?? '—'} hint={yearsLeft != null ? `${yearsLeft} año${yearsLeft === 1 ? '' : 's'} restante${yearsLeft === 1 ? '' : 's'}` : null} icon="calendar" accent="#38bdf8" />
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
          <DG k="Club actual">{club?.name ?? '—'}</DG>
          <DG k="Dorsal">{player.shirtNumber ?? '—'}</DG>
          <DG k="Contrato hasta">{formatDate(player.contractUntil)}</DG>
          <DG k="Valor de mercado">{formatMoney(player.marketValue)}</DG>
          <DG k="Partidos">{stats.appearances ?? '—'}</DG>
          <DG k="Goles">{stats.goals ?? '—'}</DG>
          <DG k="Asistencias">{stats.assists ?? '—'}</DG>
          <DG k="Minutos">{stats.minutes ?? '—'}</DG>
        </div>
      </Section>

      {/* Evolución de valor de mercado */}
      <Section title="Evolución del valor de mercado">
        <MarketValueChart history={player.marketValueHistory} />
      </Section>

      {/* Historial de clubes */}
      <Section title="Historial de clubes">
        <div className="row-wrap">
          {clubHistory.map((c, i) => (
            <span key={`${c.id}-${i}`} className="row" style={{ gap: 6 }}>
              <Link to={`/clubes/${c.slug}`} className="club-pill">{c.name}</Link>
              {i < clubHistory.length - 1 && <span className="dim">→</span>}
            </span>
          ))}
        </div>
      </Section>

      {/* Historial de transferencias */}
      <Section
        title="Historial de transferencias"
        empty={(player.transferHistory || []).length === 0 ? 'Producto de cantera, sin traspasos previos.' : null}
      >
        {(player.transferHistory || []).length > 0 && (
          <ul className="timeline">
            {[...player.transferHistory]
              .sort((a, b) => Number(b.season) - Number(a.season))
              .map((h, i) => {
                const from = getClubById(h.fromClubId)
                const to = getClubById(h.toClubId)
                return (
                  <li key={i}>
                    <span className="tl-season">{h.season}</span>
                    <span className="tl-main">{from?.name ?? '—'} → {to?.name ?? '—'}</span>
                    <span className="tl-fee num">{formatMoney(h.fee)}</span>
                  </li>
                )
              })}
          </ul>
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
