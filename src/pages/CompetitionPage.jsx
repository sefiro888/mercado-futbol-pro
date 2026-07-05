import { useState, useEffect } from 'react'
import { setPageSeo } from '@/lib/seo.js'
import './CompetitionPage.css'

// ── Utilidades ──────────────────────────────────────────────────────────────
function useCountUp(target, { duration = 1100, decimals = 0 } = {}) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (typeof target !== 'number' || Number.isNaN(target)) return
    let raf
    const t0 = performance.now()
    function tick(now) {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setValue(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('es-ES')
}

function CountUp({ value, suffix = '', decimals = 0 }) {
  const display = useCountUp(value, { decimals })
  return <strong>{display}{suffix}</strong>
}

const REACTIONS = ['🤯', '😱', '🔥', '👏']

function loadReactions(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {} } catch { return {} }
}
function saveReactions(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)) } catch {}
}

// ── Flag ─────────────────────────────────────────────────────────────────────
const FLAG_SPECIAL = { 'gb-eng': 'gb', 'gb-wls': 'gb', 'gb-nir': 'gb', 'gb-sct': 'gb', 'eu': null }
function Flag({ code, size = 18 }) {
  const [failed, setFailed] = useState(false)
  if (!code || FLAG_SPECIAL[code] === null) return null
  const c = FLAG_SPECIAL[code] || code
  if (failed) return <span className="cp-flag-fallback" style={{ width: size * 1.33, height: size }} />
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
      className="cp-flag-img"
      onError={() => setFailed(true)}
    />
  )
}

// ── Edition card ─────────────────────────────────────────────────────────────
function EditionCard({ ed, onSelect, comp }) {
  const isLive = ed.status === 'live'
  return (
    <button className={`cp-ed-card ${isLive ? 'live' : ''}`} onClick={() => onSelect(ed)}
      style={{ '--cp-accent': comp.accent }}>
      <div className="cp-ed-year">{ed.year}</div>
      {ed.host && (
        <div className="cp-ed-host">
          <Flag code={ed.hc} size={14} />
          <span>{ed.host}</span>
          {isLive && <span className="cp-live-pill">🔴 En curso</span>}
        </div>
      )}
      {!isLive && ed.champion && (
        <>
          <div className="cp-ed-champ">
            <Flag code={ed.cc} size={14} />
            <strong>🏆 {ed.champion}</strong>
          </div>
          {ed.final && ed.final.hs != null && (
            <div className="cp-ed-score">
              {ed.final.hs}–{ed.final.as}
              {ed.final.pen && ` (${ed.final.penH}-${ed.final.penA} p)`}
              {ed.final.et && !ed.final.pen && ' AET'}
            </div>
          )}
          <div className="cp-ed-meta">
            <span>⚽ {ed.top?.name?.split(' ').pop()} {ed.top?.g && `${ed.top.g}⚽`}</span>
            {ed.goals && <span>🥅 {ed.goals} goles</span>}
          </div>
        </>
      )}
    </button>
  )
}

