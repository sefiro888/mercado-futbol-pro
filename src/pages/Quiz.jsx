import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAllPlayers, getAllClubs, getAllTransfers } from '@/lib/data.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { clubLogoUrl } from '@/lib/logos.js'
import './Quiz.css'

const HS_KEY_HL = 'mfp_hs_hl'   // higher-lower high score
const HS_KEY_GT = 'mfp_hs_gt'   // guess transfer high score

function getHs(key) {
  try { return parseInt(localStorage.getItem(key) ?? '0', 10) || 0 } catch { return 0 }
}
function saveHs(key, val) {
  try { localStorage.setItem(key, String(val)) } catch {}
}

function pickRandom(arr, n = 1) {
  const copy = [...arr]
  const picked = []
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length)
    picked.push(copy.splice(idx, 1)[0])
  }
  return n === 1 ? picked[0] : picked
}

// ── Miniatura jugador ──────────────────────────
function PlayerThumb({ player, hideValue, size = 'lg' }) {
  const [err, setErr] = useState(false)
  const url = !err ? playerPhotoUrl(player) : null
  return (
    <div className={`qp qp--${size}`}>
      <div className="qp-photo">
        {url
          ? <img src={url} alt={player.name} onError={() => setErr(true)} className="qp-photo-img" />
          : <span className="qp-init">{player.name.split(' ').slice(-1)[0][0]}</span>
        }
      </div>
      <div className="qp-name">{player.name}</div>
      <div className="qp-meta">{player.position} · {player.club?.name ?? player.clubId}</div>
      <div className="qp-value">{hideValue ? '??? M€' : `${player.marketValue} M€`}</div>
    </div>
  )
}

