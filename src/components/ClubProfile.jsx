import { useState } from 'react'
import { Link } from 'react-router-dom'
import Crest from './Crest.jsx'
import StatCard from './StatCard.jsx'
import StatusBadge from './StatusBadge.jsx'
import TransferTable from './TransferTable.jsx'
import RumourCard from './RumourCard.jsx'
import NewsCard from './NewsCard.jsx'
import Flag from './Flag.jsx'
import Icon from './Icon.jsx'
import BestEleven from './BestEleven.jsx'
import TopTransfers from './TopTransfers.jsx'
import PlayerSquadCard from './PlayerSquadCard.jsx'
import { PLAYER_STATUS } from '@/lib/taxonomy.js'
import { lineOf, shortPosition, LINE_COLOR } from '@/lib/positions.js'
import { formatMoney, formatHeight, formatDate } from '@/lib/format.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import {
  getPlayersByClub,
  getTransfersByClub,
  getRumoursByClub,
  getNewsByClub,
  getClubTopTransfers,
} from '@/lib/data.js'
import ClubHonors, { HonorsStrip } from './ClubHonors.jsx'
import CoachHistory from './CoachHistory.jsx'
import './Profile.css'

// Badge de posición coloreado por demarcación.
function PosBadge({ position }) {
  return (
    <span className="pos-badge" style={{ color: LINE_COLOR[lineOf(position)] }}>
      <span className="pos-dot" style={{ background: LINE_COLOR[lineOf(position)] }} />
      {shortPosition(position)}
    </span>
  )
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
}

function PlayerTableRow({ p }) {
  const [imgError, setImgError] = useState(false)
  const photoUrl = !imgError ? playerPhotoUrl(p) : null

  return (
    <tr>
      <td data-label="Jugador">
        <div className="cell-player">
          {photoUrl ? (
            <div className="cell-avatar-wrap">
              <img className="cell-avatar" src={photoUrl} alt="" onError={() => setImgError(true)} />
            </div>
          ) : (
            <div className="cell-avatar-placeholder">
              {initials(p.name)}
            </div>
          )}
          <Link className="cell-link" to={`/jugadores/${p.slug}`}>{p.name}</Link>
        </div>
      </td>
      <td data-label="Dorsal" className="num">{p.shirtNumber ?? '—'}</td>
      <td data-label="Posición"><PosBadge position={p.position} /></td>
      <td data-label="Edad" className="num">{p.age}</td>
      <td data-label="Nacionalidad"><Flag country={p.nationality} withName /></td>
      <td data-label="Valor" className="num strong">{formatMoney(p.marketValue)}</td>
      <td data-label="Contrato" className="nowrap">{p.contractUntil ? formatDate(p.contractUntil) : '—'}</td>
      <td data-label="Pie">{p.dominantFoot}</td>
      <td data-label="Altura" className="num">{formatHeight(p.height)}</td>
      <td data-label="Estado"><StatusBadge map={PLAYER_STATUS} value={p.status} /></td>
    </tr>
  )
}

