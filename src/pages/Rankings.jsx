import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAllPlayers } from '@/lib/data.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import './Rankings.css'

const TODAY = new Date('2026-07-04')

function calcAge(birthDate) {
  if (!birthDate) return null
  const b = new Date(birthDate)
  let age = TODAY.getFullYear() - b.getFullYear()
  const m = TODAY.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && TODAY.getDate() < b.getDate())) age--
  return age
}

// Agrupa posiciones en categorías
const POS_GROUPS = [
  { key: 'todas',   label: 'Todas',         match: null },
  { key: 'por',     label: 'Porteros',      match: ['Portero'] },
  { key: 'lat',     label: 'Laterales',     match: ['Lateral derecho', 'Lateral izquierdo'] },
  { key: 'cb',      label: 'Centrales',     match: ['Defensa central', 'Líbero'] },
  { key: 'pivot',   label: 'Pivotes',       match: ['Pivote'] },
  { key: 'mc',      label: 'Centrocent.',   match: ['Mediocentro'] },
  { key: 'mp',      label: 'Medias puntas', match: ['Mediapunta'] },
  { key: 'ext',     label: 'Extremos',      match: ['Extremo derecho', 'Extremo izquierdo'] },
  { key: 'dc',      label: 'Delanteros',    match: ['Delantero centro', 'Punta'] },
]

const TABS = [
  { id: 'posicion',  label: 'Por posición' },
  { id: 'sub21',     label: 'Sub-21' },
  { id: 'libres',    label: 'Agentes libres' },
  { id: 'caducan',   label: 'Caducan 2027' },
]

function PlayerRow({ rank, player, extraCol }) {
  const [imgErr, setImgErr] = useState(false)
  const photoUrl = !imgErr ? playerPhotoUrl(player) : null

  return (
    <Link to={`/jugadores/${player.slug}`} className="rank-row">
      <span className={`rank-num ${rank <= 3 ? `rank-top rank-${rank}` : ''}`}>{rank}</span>
      <div className="rank-photo">
        {photoUrl
          ? <img src={photoUrl} alt="" onError={() => setImgErr(true)} className="rank-photo-img" />
          : <span className="rank-photo-init">{player.name.split(' ').slice(-1)[0][0]}</span>
        }
      </div>
      <div className="rank-info">
        <span className="rank-name">{player.name}</span>
        <span className="rank-meta">{player.position} · {player.club?.name ?? player.clubId}</span>
      </div>
      <div className="rank-extra">{extraCol(player)}</div>
      <div className="rank-val">
        {player.marketValue ? `${player.marketValue} M€` : '—'}
      </div>
    </Link>
  )
}

export default function Rankings() {
  const [tab, setTab] = useState('posicion')
  const [posGroup, setPosGroup] = useState('todas')
  const allPlayers = useMemo(() => getAllPlayers(), [])

  // ── Por posición ──────────────────────────────────────
  const byPosition = useMemo(() => {
    const group = POS_GROUPS.find((g) => g.key === posGroup)
    const base = group?.match
      ? allPlayers.filter((p) =>
          group.match.some((m) => p.position?.toLowerCase().includes(m.toLowerCase()))
        )
      : allPlayers
    return base
      .filter((p) => p.marketValue > 0)
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 25)
  }, [allPlayers, posGroup])

  // ── Sub-21 ────────────────────────────────────────────
  const sub21 = useMemo(() => {
    return allPlayers
      .filter((p) => {
        const age = calcAge(p.birthDate)
        return age !== null && age <= 21
      })
      .sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0))
      .slice(0, 25)
  }, [allPlayers])

  // ── Agentes libres ────────────────────────────────────
  const libres = useMemo(() => {
    return allPlayers
      .filter((p) => {
        if (!p.contractUntil) return false
        const d = new Date(p.contractUntil)
        return d <= TODAY
      })
      .sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0))
      .slice(0, 25)
  }, [allPlayers])

  // ── Caducan 2027 ──────────────────────────────────────
  const caducan = useMemo(() => {
    return allPlayers
      .filter((p) => p.contractUntil?.startsWith('2027'))
      .sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0))
      .slice(0, 25)
  }, [allPlayers])

  const EXTRA = {
    posicion: (p) => (
      <span className="rank-badge rank-pos">{p.nationality}</span>
    ),
    sub21: (p) => {
      const age = calcAge(p.birthDate)
      return <span className="rank-badge rank-age">{age} años</span>
    },
    libres: (p) => {
      const d = p.contractUntil ? new Date(p.contractUntil) : null
      const year = d ? d.getFullYear() : '—'
      return <span className="rank-badge rank-free">Libre · {year}</span>
    },
    caducan: (p) => (
      <span className="rank-badge rank-expire">{p.contractUntil?.slice(0, 7) ?? '—'}</span>
    ),
  }

  const LISTS = { posicion: byPosition, sub21, libres, caducan }
  const activeList = LISTS[tab]

  const EMPTY_MSG = {
    posicion: 'No hay jugadores con valor de mercado registrado.',
    sub21:    'No se encontraron jugadores sub-21 en el dataset.',
    libres:   'No hay agentes libres identificados.',
    caducan:  'No hay jugadores con contrato hasta 2027 registrado.',
  }

  return (
    <div className="rankings page-fade-in">
      <div className="rk-hero">
        <p className="rk-eyebrow">TEMPORADA 2025/26</p>
        <h1>Rankings</h1>
        <p className="rk-sub">Clasificaciones especiales: por posición, jóvenes talentos, agentes libres y contratos próximos a vencer.</p>
      </div>

      {/* Tabs */}
      <div className="rk-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`rk-tab ${tab === t.id ? 'rk-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtro de posición (solo en tab posicion) */}
      {tab === 'posicion' && (
        <div className="rk-pos-filter">
          {POS_GROUPS.map((g) => (
            <button
              key={g.key}
              className={`chip ${posGroup === g.key ? 'chip-active' : ''}`}
              onClick={() => setPosGroup(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Cabecera de columnas */}
      <div className="rk-list-head">
        <span className="rk-head-rank">#</span>
        <span className="rk-head-player">Jugador</span>
        <span className="rk-head-extra">
          {{ posicion: 'Nacion.', sub21: 'Edad', libres: 'Contrato', caducan: 'Vence' }[tab]}
        </span>
        <span className="rk-head-val">Valor</span>
      </div>

      {/* Lista */}
      <div className="rk-list">
        {activeList.length === 0 ? (
          <p className="rk-empty">{EMPTY_MSG[tab]}</p>
        ) : (
          activeList.map((p, i) => (
            <PlayerRow key={p.slug} rank={i + 1} player={p} extraCol={EXTRA[tab]} />
          ))
        )}
      </div>

      {/* Resumen del tab */}
      {activeList.length > 0 && (
        <p className="rk-footer">
          {activeList.length} jugadores · Valor medio:{' '}
          {Math.round(
            activeList.reduce((s, p) => s + (p.marketValue ?? 0), 0) / activeList.length
          )} M€
        </p>
      )}
    </div>
  )
}
