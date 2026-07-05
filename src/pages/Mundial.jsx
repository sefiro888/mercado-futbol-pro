import { useState, useEffect, useRef, useMemo } from 'react'
import { setPageSeo } from '@/lib/seo.js'
import WC_DATA from '@/data/worldcups.json'
import './Mundial.css'

const { editions, records, curiosities } = WC_DATA

const TITLE_COUNT = Object.fromEntries(records.mostTitles.map((t) => [t.name, t.titles]))

// ============================================================
// Utilidades: confeti, contador animado, reacciones guardadas
// ============================================================

const CONFETTI_COLORS = ['#fbbf24', '#22c55e', '#38bdf8', '#a78bfa', '#f87171', '#ffffff']

function fireConfetti(x, y, count = 24) {
  if (typeof document === 'undefined') return
  const root = document.createElement('div')
  root.className = 'wc-confetti-root'
  document.body.appendChild(root)
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span')
    el.className = 'wc-confetti-piece'
    const angle = Math.random() * Math.PI * 2
    const dist = 50 + Math.random() * 110
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - 30
    el.style.setProperty('--dx', `${dx}px`)
    el.style.setProperty('--dy', `${dy}px`)
    el.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`)
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
    el.style.animationDelay = `${Math.random() * 0.08}s`
    root.appendChild(el)
  }
  setTimeout(() => root.remove(), 1500)
}

function useCountUp(target, { duration = 1100, decimals = 0 } = {}) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (typeof target !== 'number' || Number.isNaN(target)) return
    let raf, observer
    let started = false
    function start() {
      if (started) return
      started = true
      const t0 = performance.now()
      function tick(now) {
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setValue(target * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
        else setValue(target)
      }
      raf = requestAnimationFrame(tick)
    }
    if (ref.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) start()
      }, { threshold: 0.25 })
      observer.observe(ref.current)
    } else start()
    return () => { if (raf) cancelAnimationFrame(raf); if (observer) observer.disconnect() }
  }, [target, duration])
  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('es-ES')
  return [display, ref]
}

function CountUp({ value, suffix = '', decimals = 0 }) {
  const [display, ref] = useCountUp(value, { decimals })
  return <strong ref={ref}>{display}{suffix}</strong>
}

const REACTION_EMOJIS = ['🤯', '😱', '🔥', '👏']
const REACTIONS_KEY = 'mfp_wc_curio_reactions'
function loadReactions() {
  try { return JSON.parse(localStorage.getItem(REACTIONS_KEY)) || {} } catch { return {} }
}
function saveReactions(obj) {
  try { localStorage.setItem(REACTIONS_KEY, JSON.stringify(obj)) } catch {}
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Emoji contextual según el contenido de la nota de un partido
function matchEmoji(m) {
  if (!m) return null
  const note = (m.note || '').toLowerCase()
  if (note.includes('mano de')) return '🤚'
  if (note.includes('remontad') || note.includes('remontó')) return '🔄'
  if (note.includes('batalla')) return '⚔️'
  if (note.includes('sorpresa') || note.includes('humillación') || note.includes('milagro')) return '😱'
  if (note.includes('récord') || note.includes('hat-trick') || note.includes('hattrick')) return '🎩'
  if (note.includes('polémic') || note.includes('anulad') || note.includes('controvert')) return '🚩'
  if (note.includes('lloraba') || note.includes('lloró') || note.includes('llanto')) return '😭'
  if (m.pen) return '🎯'
  if (m.et) return '⏱️'
  if (m.hs != null && m.as != null && m.hs + m.as >= 6) return '🔥'
  return '💬'
}

// Banderas via flagcdn (formato "wNN" — el único que no bloquea el navegador)
const FLAG_SPECIAL = { 'gb-eng': 'gb', 'gb-wls': 'gb', 'gb-nir': 'gb', 'gb-sct': 'gb' }
function Flag({ code, size = 20 }) {
  const [failed, setFailed] = useState(false)
  if (!code) return <span className="wc-flag-fallback" style={{ width: size * 1.33, height: size }} aria-hidden="true">🏳️</span>
  const c = FLAG_SPECIAL[code] || code
  if (failed) {
    return <span className="wc-flag-fallback" style={{ width: size * 1.33, height: size }} aria-hidden="true">🏳️</span>
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${c}.png`}
      srcSet={`https://flagcdn.com/w40/${c}.png 1x, https://flagcdn.com/w80/${c}.png 2x`}
      width={Math.round(size * 1.33)}
      height={size}
      style={{ height: size }}
      alt=""
      loading="lazy"
      decoding="async"
      className="wc-flag"
      onError={() => setFailed(true)}
    />
  )
}