// Tabla de plantilla del club (ordenada por dorsal, con posición coloreada).
function SquadTable({ players }) {
  if (players.length === 0) return <p className="muted">Plantilla no disponible.</p>
  const sorted = [...players].sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99))
  return (
    <div className="table-wrap table-wrap-cards">
      <table className="data cards-sm">
        <thead>
          <tr>
            <th>Jugador</th>
            <th className="ta-right">Dorsal</th>
            <th>Posición</th>
            <th className="ta-right">Edad</th>
            <th>Nacionalidad</th>
            <th className="ta-right">Valor</th>
            <th>Contrato</th>
            <th>Pie</th>
            <th className="ta-right">Altura</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <PlayerTableRow key={p.id} p={p} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TABS = [
  { id: 'plantilla', label: 'Plantilla' },
  { id: 'once', label: 'Once ideal' },
  { id: 'mercado', label: 'Mercado' },
  { id: 'palmares', label: 'Palmarés' },
  { id: 'actualidad', label: 'Actualidad' },
]

export default function ClubProfile({ club }) {
  const [tab, setTab] = useState('plantilla')
  const [squadView, setSquadView] = useState('cards')

  const players = getPlayersByClub(club.id)
  const sortedSquad = [...players].sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99))
  const transfers = getTransfersByClub(club.id)
  const incoming = transfers.filter((t) => t.toClubId === club.id)
  const outgoing = transfers.filter((t) => t.fromClubId === club.id)
  const rumours = getRumoursByClub(club.id).filter((r) => r.status !== 'descartado')
  const news = getNewsByClub(club.id)
  const { signings, sales } = getClubTopTransfers(club.id, 10)

  return (
    <div className="container section" style={{ '--hero-color': club.primaryColor }}>
      {/* Hero */}
      <header className="profile-hero">
        {clubLogoUrl(club.id) && (
          <img className="hero-watermark" src={clubLogoUrl(club.id)} alt="" aria-hidden="true" loading="lazy" />
        )}
        <div className="profile-hero-inner">
          <Crest name={club.name} color={club.primaryColor} size={84} logoUrl={clubLogoUrl(club.id)} />
          <div>
            <div className="eyebrow">{club.league}</div>
            <h1>{club.name}</h1>
            <div className="hero-sub">
              <Flag country={club.country} withName /> · <Icon name="stadium" size={15} /> {club.stadium} · <Icon name="coach" size={15} /> {club.coach}
            </div>
            <HonorsStrip clubId={club.id} />
          </div>
        </div>
      </header>

      {/* Estadísticas clave */}
      <div className="grid grid-4">
        <StatCard label="Valor de plantilla" value={formatMoney(club.squadValue)} icon="briefcase" accent="#22c55e" />
        <StatCard label="Edad media" value={club.averageAge} hint="años" icon="calendar" accent="#38bdf8" />
        <StatCard label="Jugadores" value={players.length} icon="jersey" accent="#a78bfa" />
        <StatCard label="Rumores activos" value={rumours.length} icon="flame" accent="#fbbf24" />
      </div>

      {/* Pestañas */}
      <nav className="club-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Contenido de la pestaña activa */}
      <div className="club-tab-body">
        {tab === 'plantilla' && (
          <section className="profile-section">
            <div className="section-head">
              <h2>Plantilla {new Date().getFullYear()}</h2>
              <div className="view-toggle">
                <button className={squadView === 'cards' ? 'active' : ''} onClick={() => setSquadView('cards')}>Cromos</button>
                <button className={squadView === 'table' ? 'active' : ''} onClick={() => setSquadView('table')}>Tabla</button>
              </div>
            </div>
            {squadView === 'cards' ? (
              <div className="squad-grid">
                {sortedSquad.map((p) => (
                  <PlayerSquadCard key={p.id} player={p} club={club} />
                ))}
              </div>
            ) : (
              <SquadTable players={players} />
            )}
          </section>
        )}

        {tab === 'once' && (
          <section className="profile-section">
            <div className="section-head"><h2>Once ideal</h2></div>
            <BestEleven club={club} squad={players} />
          </section>
        )}

        {tab === 'mercado' && (
          <>
            <section className="profile-section">
              <div className="section-head"><h2>Récords de traspasos</h2></div>
              <TopTransfers signings={signings} sales={sales} />
            </section>
            {incoming.length > 0 && (
              <section className="profile-section">
                <div className="section-head"><h2>Fichajes recientes</h2></div>
                <TransferTable transfers={incoming} showSortSelect={false} />
              </section>
            )}
            {outgoing.length > 0 && (
              <section className="profile-section">
                <div className="section-head"><h2>Salidas recientes</h2></div>
                <TransferTable transfers={outgoing} showSortSelect={false} />
              </section>
            )}
          </>
        )}

        {tab === 'palmares' && (
          <>
            <section className="profile-section">
              <div className="section-head"><h2>Palmarés histórico</h2></div>
              <ClubHonors clubId={club.id} />
            </section>
            <section className="profile-section">
              <div className="section-head"><h2>Historial de entrenadores</h2></div>
              <CoachHistory clubId={club.id} />
            </section>
          </>
        )}

        {tab === 'actualidad' && (
          <>
            <section className="profile-section">
              <div className="section-head"><h2>Rumores activos</h2></div>
              {rumours.length > 0 ? (
                <div className="grid grid-auto">
                  {rumours.map((r) => <RumourCard key={r.id} rumour={r} />)}
                </div>
              ) : (
                <p className="muted">No hay rumores activos.</p>
              )}
            </section>
            <section className="profile-section">
              <div className="section-head">
                <h2>Noticias relacionadas</h2>
                <Link className="link-more" to="/noticias">Ver todas →</Link>
              </div>
              {news.length > 0 ? (
                <div className="grid grid-auto">
                  {news.map((n) => <NewsCard key={n.id} item={n} />)}
                </div>
              ) : (
                <p className="muted">Sin noticias relacionadas.</p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