// ── Edition detail modal ──────────────────────────────────────────────────────
function EditionDetail({ ed, onClose, comp }) {
  if (!ed) return null
  const { final: f } = ed
  const isLive = ed.status === 'live'
  return (
    <div className="cp-detail-backdrop" onClick={onClose}>
      <div className="cp-detail" style={{ '--cp-accent': comp.accent, '--cp-badge-bg': comp.badgeBg }}
        onClick={e => e.stopPropagation()}>
        <button className="cp-detail-close" onClick={onClose}>✕</button>
        <div className="cp-detail-year">{ed.year}</div>
        <div className="cp-detail-host">
          <Flag code={ed.hc} size={16} />
          <span>{ed.host}</span>
        </div>
        {f && f.hs != null && !isLive && (
          <div className="cp-detail-final">
            <div className="cp-final-label">🏆 Final</div>
            <div className="cp-final-teams">
              <div className={`cp-final-team ${f.hs > f.as || (f.pen && f.penH > f.penA) ? 'winner' : ''}`}>
                <Flag code={ed.cc} size={18} />
                <span>{f.h || ed.champion}</span>
              </div>
              <div className="cp-final-score">{f.hs} – {f.as}</div>
              <div className={`cp-final-team ${f.as > f.hs || (f.pen && f.penA > f.penH) ? 'winner' : ''}`}>
                <Flag code={ed.ruc} size={18} />
                <span>{f.a || ed.ru}</span>
              </div>
            </div>
            <div className="cp-final-tags">
              {f.pen && f.penH != null && <span className="cp-final-tag">🎯 {f.penH}-{f.penA} penaltis</span>}
              {f.et && !f.pen && <span className="cp-final-tag">⏱️ Prórroga</span>}
              {f.venue && <span className="cp-final-tag">📍 {f.venue}</span>}
            </div>
            {f.note && <p className="cp-final-note">💬 "{f.note}"</p>}
          </div>
        )}
        {!isLive && (
          <div className="cp-detail-meta-grid">
            <div className="cp-meta-item">
              <strong>🥈 {ed.ru || '—'}</strong>
              <span>Subcampeón</span>
            </div>
            <div className="cp-meta-item">
              <strong>{ed.goals ?? '—'}</strong>
              <span>⚽ Goles totales</span>
            </div>
            <div className="cp-meta-item">
              <strong>{ed.top?.name?.split(' ').slice(-1)[0] ?? '—'} {ed.top?.g ?? ''}⚽</strong>
              <span>🎯 Máx. goleador</span>
            </div>
          </div>
        )}
        {ed.note && <div className="cp-detail-note">{ed.note}</div>}
      </div>
    </div>
  )
}

