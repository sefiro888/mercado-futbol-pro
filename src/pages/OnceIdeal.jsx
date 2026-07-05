import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAllPlayers } from '@/lib/data.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import './OnceIdeal.css'

const STORAGE_KEY = 'mfp_once_ideal'

const LEAGUES = ['Todas las ligas', 'LaLiga', 'Premier League', 'Serie A', 'Bundesliga', 'Ligue 1', 'Liga Portugal', 'Brasileirão']

// Posiciones que se aceptan en cada slot
const SLOT_META = {
  por:  { label: 'POR', full: 'Portero',          match: ['Portero'] },
  rd:   { label: 'RD',  full: 'Lat. derecho',     match: ['Lateral derecho'] },
  rcb:  { label: 'DC',  full: 'Def. central',     match: ['Defensa central', 'Líbero'] },
  lcb:  { label: 'DC',  full: 'Def. central',     match: ['Defensa central', 'Líbero'] },
  li:   { label: 'LI',  full: 'Lat. izquierdo',   match: ['Lateral izquierdo'] },
  mcd:  { label: 'MCD', full: 'Medioc. def.',     match: ['Pivote', 'Mediocentro'] },
  mc:   { label: 'MC',  full: 'Mediocentro',      match: ['Mediocentro', 'Pivote', 'Mediapunta'] },
  mcl:  { label: 'MC',  full: 'Mediocentro',      match: ['Mediocentro', 'Pivote', 'Mediapunta'] },
  ed:   { label: 'ED',  full: 'Extremo der.',     match: ['Extremo derecho', 'Extremo izquierdo', 'Mediapunta'] },
  dc:   { label: 'DC',  full: 'Delantero',        match: ['Delantero centro', 'Punta', 'Extremo derecho', 'Extremo izquierdo'] },
  ei:   { label: 'EI',  full: 'Extremo izq.',     match: ['Extremo izquierdo', 'Extremo derecho', 'Mediapunta'] },
}

// Posiciones en el campo (x/y como %, arriba = ataque)
const SLOTS = [
  { id: 'ei',  x: 18, y: 13 },
  { id: 'dc',  x: 50, y: 10 },
  { id: 'ed',  x: 82, y: 13 },
  { id: 'mcl', x: 27, y: 37 },
  { id: 'mc',  x: 50, y: 35 },
  { id: 'mcd', x: 73, y: 37 },
  { id: 'li',  x: 12, y: 63 },
  { id: 'lcb', x: 34, y: 61 },
  { id: 'rcb', x: 66, y: 61 },
  { id: 'rd',  x: 88, y: 63 },
  { id: 'por', x: 50, y: 85 },
]

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function PlayerAvatar({ player, size = 56 }) {
  const [err, setErr] = useState(false)
  const url = player && !err ? playerPhotoUrl(player) : null
  if (url) {
    return (
      <img
        src={url}
        alt={player.name}
        onError={() => setErr(true)}
        className="slot-avatar-img"
        style={{ width: size, height: size }}
      />
    )
  }
  const initials = player
    ? player.name.split(' ').slice(-1)[0][0]
    : '+'
  return (
    <span className="slot-avatar-init" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </span>
  )
}

function PickerModal({ slotId, league, onPick, onClose }) {
  const [query, setQuery] = useState('')
  const allPlayers = useMemo(() => getAllPlayers(), [])
  const meta = SLOT_META[slotId]

  const filtered = useMemo(() => {
    const byPos = allPlayers.filter((p) =>
      meta.match.some((m) => p.position?.toLowerCase().includes(m.toLowerCase()))
    )
    const byLeague = league === 'Todas las ligas'
      ? byPos
      : byPos.filter((p) => p.league === league || p.club?.league === league)
    const byQ = query.trim().length < 2
      ? byLeague
      : byLeague.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.club?.name?.toLowerCase().includes(query.toLowerCase())
        )
    return byQ.sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0)).slice(0, 60)
  }, [allPlayers, meta, league, query])

  return (
    <div className="picker-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="picker-panel">
        <div className="picker-head">
          <div>
            <h3 className="picker-title">Seleccionar {meta.full}</h3>
            <p className="picker-sub">{filtered.length} jugadores disponibles</p>
          </div>
          <button className="picker-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <input
          className="picker-search"
          placeholder="Buscar jugador o club…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="picker-list">
          {filtered.map((p) => (
            <button key={p.slug} className="picker-item" onClick={() => onPick(slotId, p)}>
              <PlayerAvatar player={p} size={40} />
              <div className="picker-item-info">
                <span className="picker-item-name">{p.name}</span>
                <span className="picker-item-meta">{p.position} · {p.club?.name ?? p.clubId}</span>
              </div>
              <span className="picker-item-val">
                {p.marketValue ? `${p.marketValue} M€` : '—'}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="picker-empty">No hay jugadores que coincidan</p>
          )}
        </div>
      </div>
    </div>
  )
}