// Score + overtime/pens display
function Score({ m }) {
  if (!m) return null
  const { hs, as, et, pen, penH, penA } = m
  return (
    <span className="wc-score">
      {hs} – {as}
      {pen && penH != null && <span className="wc-score-pen">({penH}-{penA} pens) 🎯</span>}
      {et && !pen && <span className="wc-score-et">AET ⏱️</span>}
    </span>
  )
}

// Tarjeta de edición en el grid de historia
function EditionCard({ ed, onSelect }) {
  const isLive = ed.status === 'live'
  return (
    <button className={`wc-ed-card ${isLive ? 'live' : ''}`} onClick={() => onSelect(ed)}>
      <div className="wc-ed-year">{ed.year}</div>
      <div className="wc-ed-host">
        <Flag code={ed.hc} size={16} />
        <span>{ed.host}</span>
        {isLive && <span className="wc-live-pill">🔴 EN CURSO</span>}
      </div>
      {!isLive ? (
        <>
          <div className="wc-ed-champ">
            <Flag code={ed.cc} size={14} />
            <strong>🏆 {ed.champion}</strong>
            {TITLE_COUNT[ed.champion] >= 4 && <span className="wc-crown" title="Superpotencia mundialista">👑</span>}
          </div>
          {ed.final && (
            <div className="wc-ed-score">
              <Score m={ed.final} />
              <small>🥈 vs {ed.ru}</small>
            </div>
          )}
          <div className="wc-ed-meta">
            <span>👥 {ed.teams} equipos</span>
            <span>⚽ {ed.goals} goles</span>
            <span>🎯 {ed.top.name} ({ed.top.g} ⚽)</span>
          </div>
        </>
      ) : (
        <div className="wc-ed-meta">
          <span>👥 {ed.teams} equipos</span>
          <span>🥅 104 partidos</span>
          <span>🌎 USA · México · Canadá</span>
        </div>
      )}
    </button>
  )
}

