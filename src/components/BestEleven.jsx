import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Crest from './Crest.jsx'
import { FORMATION_433, buildEleven, candidatesForSlot, lineOf, LINE_COLOR } from '@/lib/positions.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { formatMoney } from '@/lib/format.js'
import { getVotes, submitVote, getMyEleven, getVoteCount } from '@/lib/votes.js'
import './BestEleven.css'

const lastName = (name = '') => name.split(' ').slice(-1)[0]

// Convierte {slotId: player} → {slotId: playerId}
const toIds = (eleven) =>
  Object.fromEntries(Object.entries(eleven).map(([k, p]) => [k, p?.id]))

export default function BestEleven({ club, squad }) {
  const [mode, setMode] = useState('top') // 'top' | 'voted' | 'build'
  const [votes, setVotes] = useState({})
  const [voteCount, setVoteCount] = useState(0)
  const [activeSlot, setActiveSlot] = useState(null)
  const [justVoted, setJustVoted] = useState(false)
  const byId = useMemo(() => Object.fromEntries(squad.map((p) => [p.id, p])), [squad])

  // Once tipo (mayor valor) y once más votado (por recuento de votos).
  const topEleven = useMemo(() => buildEleven(squad), [squad])
  const votedEleven = useMemo(
    () => buildEleven(squad, (p) => (votes[p.id] || 0) * 1000 + (p.marketValue || 0)),
    [squad, votes],
  )

  // Selección personal del usuario (modo "crea el tuyo"). Arranca del once tipo.
  const [myPick, setMyPick] = useState(() => toIds(topEleven))

  useEffect(() => {
    let alive = true
    ;(async () => {
      const v = await getVotes(club.id)
      const count = await getVoteCount(club.id)
      const saved = getMyEleven(club.id)
      if (!alive) return
      setVotes(v)
      setVoteCount(count)
      if (saved) {
        // Reconstruye {slotId: playerId} respetando el orden de la formación.
        const map = {}
        FORMATION_433.forEach((slot, i) => {
          if (saved[i] && byId[saved[i]]) map[slot.id] = saved[i]
        })
        if (Object.keys(map).length) setMyPick(map)
      }
    })()
    return () => {
      alive = false
    }
  }, [club.id, byId])

  // Once mostrado según el modo.
  const shownEleven = useMemo(() => {
    if (mode === 'voted') return votedEleven
    if (mode === 'build') {
      return Object.fromEntries(
        FORMATION_433.map((s) => [s.id, byId[myPick[s.id]]]).filter(([, p]) => p),
      )
    }
    return topEleven
  }, [mode, votedEleven, topEleven, myPick, byId])

  function pickPlayer(slotId, playerId) {
    setMyPick((prev) => {
      const next = { ...prev }
      // Si el jugador ya estaba en otro hueco, libéralo (no duplicar).
      for (const k of Object.keys(next)) if (next[k] === playerId) delete next[k]
      next[slotId] = playerId
      return next
    })
    setActiveSlot(null)
  }

  async function castVote() {
    const ids = FORMATION_433.map((s) => myPick[s.id]).filter(Boolean)
    if (ids.length < 11) {
      setActiveSlot(null)
      alert('Completa los 11 jugadores antes de votar.')
      return
    }
    const updated = await submitVote(club.id, ids)
    setVotes(updated)
    setVoteCount((c) => c + 1)
    setJustVoted(true)
    setTimeout(() => setJustVoted(false), 2500)
  }

  const activeSlotDef = FORMATION_433.find((s) => s.id === activeSlot)

  return (
    <div className="xi">
      <div className="xi-tabs">
        <button className={mode === 'top' ? 'active' : ''} onClick={() => setMode('top')}>
          Once tipo
        </button>
        <button className={mode === 'voted' ? 'active' : ''} onClick={() => setMode('voted')}>
          Más votado{voteCount > 0 ? ` (${voteCount})` : ''}
        </button>
        <button className={mode === 'build' ? 'active' : ''} onClick={() => setMode('build')}>
          Crea el tuyo
        </button>
      </div>

      <p className="xi-hint muted">
        {mode === 'top' && 'Once de mayor valor de mercado de la plantilla actual.'}
        {mode === 'voted' && 'El once más votado por los usuarios (formación 4-3-3).'}
        {mode === 'build' && 'Toca cada posición para elegir jugador y vota tu once ideal.'}
      </p>

      <div className="pitch" style={{ '--club-c': club.primaryColor }}>
        {clubLogoUrl(club.id) && (
          <img className="pitch-logo" src={clubLogoUrl(club.id)} alt="" aria-hidden="true" loading="lazy" />
        )}
        {FORMATION_433.map((slot) => {
          const player = shownEleven[slot.id]
          const color = LINE_COLOR[slot.line]
          const v = player ? votes[player.id] || 0 : 0
          return (
            <button
              key={slot.id}
              className={`pitch-slot ${activeSlot === slot.id ? 'is-active' : ''} ${mode === 'build' ? 'editable' : ''}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              onClick={() => mode === 'build' && setActiveSlot(activeSlot === slot.id ? null : slot.id)}
              disabled={mode !== 'build'}
            >
              <span className="ps-shirt" style={{ borderColor: color }}>
                {player ? (
                  <Crest
                    name={player.name}
                    color={club.primaryColor}
                    size={34}
                    variant="avatar"
                  />
                ) : (
                  '+'
                )}
                {mode === 'voted' && v > 0 && <span className="ps-votes">{v}</span>}
              </span>
              <span className="ps-name">{player ? lastName(player.name) : slot.label}</span>
            </button>
          )
        })}
      </div>

      {/* Selector de jugador para el hueco activo (modo build) */}
      {mode === 'build' && activeSlotDef && (
        <div className="xi-picker">
          <div className="xi-picker-head">
            Elige <strong>{activeSlotDef.label}</strong>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveSlot(null)}>Cerrar</button>
          </div>
          <div className="xi-candidates">
            {candidatesForSlot(activeSlotDef, squad).map((p) => (
              <button key={p.id} className="xi-cand" onClick={() => pickPlayer(activeSlot, p.id)}>
                <Crest name={p.name} color={club.primaryColor} size={26} variant="avatar" />
                <span className="xi-cand-name">{p.name}</span>
                <span className="xi-cand-pos" style={{ color: LINE_COLOR[lineOf(p.position)] }}>
                  {p.position}
                </span>
                <span className="xi-cand-val num">{formatMoney(p.marketValue)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'build' && (
        <div className="xi-vote-bar">
          <button className="btn btn-primary" onClick={castVote}>
            <Crest name={club.name} color={club.primaryColor} size={18} logoUrl={clubLogoUrl(club.id)} />
            Votar mi once
          </button>
          {justVoted && <span className="xi-voted-msg">¡Voto registrado! 🗳️</span>}
        </div>
      )}

      <p className="xi-foot dim">
        La votación se guarda en este navegador. Para un ranking global compartido entre todos
        los usuarios se conectará la base de datos (Supabase, ya preparada).
      </p>
    </div>
  )
}