function PitchSlot({ slot, player, onClick }) {
  const meta = SLOT_META[slot.id]
  const filled = !!player

  return (
    <button
      className={`pitch-slot ${filled ? 'pitch-slot--filled' : ''}`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
      onClick={() => onClick(slot.id)}
      title={meta.full}
    >
      <div className="pitch-slot-avatar">
        {filled
          ? <PlayerAvatar player={player} size={52} />
          : <span className="pitch-slot-plus">+</span>
        }
      </div>
      <span className="pitch-slot-label">{meta.label}</span>
      {filled && (
        <span className="pitch-slot-name">
          {player.name.split(' ').slice(-1)[0]}
        </span>
      )}
    </button>
  )
}

export default function OnceIdeal() {
  const [selections, setSelections] = useState(() => loadSaved())
  const [league, setLeague] = useState('Todas las ligas')
  const [picking, setPicking] = useState(null)

  const allPlayers = useMemo(() => getAllPlayers(), [])

  const getPlayer = useCallback(
    (slotId) => {
      const slug = selections[slotId]
      return slug ? allPlayers.find((p) => p.slug === slug) ?? null : null
    },
    [selections, allPlayers]
  )

  function handlePick(slotId, player) {
    const next = { ...selections, [slotId]: player.slug }
    setSelections(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    setPicking(null)
  }

  function handleReset() {
    setSelections({})
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const filled = SLOTS.filter((s) => selections[s.id]).length
  const totalValue = SLOTS.reduce((acc, s) => {
    const p = getPlayer(s.id)
    return acc + (p?.marketValue ?? 0)
  }, 0)

  return (
    <div className="once-ideal page-fade-in">
      <div className="oi-hero">
        <p className="oi-eyebrow">TEMPORADA 2025/26</p>
        <h1>Once Ideal</h1>
        <p className="oi-sub">Elige a los mejores jugadores y construye tu equipo del año.</p>
      </div>

      {/* Controles */}
      <div className="oi-controls">
        <div className="oi-league-tabs">
          {LEAGUES.map((l) => (
            <button
              key={l}
              className={`chip ${l === league ? 'chip-active' : ''}`}
              onClick={() => setLeague(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="oi-actions">
          {filled > 0 && (
            <button className="btn-ghost" onClick={handleReset}>Reiniciar</button>
          )}
        </div>
      </div>

      {/* Stats del once */}
      {filled > 0 && (
        <div className="oi-stats">
          <div className="oi-stat">
            <span className="oi-stat-val">{filled}<span className="oi-stat-total">/11</span></span>
            <span className="oi-stat-label">Jugadores</span>
          </div>
          <div className="oi-stat">
            <span className="oi-stat-val">{totalValue.toLocaleString('es-ES')} M€</span>
            <span className="oi-stat-label">Valor total</span>
          </div>
          <div className="oi-stat">
            <span className="oi-stat-val">{filled === 11 ? '✓' : `${11 - filled} restantes`}</span>
            <span className="oi-stat-label">{filled === 11 ? 'Completo' : 'Faltan'}</span>
          </div>
        </div>
      )}

      {/* Campo */}
      <div className="pitch-wrap">
        <div className="pitch">
          {/* Líneas del campo */}
          <div className="pitch-line pitch-center-circle" />
          <div className="pitch-line pitch-center-h" />
          <div className="pitch-line pitch-penalty-top" />
          <div className="pitch-line pitch-penalty-bot" />
          <div className="pitch-line pitch-small-area-top" />
          <div className="pitch-line pitch-small-area-bot" />

          {/* Formación 4-3-3 */}
          <div className="pitch-label">4-3-3</div>

          {SLOTS.map((slot) => (
            <PitchSlot
              key={slot.id}
              slot={slot}
              player={getPlayer(slot.id)}
              onClick={setPicking}
            />
          ))}
        </div>
      </div>

      {/* Lista de jugadores seleccionados */}
      {filled > 0 && (
        <section className="oi-roster">
          <h2>Tu once</h2>
          <div className="oi-roster-grid">
            {SLOTS.filter((s) => selections[s.id]).map((slot) => {
              const p = getPlayer(slot.id)
              if (!p) return null
              const meta = SLOT_META[slot.id]
              return (
                <Link key={slot.id} to={`/jugadores/${p.slug}`} className="oi-card">
                  <div className="oi-card-photo">
                    <PlayerAvatar player={p} size={48} />
                  </div>
                  <div className="oi-card-info">
                    <span className="oi-card-pos">{meta.label}</span>
                    <span className="oi-card-name">{p.name}</span>
                    <span className="oi-card-club">{p.club?.name ?? p.clubId}</span>
                  </div>
                  <span className="oi-card-val">{p.marketValue ? `${p.marketValue} M€` : '—'}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Modal de selección */}
      {picking && (
        <PickerModal
          slotId={picking}
          league={league}
          onPick={handlePick}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  )
}