// Bracket visual de una edición
function EditionBracket({ ed }) {
  if (!ed.rounds) return <p className="wc-muted">Sin datos de bracket disponibles.</p>

  const { r16, qf, sf, secondRound, finalRound } = ed.rounds
  const finalMatch = ed.final

  const renderMatch = (m, idx) => {
    if (!m || m.hs == null) {
      if (m?.note) return <div key={idx} className="wc-match wc-match-note">📌 {m.note}</div>
      return null
    }
    const drawAfterEt = m.hs === m.as
    const hWin = m.hs > m.as || (m.pen && drawAfterEt && m.penH > m.penA)
    const aWin = m.as > m.hs || (m.pen && drawAfterEt && m.penA > m.penH)
    return (
      <div key={idx} className={`wc-match ${m._isFinal ? 'wc-match-final' : ''} ${m.pen ? 'pens' : ''}`}>
        <div className="wc-match-teams">
          <div className={`wc-match-team ${hWin ? 'winner' : ''}`}>
            <Flag code={m.hc} size={16} />
            <span>{m.h}</span>
            {hWin && <span className="wc-win-check">✓</span>}
            <strong>{m.hs}</strong>
          </div>
          <div className={`wc-match-team ${aWin ? 'winner' : ''}`}>
            <Flag code={m.ac} size={16} />
            <span>{m.a}</span>
            {aWin && <span className="wc-win-check">✓</span>}
            <strong>{m.as}</strong>
          </div>
        </div>
        {(m.pen || m.et || m.note) && (
          <div className="wc-match-tags">
            {m.pen && m.penH != null && <span className="wc-tag wc-tag-pen">🎯 {m.penH}-{m.penA} pens</span>}
            {m.et && !m.pen && <span className="wc-tag wc-tag-et">⏱️ Prórroga</span>}
            {m.note && <span className="wc-tag wc-tag-note">{matchEmoji(m)} {m.note}</span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="wc-bracket">
      {finalRound && (
        <section className="wc-bracket-round">
          <h4 className="wc-round-label">🔁 Ronda final (Round Robin)</h4>
          <div className="wc-matches">{finalRound.map(renderMatch)}</div>
        </section>
      )}
      {secondRound && (
        <section className="wc-bracket-round">
          <h4 className="wc-round-label">🔁 Segunda fase de grupos</h4>
          <div className="wc-matches">{secondRound.map(renderMatch)}</div>
        </section>
      )}
      {r16 && r16.length > 0 && (
        <section className="wc-bracket-round wc-round-r16">
          <h4 className="wc-round-label">🥅 Octavos de Final</h4>
          <div className="wc-matches wc-matches-grid">{r16.map(renderMatch)}</div>
        </section>
      )}
      {qf && qf.length > 0 && (
        <section className="wc-bracket-round wc-round-qf">
          <h4 className="wc-round-label">⚔️ Cuartos de Final</h4>
          <div className="wc-matches wc-matches-grid">{qf.map(renderMatch)}</div>
        </section>
      )}
      {sf && sf.length > 0 && (
        <section className="wc-bracket-round wc-round-sf">
          <h4 className="wc-round-label">🔥 Semifinales</h4>
          <div className="wc-matches wc-matches-grid">{sf.map(renderMatch)}</div>
        </section>
      )}
      {finalMatch && (
        <section className="wc-bracket-round wc-bracket-final">
          <h4 className="wc-round-label golden">🏆 FINAL</h4>
          {renderMatch({ ...finalMatch, _isFinal: true }, 'final')}
          {finalMatch.venue && (
            <p className="wc-final-venue">📍 {finalMatch.venue} · {finalMatch.date}</p>
          )}
          {finalMatch.note && (
            <p className="wc-final-note">💥 "{finalMatch.note}"</p>
          )}
        </section>
      )}
    </div>
  )
}

// Tabla de todos los campeones (pestaña Palmarés)
function PalmaresTab() {
  const years = [...editions].reverse()
  return (
    <div className="wc-palmares">
      <div className="table-wrap">
        <table className="data wc-table">
          <thead>
            <tr>
              <th>Año</th>
              <th>📍 Sede</th>
              <th>🏆 Campeón</th>
              <th>Final</th>
              <th>🥈 Subcampeón</th>
              <th>🥉 3.º Puesto</th>
              <th>🎯 Máximo goleador</th>
              <th className="ta-right">👥 Equipos</th>
              <th className="ta-right">⚽ Goles</th>
            </tr>
          </thead>
          <tbody>
            {years.map((ed) => (
              <tr key={ed.year} className={ed.status === 'live' ? 'tr-live' : ''}>
                <td><strong>{ed.year}</strong></td>
                <td>
                  <span className="wc-cell-flag">
                    <Flag code={ed.hc} size={14} />
                    {ed.host}
                  </span>
                </td>
                <td>
                  {ed.champion ? (
                    <span className="wc-cell-flag wc-champ-cell">
                      <Flag code={ed.cc} size={14} />
                      <strong>{ed.champion}</strong>
                      {TITLE_COUNT[ed.champion] >= 4 && <span className="wc-crown-sm">👑</span>}
                    </span>
                  ) : <span className="wc-muted">🔴 En curso</span>}
                </td>
                <td className="wc-score-cell">
                  {ed.final ? <Score m={ed.final} /> : '—'}
                </td>
                <td>
                  {ed.ru ? (
                    <span className="wc-cell-flag">
                      <Flag code={ed.ruc} size={14} />
                      {ed.ru}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  {ed.third ? (
                    <span className="wc-cell-flag">
                      <Flag code={ed.tc} size={14} />
                      {ed.third}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  {ed.top.name !== 'En curso' ? (
                    <span>
                      <Flag code={ed.top.nc} size={13} />
                      {ed.top.name}
                      {ed.top.g && <strong className="wc-goals-badge"> {ed.top.g}⚽</strong>}
                    </span>
                  ) : <span className="wc-muted">En curso</span>}
                </td>
                <td className="ta-right">{ed.teams}</td>
                <td className="ta-right">{ed.goals ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Estadísticas globales (pestaña Estadísticas)
function StatsTab() {
  const totalGoals = editions.reduce((s, e) => s + (e.goals || 0), 0)
  const totalMatches = editions.reduce((s, e) => s + (e.matches || 0), 0)
  const totalAtt = editions.reduce((s, e) => s + (e.att || 0), 0)
  const highestAvg = [...editions].filter((e) => e.avgGoals).sort((a, b) => b.avgGoals - a.avgGoals)[0]
  const lowestAvg = [...editions].filter((e) => e.avgGoals).sort((a, b) => a.avgGoals - b.avgGoals)[0]

  return (
    <div className="wc-stats">
      <div className="wc-stat-grid">
        <div className="wc-stat-card">
          <div className="wc-stat-num"><CountUp value={editions.length - 1} /></div>
          <div className="wc-stat-label">🏆 Mundiales celebrados</div>
        </div>
        <div className="wc-stat-card">
          <div className="wc-stat-num"><CountUp value={totalGoals} /></div>
          <div className="wc-stat-label">⚽ Goles totales (1930–2022)</div>
        </div>
        <div className="wc-stat-card">
          <div className="wc-stat-num"><CountUp value={totalMatches} /></div>
          <div className="wc-stat-label">🥅 Partidos jugados</div>
        </div>
        <div className="wc-stat-card">
          <div className="wc-stat-num"><CountUp value={Number((totalAtt / 1e6).toFixed(1))} decimals={1} suffix="M" /></div>
          <div className="wc-stat-label">👀 Espectadores totales</div>
        </div>
        <div className="wc-stat-card accent-gold">
          <div className="wc-stat-num"><CountUp value={highestAvg?.avgGoals} decimals={2} /></div>
          <div className="wc-stat-label">🔥 Mayor media goles/partido ({highestAvg?.year} {highestAvg?.host})</div>
        </div>
        <div className="wc-stat-card accent-blue">
          <div className="wc-stat-num"><CountUp value={lowestAvg?.avgGoals} decimals={2} /></div>
          <div className="wc-stat-label">😴 Menor media goles/partido ({lowestAvg?.year} {lowestAvg?.host})</div>
        </div>
      </div>

      <div className="wc-records-grid">
        <div className="wc-records-block">
          <h3 className="wc-records-title">⚽ Máximos goleadores históricos</h3>
          <div className="wc-top-list">
            {records.topScorers.map((s, i) => (
              <div key={s.name} className={`wc-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                <span className="wc-top-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                <Flag code={s.nc} size={16} />
                <span className="wc-top-name">{s.name}</span>
                <strong className="wc-top-goals">{s.goals} ⚽</strong>
                <span className="wc-top-detail">{s.editions}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="wc-records-block">
          <h3 className="wc-records-title">🏆 Más títulos mundiales</h3>
          <div className="wc-top-list">
            {records.mostTitles.map((t, i) => (
              <div key={t.name} className={`wc-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                <span className="wc-top-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                <Flag code={t.nc} size={16} />
                <span className="wc-top-name">{t.name}</span>
                <strong className="wc-top-goals">{t.titles} 🏆</strong>
                <span className="wc-top-detail">{t.years}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="wc-records-block">
          <h3 className="wc-records-title">🎽 Más finales disputadas</h3>
          <div className="wc-top-list">
            {records.mostFinals.map((t, i) => (
              <div key={t.name} className={`wc-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                <span className="wc-top-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                <Flag code={t.nc} size={16} />
                <span className="wc-top-name">{t.name}</span>
                <span className="wc-top-goals">{t.finals} finales</span>
                <strong className="wc-top-detail">{t.wins} ganadas</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="wc-records-block">
          <h3 className="wc-records-title">📊 Goles por edición</h3>
          <div className="wc-goals-chart">
            {editions.filter((e) => e.goals).map((ed) => {
              const max = 172
              const pct = Math.round((ed.goals / max) * 100)
              return (
                <div key={ed.year} className="wc-goals-bar-row">
                  <span className="wc-goals-year"><Flag code={ed.hc} size={12} /> {ed.year}</span>
                  <div className="wc-goals-bar-wrap">
                    <div className="wc-goals-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="wc-goals-val">{ed.goals}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Pestaña de curiosidades con reacciones y "sorpréndeme"
function CuriosidadesTab() {
  const [reactions, setReactions] = useState(() => loadReactions())
  const [spotlightId, setSpotlightId] = useState(null)
  const refs = useRef({})

  function react(id, emoji, e) {
    setReactions((prev) => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), [emoji]: ((prev[id] || {})[emoji] || 0) + 1 } }
      saveReactions(next)
      return next
    })
    const rect = e.currentTarget.getBoundingClientRect()
    fireConfetti(rect.left + rect.width / 2, rect.top, 10)
  }

  function surprise() {
    const random = curiosities[Math.floor(Math.random() * curiosities.length)]
    setSpotlightId(random.id)
    const el = refs.current[random.id]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setSpotlightId(null), 2200)
  }

  return (
    <div className="wc-curiosidades">
      <button className="wc-surprise-btn wc-surprise-btn-sm" onClick={surprise}>🎲 Sorpréndeme con una curiosidad</button>
      {curiosities.map((c) => (
        <div
          key={c.id}
          ref={(el) => { refs.current[c.id] = el }}
          className={`wc-curio-card ${spotlightId === c.id ? 'spotlight' : ''}`}
        >
          <div className="wc-curio-icon">{c.icon}</div>
          <div className="wc-curio-body">
            <h3 className="wc-curio-title">{c.title}</h3>
            <p className="wc-curio-text">{c.text}</p>
            <div className="wc-curio-reactions">
              {REACTION_EMOJIS.map((em) => (
                <button key={em} className="wc-reaction-btn" onClick={(e) => react(c.id, em, e)}>
                  {em} <span>{reactions[c.id]?.[em] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Pestaña "Por edición": recibe año seleccionado desde el padre (para el botón Sorpréndeme)
function EdicionTab({ year, onYearChange }) {
  const selectableEditions = editions.filter((e) => e.rounds)
  const ed = editions.find((e) => e.year === year)

  return (
    <div className="wc-edicion">
      <div className="wc-year-selector">
        {selectableEditions.map((e) => (
          <button
            key={e.year}
            className={`wc-year-btn ${e.year === year ? 'active' : ''} ${e.status === 'live' ? 'live' : ''}`}
            onClick={() => onYearChange(e.year)}
          >
            {e.year}
            {e.status === 'live' && <span className="wc-live-dot" />}
          </button>
        ))}
      </div>

      {ed && (
        <div className="wc-ed-detail">
          <div className="wc-ed-detail-header">
            <div className="wc-ed-detail-info">
              <div className="wc-ed-detail-year">{ed.year}</div>
              <div className="wc-ed-detail-host">
                <Flag code={ed.hc} size={20} />
                <span>{ed.host}</span>
              </div>
              {ed.champion && (
                <div className="wc-ed-detail-champ">
                  <span>🏆 Campeón:</span>
                  <Flag code={ed.cc} size={18} />
                  <strong>{ed.champion}</strong>
                </div>
              )}
            </div>
            {ed.nickname && (
              <div className="wc-ed-detail-nickname">
                <span>✨ "{ed.nickname}"</span>
              </div>
            )}
          </div>

          <div className="wc-ed-curiosity">
            <span className="wc-curio-icon-sm">💡</span>
            {ed.curiosity}
          </div>

          <div className="wc-ed-detail-meta">
            <span>👥 {ed.teams} equipos</span>
            <span>🥅 {ed.matches} partidos</span>
            {ed.goals && <span>⚽ {ed.goals} goles</span>}
            {ed.avgGoals && <span>📈 {ed.avgGoals} goles/partido</span>}
            {ed.att && <span>👀 {(ed.att / 1e6).toFixed(2)}M espectadores</span>}
            {ed.top?.g && (
              <span>
                <Flag code={ed.top.nc} size={13} />
                🎯 {ed.top.name} — {ed.top.g} ⚽
              </span>
            )}
          </div>

          <EditionBracket ed={ed} />
        </div>
      )}
    </div>
  )
}

// ============================================================
// Pestaña Historia con filtros por década y campeón
// ============================================================
function HistoriaTab({ onSelect }) {
  const decades = useMemo(
    () => [...new Set(editions.map((e) => Math.floor(e.year / 10) * 10))].sort((a, b) => a - b),
    []
  )
  const [decade, setDecade] = useState(null)
  const [champ, setChamp] = useState(null)

  const filtered = useMemo(() => {
    return editions.filter((e) => {
      if (decade && Math.floor(e.year / 10) * 10 !== decade) return false
      if (champ && e.champion !== champ) return false
      return true
    })
  }, [decade, champ])

  return (
    <div>
      <p className="wc-intro">Haz clic en cualquier edición para ver el bracket completo con todos los resultados desglosados. 👇</p>

      <div className="wc-filters">
        <div className="wc-filter-group">
          <span className="wc-filter-label">📅 Década</span>
          <div className="wc-filter-chips">
            <button className={`wc-fchip ${!decade ? 'active' : ''}`} onClick={() => setDecade(null)}>Todas</button>
            {decades.map((d) => (
              <button key={d} className={`wc-fchip ${decade === d ? 'active' : ''}`} onClick={() => setDecade(d)}>{d}s</button>
            ))}
          </div>
        </div>
        <div className="wc-filter-group">
          <span className="wc-filter-label">🏆 Campeón</span>
          <div className="wc-filter-chips">
            <button className={`wc-fchip ${!champ ? 'active' : ''}`} onClick={() => setChamp(null)}>Todos</button>
            {records.mostTitles.map((t) => (
              <button key={t.name} className={`wc-fchip ${champ === t.name ? 'active' : ''}`} onClick={() => setChamp(t.name)}>
                <Flag code={t.nc} size={13} /> {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="wc-muted wc-empty">😅 No hay Mundiales con esa combinación de filtros. Prueba otra.</p>
      ) : (
        <div className="wc-editions-grid">
          {[...filtered].reverse().map((ed) => (
            <EditionCard key={ed.year} ed={ed} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Pestaña Comparador: enfrenta dos ediciones cara a cara
// ============================================================
const COMPARABLE = editions.filter((e) => e.champion)

function CompareRow({ icon, label, a, b, higherBetter, format }) {
  const fa = format ? format(a) : a ?? '—'
  const fb = format ? format(b) : b ?? '—'
  let aWin = false, bWin = false
  if (typeof a === 'number' && typeof b === 'number' && a !== b) {
    if (higherBetter) { aWin = a > b; bWin = b > a }
    else { aWin = a < b; bWin = b < a }
  }
  return (
    <div className="wc-cmp-row">
      <div className={`wc-cmp-cell ${aWin ? 'win' : ''}`}>{fa}{aWin && ' 🔺'}</div>
      <div className="wc-cmp-label">{icon} {label}</div>
      <div className={`wc-cmp-cell ${bWin ? 'win' : ''}`}>{fb}{bWin && ' 🔺'}</div>
    </div>
  )
}

function CompareTab() {
  const [yearA, setYearA] = useState(2018)
  const [yearB, setYearB] = useState(2022)
  const edA = COMPARABLE.find((e) => e.year === yearA)
  const edB = COMPARABLE.find((e) => e.year === yearB)
  if (!edA || !edB) return null

  return (
    <div className="wc-compare">
      <p className="wc-intro">Elige dos Mundiales y compáralos cara a cara. 🥊</p>
      <div className="wc-cmp-selectors">
        <select value={yearA} onChange={(e) => setYearA(Number(e.target.value))}>
          {COMPARABLE.map((e) => <option key={e.year} value={e.year}>{e.year} — {e.host}</option>)}
        </select>
        <span className="wc-cmp-vs">⚔️ VS</span>
        <select value={yearB} onChange={(e) => setYearB(Number(e.target.value))}>
          {COMPARABLE.map((e) => <option key={e.year} value={e.year}>{e.year} — {e.host}</option>)}
        </select>
      </div>

      <div className="wc-cmp-heads">
        <div className="wc-cmp-head">
          <div className="wc-cmp-head-year">{edA.year}</div>
          <Flag code={edA.cc} size={28} />
          <strong>{edA.champion}</strong>
          <small>🏆 Campeón</small>
        </div>
        <div className="wc-cmp-head-vs">🆚</div>
        <div className="wc-cmp-head">
          <div className="wc-cmp-head-year">{edB.year}</div>
          <Flag code={edB.cc} size={28} />
          <strong>{edB.champion}</strong>
          <small>🏆 Campeón</small>
        </div>
      </div>

      <div className="wc-cmp-rows">
        <CompareRow icon="📍" label="Sede" a={edA.host} b={edB.host} />
        <CompareRow icon="👥" label="Equipos" a={edA.teams} b={edB.teams} higherBetter />
        <CompareRow icon="🥅" label="Partidos" a={edA.matches} b={edB.matches} higherBetter />
        <CompareRow icon="⚽" label="Goles totales" a={edA.goals} b={edB.goals} higherBetter />
        <CompareRow icon="📈" label="Goles/partido" a={edA.avgGoals} b={edB.avgGoals} higherBetter format={(v) => v?.toFixed(2)} />
        <CompareRow icon="👀" label="Espectadores" a={edA.att} b={edB.att} higherBetter format={(v) => (v ? (v / 1e6).toFixed(2) + 'M' : '—')} />
        <CompareRow icon="🎯" label="Máx. goleador" a={`${edA.top.name} (${edA.top.g}⚽)`} b={`${edB.top.name} (${edB.top.g}⚽)`} />
        <CompareRow icon="🥈" label="Subcampeón" a={edA.ru} b={edB.ru} />
        <CompareRow icon="🥉" label="3.º puesto" a={edA.third} b={edB.third} />
      </div>
    </div>
  )
}

// ============================================================
// Pestaña Quiz: trivia mundialista con puntuación y racha
// ============================================================
const QUIZ_EDITIONS = editions.filter((e) => e.champion)
const CHAMPION_POOL = [...new Map(QUIZ_EDITIONS.map((e) => [e.champion, { name: e.champion, code: e.cc }])).values()]
const HOST_POOL = [...new Map(editions.map((e) => [e.host, { name: e.host, code: e.hc }])).values()]
const SCORER_POOL = [...new Map(
  editions.filter((e) => e.top?.name && e.top.name !== 'En curso').map((e) => [e.top.name, { name: e.top.name, code: e.top.nc }])
).values()]
const RUNNERUP_POOL = [...new Map(QUIZ_EDITIONS.filter((e) => e.ru).map((e) => [e.ru, { name: e.ru, code: e.ruc }])).values()]

function buildQuizQuestion(usedYears) {
  const pool = QUIZ_EDITIONS.filter((e) => !usedYears.includes(e.year))
  const source = pool.length ? pool : QUIZ_EDITIONS
  const ed = source[Math.floor(Math.random() * source.length)]
  const types = ['champion', 'host', 'scorer', 'runnerup']
  const type = types[Math.floor(Math.random() * types.length)]

  let question, correct, wrongPool
  if (type === 'champion') {
    question = `¿Quién ganó el Mundial de ${ed.year}?`
    correct = { name: ed.champion, code: ed.cc }
    wrongPool = CHAMPION_POOL.filter((c) => c.name !== ed.champion)
  } else if (type === 'host') {
    question = `¿Dónde se celebró el Mundial de ${ed.year}?`
    correct = { name: ed.host, code: ed.hc }
    wrongPool = HOST_POOL.filter((c) => c.name !== ed.host)
  } else if (type === 'scorer') {
    question = `¿Quién fue el máximo goleador del Mundial de ${ed.year} (${ed.top.g} goles)?`
    correct = { name: ed.top.name, code: ed.top.nc }
    wrongPool = SCORER_POOL.filter((c) => c.name !== ed.top.name)
  } else {
    question = `¿Quién fue el subcampeón del Mundial de ${ed.year}?`
    correct = { name: ed.ru, code: ed.ruc }
    wrongPool = RUNNERUP_POOL.filter((c) => c.name !== ed.ru)
  }

  const wrongs = shuffle(wrongPool).slice(0, 3)
  const options = shuffle([correct, ...wrongs])
  const correctIndex = options.findIndex((o) => o.name === correct.name)
  return { year: ed.year, question, options, correctIndex, emoji: '⚽' }
}

const QUIZ_LEN = 8
const QUIZ_HS_KEY = 'mfp_hs_mundial_quiz'

function QuizTab() {
  const [usedYears, setUsedYears] = useState([])
  const [current, setCurrent] = useState(() => buildQuizQuestion([]))
  const [index, setIndex] = useState(1)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [finished, setFinished] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem(QUIZ_HS_KEY) ?? '0', 10) || 0 } catch { return 0 }
  })

  function handleAnswer(i, e) {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (i === current.correctIndex) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      const rect = e.currentTarget.getBoundingClientRect()
      fireConfetti(rect.left + rect.width / 2, rect.top, 20)
    } else {
      setStreak(0)
    }
  }

  function handleNext() {
    if (index >= QUIZ_LEN) {
      setFinished(true)
      if (score > highScore) {
        setHighScore(score)
        try { localStorage.setItem(QUIZ_HS_KEY, String(score)) } catch {}
      }
      return
    }
    const nextUsed = [...usedYears, current.year]
    setUsedYears(nextUsed)
    setCurrent(buildQuizQuestion(nextUsed))
    setIndex((i) => i + 1)
    setSelected(null)
    setAnswered(false)
  }

  function handleRestart() {
    setUsedYears([])
    setCurrent(buildQuizQuestion([]))
    setIndex(1)
    setScore(0)
    setStreak(0)
    setSelected(null)
    setAnswered(false)
    setFinished(false)
  }

  if (finished) {
    const pct = score / QUIZ_LEN
    const rank = pct === 1
      ? { icon: '🐐', label: 'Enciclopedia Mundialista' }
      : pct >= 0.75
      ? { icon: '🏆', label: 'Crack del Mundial' }
      : pct >= 0.5
      ? { icon: '⚽', label: 'Buen Aficionado' }
      : pct >= 0.25
      ? { icon: '📺', label: 'Sigues el Mundial de vez en cuando' }
      : { icon: '🍿', label: 'Te falta ver más partidos' }
    return (
      <div className="wc-quiz wc-quiz-end">
        <div className="wc-quiz-end-icon">{rank.icon}</div>
        <h3 className="wc-quiz-end-title">{score} / {QUIZ_LEN} correctas</h3>
        <p className="wc-quiz-end-rank">{rank.label}</p>
        {score >= highScore && score > 0 && <p className="wc-quiz-newhs">🌟 ¡Nuevo récord personal!</p>}
        <p className="wc-quiz-hs">Récord: {highScore} / {QUIZ_LEN}</p>
        <button className="wc-quiz-restart" onClick={handleRestart}>🔁 Jugar de nuevo</button>
      </div>
    )
  }

  return (
    <div className="wc-quiz">
      <div className="wc-quiz-top">
        <span className="wc-quiz-progress">Pregunta {index} / {QUIZ_LEN}</span>
        <span className="wc-quiz-score">⭐ {score}</span>
        {streak >= 2 && <span className="wc-quiz-streak">🔥 Racha x{streak}</span>}
      </div>
      <div className="wc-quiz-bar-wrap"><div className="wc-quiz-bar" style={{ width: `${((index - 1) / QUIZ_LEN) * 100}%` }} /></div>
      <h3 className="wc-quiz-question">{current.emoji} {current.question}</h3>
      <div className="wc-quiz-options">
        {current.options.map((opt, i) => {
          let cls = 'wc-quiz-opt'
          if (answered) {
            if (i === current.correctIndex) cls += ' correct'
            else if (i === selected) cls += ' wrong'
          }
          return (
            <button key={opt.name} className={cls} onClick={(e) => handleAnswer(i, e)} disabled={answered}>
              <Flag code={opt.code} size={18} />
              <span>{opt.name}</span>
              {answered && i === current.correctIndex && <span className="wc-quiz-mark">✅</span>}
              {answered && i === selected && i !== current.correctIndex && <span className="wc-quiz-mark">❌</span>}
            </button>
          )
        })}
      </div>
      {answered && (
        <button className="wc-quiz-next" onClick={handleNext}>
          {index >= QUIZ_LEN ? 'Ver resultado 🏁' : 'Siguiente →'}
        </button>
      )}
    </div>
  )
}

// Ticker rotativo de "¿sabías que...?" en el hero
function FactTicker() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % curiosities.length), 5000)
    return () => clearInterval(id)
  }, [])
  const c = curiosities[i]
  return (
    <div className="wc-ticker" key={i}>
      <span className="wc-ticker-icon">{c.icon}</span>
      <span className="wc-ticker-text"><strong>¿Sabías que…?</strong> {c.text}</span>
    </div>
  )
}

const TABS = [
  { id: 'historia', label: '📅 Historia' },
  { id: 'palmares', label: '🏆 Palmarés' },
  { id: 'estadisticas', label: '📊 Estadísticas' },
  { id: 'curiosidades', label: '💡 Curiosidades' },
  { id: 'edicion', label: '🔍 Por edición' },
  { id: 'comparador', label: '⚖️ Comparador' },
  { id: 'quiz', label: '🎮 Quiz' },
]

export default function Mundial() {
  const [tab, setTab] = useState('historia')
  const [edicionYear, setEdicionYear] = useState(2022)

  useEffect(() => {
    setPageSeo({
      title: 'Historia del Mundial de Fútbol — Todos los Mundiales 1930–2026 | Mercado Fútbol Pro',
      description: 'Palmarés completo, estadísticas, curiosidades, comparador, quiz y brackets de todos los Mundiales de fútbol desde Uruguay 1930 hasta Catar 2022 y el Mundial 2026.',
    })
  }, [])

  function handleEdSelect(ed) {
    setEdicionYear(ed.year)
    setTab('edicion')
  }

  function handleSurprise(e) {
    const pool = editions.filter((ed) => ed.rounds)
    const random = pool[Math.floor(Math.random() * pool.length)]
    setEdicionYear(random.year)
    setTab('edicion')
    const rect = e.currentTarget.getBoundingClientRect()
    fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 30)
  }

  return (
    <div className="container section wc-page">
      {/* Hero */}
      <header className="wc-hero">
        <div className="wc-hero-badge">⚽ Copa del Mundo FIFA</div>
        <h1 className="wc-hero-title">
          Historia del <span className="wc-hero-gold">Mundial</span> 🏆
        </h1>
        <p className="wc-hero-lead">
          22 ediciones · 92 años · Todos los resultados, palmarés y datos desglosados partido a partido desde Uruguay 1930 hasta la gloria de Argentina en Catar 2022
        </p>
        <div className="wc-hero-stats">
          <div className="wc-hs"><CountUp value={22} /><span>Mundiales</span></div>
          <div className="wc-hs"><CountUp value={2458} /><span>Partidos</span></div>
          <div className="wc-hs"><CountUp value={16} /><span>Goles de Klose</span></div>
          <div className="wc-hs"><CountUp value={13} /><span>Goles de Fontaine 1958</span></div>
          <div className="wc-hs"><CountUp value={5} /><span>Copas de Brasil</span></div>
        </div>
        <button className="wc-surprise-btn" onClick={handleSurprise}>🎲 Sorpréndeme con un Mundial al azar</button>
        <FactTicker />
      </header>

      {/* Tabs */}
      <nav className="wc-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`wc-tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Contenido */}
      <div className="wc-content">
        {tab === 'historia' && <HistoriaTab onSelect={handleEdSelect} />}
        {tab === 'palmares' && <PalmaresTab />}
        {tab === 'estadisticas' && <StatsTab />}
        {tab === 'curiosidades' && <CuriosidadesTab />}
        {tab === 'edicion' && <EdicionTab year={edicionYear} onYearChange={setEdicionYear} />}
        {tab === 'comparador' && <CompareTab />}
        {tab === 'quiz' && <QuizTab />}
      </div>
    </div>
  )
}