// ══════════════════════════════════════════════
//  MODO 1: ¿Más caro o más barato?
// ══════════════════════════════════════════════
function HigherLower({ onBack }) {
  const allPlayers = useMemo(
    () => getAllPlayers().filter((p) => p.marketValue > 0),
    []
  )

  const [hs, setHs] = useState(() => getHs(HS_KEY_HL))
  const [streak, setStreak] = useState(0)
  const [phase, setPhase] = useState('playing') // 'playing' | 'correct' | 'wrong'
  const [pair, setPair] = useState(() => pickRandom(allPlayers, 2))

  const [pA, pB] = pair

  function newRound(fromStreak) {
    const next = pickRandom(allPlayers, 2)
    setPair(next)
    setStreak(fromStreak)
    setPhase('playing')
  }

  function guess(isMoreExpensive) {
    const correct = isMoreExpensive ? pB.marketValue >= pA.marketValue : pB.marketValue < pA.marketValue
    if (correct) {
      const ns = streak + 1
      if (ns > hs) { saveHs(HS_KEY_HL, ns); setHs(ns) }
      setStreak(ns)
      setPhase('correct')
    } else {
      setPhase('wrong')
    }
  }

  return (
    <div className="quiz-game">
      <div className="quiz-topbar">
        <button className="quiz-back" onClick={onBack}>← Menú</button>
        <div className="quiz-scores">
          <span className="quiz-score">Racha: <strong>{streak}</strong></span>
          <span className="quiz-score quiz-hs">Récord: <strong>{hs}</strong></span>
        </div>
      </div>

      <h2 className="quiz-mode-title">¿Más caro o más barato?</h2>
      <p className="quiz-mode-sub">¿Es el jugador B más caro que el jugador A?</p>

      <div className="hl-arena">
        <div className="hl-card hl-card--a">
          <span className="hl-label">A</span>
          <PlayerThumb player={pA} hideValue={false} />
        </div>

        <div className="hl-vs">VS</div>

        <div className="hl-card hl-card--b">
          <span className="hl-label">B</span>
          <PlayerThumb player={pB} hideValue={phase === 'playing'} />
        </div>
      </div>

      {phase === 'playing' && (
        <div className="hl-buttons">
          <button className="hl-btn hl-btn--more" onClick={() => guess(true)}>
            💰 Más caro
          </button>
          <button className="hl-btn hl-btn--less" onClick={() => guess(false)}>
            🔻 Más barato
          </button>
        </div>
      )}

      {(phase === 'correct' || phase === 'wrong') && (
        <div className={`hl-result ${phase === 'correct' ? 'hl-result--ok' : 'hl-result--fail'}`}>
          <span className="hl-result-icon">{phase === 'correct' ? '✅' : '❌'}</span>
          <span className="hl-result-text">
            {phase === 'correct'
              ? `¡Correcto! ${pB.name} vale ${pB.marketValue} M€.`
              : `¡Incorrecto! ${pB.name} vale ${pB.marketValue} M€.`
            }
          </span>
          {phase === 'correct' ? (
            <button className="btn btn-primary" onClick={() => newRound(streak)}>Siguiente →</button>
          ) : (
            <button className="btn btn-primary" onClick={() => newRound(0)}>Reintentar</button>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════
//  MODO 2: Adivina el fichaje
// ══════════════════════════════════════════════
function GuessTransfer({ onBack }) {
  const allPlayers = useMemo(() => getAllPlayers(), [])
  const allClubs   = useMemo(() => getAllClubs(), [])
  const transfers  = useMemo(
    () => getAllTransfers().filter((t) => t.toClubId && t.transferFee !== undefined),
    []
  )

  const [hs, setHs] = useState(() => getHs(HS_KEY_GT))
  const [streak, setStreak] = useState(0)
  const [phase, setPhase] = useState('playing')
  const [selected, setSelected] = useState(null)

  const buildQuestion = useCallback(() => {
    const transfer = pickRandom(transfers)
    const player = allPlayers.find((p) => p.slug === transfer.playerId || p.id === transfer.playerId)
    const correctClub = allClubs.find((c) => c.id === transfer.toClubId)
    if (!player || !correctClub) return null
    const otherClubs = pickRandom(allClubs.filter((c) => c.id !== correctClub.id), 3)
    const options = [...otherClubs, correctClub].sort(() => Math.random() - 0.5)
    return { transfer, player, correctClub, options }
  }, [allPlayers, allClubs, transfers])

  const [question, setQuestion] = useState(() => {
    let q = null
    for (let i = 0; i < 20 && !q; i++) q = buildQuestion()
    return q
  })

  function newRound(s) {
    let q = null
    for (let i = 0; i < 20 && !q; i++) q = buildQuestion()
    setQuestion(q)
    setPhase('playing')
    setSelected(null)
    setStreak(s)
  }

  function guess(club) {
    setSelected(club.id)
    const correct = club.id === question.correctClub.id
    if (correct) {
      const ns = streak + 1
      if (ns > hs) { saveHs(HS_KEY_GT, ns); setHs(ns) }
      setStreak(ns)
      setPhase('correct')
    } else {
      setPhase('wrong')
    }
  }

  if (!question) return <p className="quiz-empty">No hay datos de fichajes suficientes.</p>

  const { player, correctClub, options, transfer } = question
  const fromClub = allClubs.find((c) => c.id === transfer.fromClubId)

  return (
    <div className="quiz-game">
      <div className="quiz-topbar">
        <button className="quiz-back" onClick={onBack}>← Menú</button>
        <div className="quiz-scores">
          <span className="quiz-score">Racha: <strong>{streak}</strong></span>
          <span className="quiz-score quiz-hs">Récord: <strong>{hs}</strong></span>
        </div>
      </div>

      <h2 className="quiz-mode-title">Adivina el fichaje</h2>
      <p className="quiz-mode-sub">¿A qué club fichó este jugador?</p>

      <div className="gt-player">
        <PlayerThumb player={player} hideValue={false} size="md" />
        {fromClub && (
          <p className="gt-from">Procedente de <strong>{fromClub.name}</strong></p>
        )}
      </div>

      <div className="gt-options">
        {options.map((club) => {
          const [logoErr, setLogoErr] = useState(false)
          const logoUrl = !logoErr ? clubLogoUrl(club.id) : null
          let cls = 'gt-option'
          if (phase !== 'playing') {
            if (club.id === correctClub.id) cls += ' gt-option--correct'
            else if (club.id === selected)  cls += ' gt-option--wrong'
            else                            cls += ' gt-option--dim'
          }
          return (
            <button
              key={club.id}
              className={cls}
              onClick={() => phase === 'playing' && guess(club)}
              disabled={phase !== 'playing'}
            >
              {logoUrl && (
                <img src={logoUrl} alt="" onError={() => setLogoErr(true)} className="gt-option-logo" />
              )}
              <span>{club.name}</span>
            </button>
          )
        })}
      </div>

      {phase !== 'playing' && (
        <div className={`hl-result ${phase === 'correct' ? 'hl-result--ok' : 'hl-result--fail'}`}>
          <span className="hl-result-icon">{phase === 'correct' ? '✅' : '❌'}</span>
          <span className="hl-result-text">
            {phase === 'correct'
              ? `¡Correcto! Fichó por ${correctClub.name}.`
              : `Era ${correctClub.name}. ¡A por la siguiente!`
            }
            {transfer.transferFee
              ? ` Fee: ${transfer.transferFee} M€.`
              : transfer.transferFee === 0
              ? ' Traspaso libre.'
              : ''
            }
          </span>
          {phase === 'correct' ? (
            <button className="btn btn-primary" onClick={() => newRound(streak)}>Siguiente →</button>
          ) : (
            <button className="btn btn-primary" onClick={() => newRound(0)}>Reintentar</button>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════
//  MENÚ PRINCIPAL
// ══════════════════════════════════════════════
export default function Quiz() {
  const [mode, setMode] = useState(null) // null | 'hl' | 'gt'

  if (mode === 'hl') return <HigherLower onBack={() => setMode(null)} />
  if (mode === 'gt') return <GuessTransfer onBack={() => setMode(null)} />

  const hlHs = getHs(HS_KEY_HL)
  const gtHs = getHs(HS_KEY_GT)

  return (
    <div className="quiz page-fade-in">
      <div className="quiz-hero">
        <p className="quiz-eyebrow">MINI-JUEGOS</p>
        <h1>Quiz de fútbol</h1>
        <p className="quiz-sub">Pon a prueba tu conocimiento del mercado. ¿Cuánto sabes de valores y fichajes?</p>
      </div>

      <div className="quiz-menu">
        <button className="quiz-card" onClick={() => setMode('hl')}>
          <div className="quiz-card-icon">💰</div>
          <div className="quiz-card-body">
            <h2>¿Más caro o más barato?</h2>
            <p>Compara el valor de mercado de dos jugadores. ¿Cuántos aciertas seguidos?</p>
            {hlHs > 0 && <span className="quiz-card-hs">Récord: {hlHs} seguidos</span>}
          </div>
          <span className="quiz-card-arrow">→</span>
        </button>

        <button className="quiz-card" onClick={() => setMode('gt')}>
          <div className="quiz-card-icon">🔀</div>
          <div className="quiz-card-body">
            <h2>Adivina el fichaje</h2>
            <p>Adivina a qué club fichó el jugador entre 4 opciones. Fichajes reales del mercado.</p>
            {gtHs > 0 && <span className="quiz-card-hs">Récord: {gtHs} seguidos</span>}
          </div>
          <span className="quiz-card-arrow">→</span>
        </button>
      </div>
    </div>
  )
}