// ── Palmares tab ──────────────────────────────────────────────────────────────
function PalmaresTab({ data, comp }) {
  const years = [...data.editions].reverse()
  return (
    <div className="cp-palmares">
      <div className="table-wrap">
        <table className="data cp-table">
          <thead>
            <tr>
              <th>Año</th>
              {data.editions[0]?.host && <th>📍 Sede</th>}
              <th>🏆 Campeón</th>
              <th>Final</th>
              <th>🥈 Subcampeón</th>
              <th>🎯 Máx. goleador</th>
              <th className="ta-right">⚽ Goles</th>
            </tr>
          </thead>
          <tbody>
            {years.map(ed => (
              <tr key={ed.year} className={ed.status === 'live' ? 'tr-live' : ''}>
                <td><strong>{ed.year}</strong></td>
                {data.editions[0]?.host && (
                  <td>
                    <span className="cp-cell-flag">
                      <Flag code={ed.hc} size={13} />
                      {ed.host}
                    </span>
                  </td>
                )}
                <td>
                  {ed.champion ? (
                    <span className="cp-cell-flag cp-champ-cell">
                      <Flag code={ed.cc} size={13} />
                      <strong>{ed.champion}</strong>
                    </span>
                  ) : <span className="cp-muted">🔴 En curso</span>}
                </td>
                <td className="cp-score-cell">
                  {ed.final?.hs != null
                    ? `${ed.final.hs}–${ed.final.as}${ed.final.pen ? ` (${ed.final.penH}-${ed.final.penA}p)` : ed.final.et ? ' AET' : ''}`
                    : '—'}
                </td>
                <td>
                  {ed.ru ? (
                    <span className="cp-cell-flag">
                      <Flag code={ed.ruc} size={13} />
                      {ed.ru}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  {ed.top?.name ? (
                    <span className="cp-cell-flag">
                      <Flag code={ed.top.nc} size={13} />
                      {ed.top.name}
                      {ed.top.g && <strong className="cp-goals-badge"> {ed.top.g}⚽</strong>}
                    </span>
                  ) : '—'}
                </td>
                <td className="ta-right">{ed.goals ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Stats tab ─────────────────────────────────────────────────────────────────
function StatsTab({ data, comp }) {
  const { records } = data
  const totalGoals = data.editions.reduce((s, e) => s + (e.goals || 0), 0)
  const totalEditions = data.editions.filter(e => e.status !== 'live').length
  return (
    <div>
      <div className="cp-stat-grid">
        <div className="cp-stat-card">
          <div className="cp-stat-num"><CountUp value={totalEditions} /></div>
          <div className="cp-stat-label">🏆 Ediciones disputadas</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-num"><CountUp value={totalGoals} /></div>
          <div className="cp-stat-label">⚽ Goles históricos</div>
        </div>
        <div className="cp-stat-card accent">
          <div className="cp-stat-num">{records.mostTitles[0]?.titles}</div>
          <div className="cp-stat-label">👑 Récord títulos · {records.mostTitles[0]?.name}</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-num">{records.topScorers[0]?.goals}</div>
          <div className="cp-stat-label">🎯 Récord goles · {records.topScorers[0]?.name}</div>
        </div>
      </div>
      <div className="cp-records-grid">
        <div className="cp-records-block">
          <h3 className="cp-records-title">🏆 Más títulos</h3>
          <div className="cp-top-list">
            {records.mostTitles.map((t, i) => (
              <div key={t.name} className={`cp-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                <span className="cp-top-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                <Flag code={t.nc} size={15} />
                <span className="cp-top-name">{t.name}</span>
                <strong className="cp-top-goals">{t.titles} 🏆</strong>
                <span className="cp-top-detail" style={{ fontSize: '0.65rem' }}>{t.years}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="cp-records-block">
          <h3 className="cp-records-title">⚽ Máximos goleadores históricos</h3>
          <div className="cp-top-list">
            {records.topScorers.map((s, i) => (
              <div key={s.name} className={`cp-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                <span className="cp-top-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                <Flag code={s.nc} size={15} />
                <span className="cp-top-name">{s.name}</span>
                <strong className="cp-top-goals">{s.goals} ⚽</strong>
                <span className="cp-top-detail">{s.editions}</span>
              </div>
            ))}
          </div>
        </div>
        {records.mostFinals && (
          <div className="cp-records-block">
            <h3 className="cp-records-title">🎽 Más finales disputadas</h3>
            <div className="cp-top-list">
              {records.mostFinals.map((t, i) => (
                <div key={t.name} className={`cp-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  <span className="cp-top-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                  <Flag code={t.nc} size={15} />
                  <span className="cp-top-name">{t.name}</span>
                  <strong className="cp-top-goals">{t.finals} finales</strong>
                  <span className="cp-top-detail">{t.won} ganadas</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {records.mostAppearances && (
          <div className="cp-records-block">
            <h3 className="cp-records-title">🦾 Más partidos jugados</h3>
            <div className="cp-top-list">
              {records.mostAppearances.map((p, i) => (
                <div key={p.name} className={`cp-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  <span className="cp-top-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                  <Flag code={p.nc} size={15} />
                  <span className="cp-top-name">{p.name}</span>
                  <strong className="cp-top-goals">{p.apps} partidos</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Curiosities tab ───────────────────────────────────────────────────────────
function CuriosTab({ data, comp }) {
  const storageKey = `mfp_curio_${comp.id}`
  const [reactions, setReactions] = useState(() => loadReactions(storageKey))

  function toggle(id, emoji) {
    setReactions(prev => {
      const key = `${id}_${emoji}`
      const next = { ...prev, [key]: !prev[key] }
      saveReactions(storageKey, next)
      return next
    })
  }

  return (
    <div className="cp-curios-grid">
      {data.curiosities.map(c => (
        <div key={c.id} className="cp-curio-card">
          <div className="cp-curio-head">
            <span className="cp-curio-emoji">{c.emoji}</span>
            <div className="cp-curio-meta">
              <span className="cp-curio-tag">{c.tag}</span>
              <div className="cp-curio-title">{c.title}</div>
            </div>
          </div>
          <p className="cp-curio-body">{c.body}</p>
          <div className="cp-curio-reactions">
            {REACTIONS.map(r => {
              const key = `${c.id}_${r}`
              const active = !!reactions[key]
              return (
                <button key={r} className={`cp-reaction-btn ${active ? 'active' : ''}`}
                  onClick={() => toggle(c.id, r)}>
                  {r} {active ? '1' : ''}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'historia', label: '📅 Historia' },
  { id: 'palmares', label: '🏆 Palmarés' },
  { id: 'stats', label: '📊 Estadísticas' },
  { id: 'curiosidades', label: '🤯 Curiosidades' },
]

export default function CompetitionPage({ data }) {
  const [tab, setTab] = useState('historia')
  const [selected, setSelected] = useState(null)
  const { competition: comp, editions } = data

  const accent = comp.accent || '#fbbf24'
  const badgeBg = comp.color ? `${comp.color}22` : 'rgba(251,191,36,0.1)'

  useEffect(() => {
    setPageSeo({ title: comp.name, description: `Historia, récords y curiosidades de la ${comp.name}` })
  }, [comp.name])

  const totalGoals = editions.reduce((s, e) => s + (e.goals || 0), 0)
  const totalEditions = editions.filter(e => e.status !== 'live').length
  const currentChamp = editions.filter(e => e.champion).at(-1)

  return (
    <div className="cp-page container" style={{
      '--cp-accent': accent,
      '--cp-badge-bg': badgeBg,
      '--cp-badge-border': `${accent}50`,
      '--cp-hero-glow': `${comp.color}18`,
      '--cp-title-gradient': `linear-gradient(135deg, ${accent} 0%, ${comp.color} 100%)`,
    }}>
      {/* Hero */}
      <div className="cp-hero">
        <div className="cp-badge">{comp.emoji} {comp.governing} · Desde {comp.founded}</div>
        <h1 className="cp-hero-title">
          <span className="cp-hero-accent">{comp.name}</span>
        </h1>
        <p className="cp-hero-lead">
          Historia completa, récords, curiosidades y palmarés de la competición más prestigiosa de {comp.continent}.
        </p>
        <div className="cp-hero-stats">
          <div className="cp-hero-stat">
            <strong>{totalEditions}</strong>
            <span>Ediciones</span>
          </div>
          <div className="cp-hero-stat">
            <strong>{totalGoals.toLocaleString('es-ES')}</strong>
            <span>Goles históricos</span>
          </div>
          <div className="cp-hero-stat">
            <strong>{data.records.mostTitles[0]?.titles}</strong>
            <span>Récord títulos</span>
          </div>
          <div className="cp-hero-stat">
            <strong>{data.records.topScorers[0]?.goals}</strong>
            <span>Récord goles</span>
          </div>
        </div>
      </div>

      {/* Current champion */}
      {currentChamp && (
        <div className="cp-champ-banner">
          <span className="cp-champ-emoji">🏆</span>
          <div className="cp-champ-info">
            <div className="cp-champ-label">Campeón vigente · {currentChamp.year}</div>
            <div className="cp-champ-name">
              <Flag code={currentChamp.cc} size={16} /> {currentChamp.champion}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="cp-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`cp-tab ${tab === t.id ? 'cp-tab--active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'historia' && (
        <>
          <div className="cp-grid">
            {[...editions].reverse().map(ed => (
              <EditionCard key={ed.year} ed={ed} onSelect={setSelected} comp={comp} />
            ))}
          </div>
          {selected && (
            <EditionDetail ed={selected} onClose={() => setSelected(null)} comp={{ ...comp, badgeBg }} />
          )}
        </>
      )}
      {tab === 'palmares' && <PalmaresTab data={data} comp={comp} />}
      {tab === 'stats' && <StatsTab data={data} comp={comp} />}
      {tab === 'curiosidades' && <CuriosTab data={data} comp={comp} />}
    </div>
  )
}
