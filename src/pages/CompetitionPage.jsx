import { useState, useEffect } from 'react'
import { setPageSeo } from '@/lib/seo.js'
import './CompetitionPage.css'

// ── Utilidades ───────────────────────────────────────────────
function useCountUp(target, { duration = 1200, decimals = 0 } = {}) {
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

// ── Flag ─────────────────────────────────────────────────────
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
      width={Math.round(size * 1.33)} height={size}
      style={{ height: size }} alt="" loading="lazy" decoding="async"
      className="cp-flag-img" onError={() => setFailed(true)}
    />
  )
}

// ── Edition card ─────────────────────────────────────────────
function EditionCard({ ed, onSelect, comp }) {
  const isLive = ed.status === 'live'
  return (
    <button
      className={`cp-ed-card ${isLive ? 'live' : ''}`}
      onClick={() => onSelect(ed)}
      style={{ '--cp-accent': comp.accent }}
    >
      <div className="cp-ed-year">{ed.year}</div>
      {ed.host && (
        <div className="cp-ed-host">
          <Flag code={ed.hc} size={13} />
          <span>{ed.host}</span>
          {isLive && <span className="cp-live-pill">🔴 En curso</span>}
        </div>
      )}
      {!isLive && ed.champion && (
        <>
          <div className="cp-ed-champ">
            <Flag code={ed.cc} size={13} />
            <strong>🏆 {ed.champion}</strong>
          </div>
          {ed.final && ed.final.hs != null && (
            <div className="cp-ed-score">
              {ed.final.hs}–{ed.final.as}
              {ed.final.pen && ` (${ed.final.penH}-${ed.final.penA}p)`}
              {ed.final.et && !ed.final.pen && ' AET'}
            </div>
          )}
          <div className="cp-ed-meta">
            {ed.top?.name && <span>⚽ {ed.top.name.split(' ').pop()} {ed.top.g && `${ed.top.g}g`}</span>}
            {ed.goals && <span>🥅 {ed.goals} goles</span>}
          </div>
        </>
      )}
    </button>
  )
}

// ── Edition detail modal ──────────────────────────────────────
function EditionDetail({ ed, onClose, comp }) {
  if (!ed) return null
  const { final: f } = ed
  const isLive = ed.status === 'live'
  const champWon = f && (f.hs > f.as || (f.pen && f.penH > f.penA))

  return (
    <div className="cp-detail-backdrop" onClick={onClose}>
      <div
        className="cp-detail"
        style={{ '--cp-accent': comp.accent, '--cp-badge-bg': comp.badgeBg }}
        onClick={e => e.stopPropagation()}
      >
        <button className="cp-detail-close" onClick={onClose}>✕</button>

        <div className="cp-detail-year">{ed.year}</div>
        <div className="cp-detail-host">
          <Flag code={ed.hc} size={16} />
          <span>{ed.host}</span>
        </div>

        {f && f.hs != null && !isLive && (
          <div className="cp-detail-final">
            <div className="cp-final-label">⚽ Final · {f.venue || ''}</div>
            <div className="cp-final-teams">
              <div className={`cp-final-team ${champWon ? 'winner' : ''}`}>
                <span className="cp-final-team-flag"><Flag code={ed.cc} size={22} /></span>
                <span>{f.h || ed.champion}</span>
              </div>
              <div className="cp-final-score">{f.hs} – {f.as}</div>
              <div className={`cp-final-team ${!champWon ? 'winner' : ''}`}>
                <span className="cp-final-team-flag"><Flag code={ed.ruc} size={22} /></span>
                <span>{f.a || ed.ru}</span>
              </div>
            </div>
            <div className="cp-final-tags">
              {f.pen && f.penH != null && <span className="cp-final-tag">🎯 {f.penH}-{f.penA} penaltis</span>}
              {f.et && !f.pen && <span className="cp-final-tag">⏱️ Prórroga</span>}
              {f.note && <span className="cp-final-tag">💬 Historia</span>}
            </div>
            {f.note && <p className="cp-final-note">"{f.note}"</p>}
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
              <strong>{ed.top?.name?.split(' ').slice(-1)[0] ?? '—'} {ed.top?.g ? `${ed.top.g}⚽` : ''}</strong>
              <span>🎯 Máx. goleador</span>
            </div>
          </div>
        )}

        {ed.note && <div className="cp-detail-note">{ed.note}</div>}
      </div>
    </div>
  )
}

// ── Palmarés ──────────────────────────────────────────────────
function PalmaresTab({ data }) {
  const years = [...data.editions].reverse()
  const hasHost = !!data.editions[0]?.host
  return (
    <div className="cp-palmares">
      <div className="table-wrap">
        <table className="data cp-table">
          <thead>
            <tr>
              <th>Año</th>
              {hasHost && <th>📍 Sede</th>}
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
                {hasHost && (
                  <td>
                    <span className="cp-cell-flag">
                      <Flag code={ed.hc} size={13} />{ed.host}
                    </span>
                  </td>
                )}
                <td>
                  {ed.champion
                    ? <span className="cp-cell-flag cp-champ-cell"><Flag code={ed.cc} size={13} /><strong>{ed.champion}</strong></span>
                    : <span className="cp-muted">🔴 En curso</span>}
                </td>
                <td className="cp-score-cell">
                  {ed.final?.hs != null
                    ? `${ed.final.hs}–${ed.final.as}${ed.final.pen ? ` (${ed.final.penH}-${ed.final.penA}p)` : ed.final.et ? ' AET' : ''}`
                    : '—'}
                </td>
                <td>
                  {ed.ru
                    ? <span className="cp-cell-flag"><Flag code={ed.ruc} size={13} />{ed.ru}</span>
                    : '—'}
                </td>
                <td>
                  {ed.top?.name
                    ? <span className="cp-cell-flag"><Flag code={ed.top.nc} size={13} />{ed.top.name}{ed.top.g && <strong className="cp-goals-badge"> {ed.top.g}⚽</strong>}</span>
                    : '—'}
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

// ── Stats ─────────────────────────────────────────────────────
function TopList({ items, valueKey, valueSuffix, accent }) {
  const max = items[0]?.[valueKey] || 1
  const barColors = [
    'rgba(251,191,36,0.18)', 'rgba(156,163,175,0.12)', 'rgba(180,120,60,0.12)'
  ]
  return (
    <div className="cp-top-list">
      {items.map((t, i) => (
        <div
          key={t.name}
          className={`cp-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}
          style={{
            '--bar-w': `${Math.round((t[valueKey] / max) * 100)}%`,
            '--bar-color': barColors[i] || 'rgba(255,255,255,0.05)',
          }}
        >
          <span className="cp-top-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
          <Flag code={t.nc} size={15} />
          <span className="cp-top-name">{t.name}</span>
          <strong className="cp-top-goals">{t[valueKey]}{valueSuffix}</strong>
        </div>
      ))}
    </div>
  )
}

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
          <TopList items={records.mostTitles} valueKey="titles" valueSuffix=" 🏆" accent={comp.accent} />
        </div>
        <div className="cp-records-block">
          <h3 className="cp-records-title">⚽ Máximos goleadores históricos</h3>
          <TopList items={records.topScorers} valueKey="goals" valueSuffix=" ⚽" accent={comp.accent} />
        </div>
        {records.mostFinals && (
          <div className="cp-records-block">
            <h3 className="cp-records-title">🎽 Más finales disputadas</h3>
            <TopList items={records.mostFinals} valueKey="finals" valueSuffix=" finales" accent={comp.accent} />
          </div>
        )}
        {records.mostAppearances && (
          <div className="cp-records-block">
            <h3 className="cp-records-title">🦾 Más partidos jugados</h3>
            <TopList items={records.mostAppearances} valueKey="apps" valueSuffix=" partidos" accent={comp.accent} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Curiosidades ──────────────────────────────────────────────
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
          <div className="cp-curio-header-strip" />
          <div className="cp-curio-body-wrap">
            <div className="cp-curio-head">
              <div className="cp-curio-emoji-wrap">{c.emoji}</div>
              <div className="cp-curio-meta">
                <span className="cp-curio-tag">{c.tag}</span>
                <div className="cp-curio-title">{c.title}</div>
              </div>
            </div>
            <p className="cp-curio-text">{c.body}</p>
            <div className="cp-curio-reactions">
              {REACTIONS.map(r => {
                const key = `${c.id}_${r}`
                const active = !!reactions[key]
                return (
                  <button
                    key={r}
                    className={`cp-reaction-btn ${active ? 'active' : ''}`}
                    onClick={() => toggle(c.id, r)}
                  >
                    {r}{active ? ' 1' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
const TABS = [
  { id: 'historia',     label: '📅 Historia' },
  { id: 'palmares',     label: '🏆 Palmarés' },
  { id: 'stats',        label: '📊 Estadísticas' },
  { id: 'curiosidades', label: '🤯 Curiosidades' },
]

export default function CompetitionPage({ data }) {
  const [tab, setTab] = useState('historia')
  const [selected, setSelected] = useState(null)
  const { competition: comp, editions } = data

  const accent   = comp.accent  || '#fbbf24'
  const badgeBg  = comp.color   ? `${comp.color}22` : 'rgba(251,191,36,0.1)'

  useEffect(() => {
    setPageSeo({ title: comp.name, description: `Historia, récords y curiosidades de la ${comp.name}` })
  }, [comp.name])

  const totalGoals    = editions.reduce((s, e) => s + (e.goals || 0), 0)
  const totalEditions = editions.filter(e => e.status !== 'live').length
  const currentChamp  = editions.filter(e => e.champion).at(-1)

  return (
    <div className="cp-page container" style={{
      '--cp-accent':         accent,
      '--cp-badge-bg':       badgeBg,
      '--cp-badge-border':   `${accent}55`,
      '--cp-hero-glow':      `${comp.color}20`,
      '--cp-title-gradient': `linear-gradient(135deg, ${accent} 0%, ${comp.color} 100%)`,
    }}>

      {/* ── Hero ────────────────────────────────────────── */}
      <div className="cp-hero">
        <div className="cp-hero-emblem">
          <span className="cp-emblem-ring" />
          <span className="cp-emblem-icon">{comp.emoji}</span>
        </div>

        <div className="cp-badge">{comp.governing} · Desde {comp.founded}</div>

        <h1 className="cp-hero-title">
          <span className="cp-hero-accent">{comp.name}</span>
        </h1>
        <p className="cp-hero-lead">
          Historia completa, récords, curiosidades y palmarés de
          la competición más prestigiosa de {comp.continent}.
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

      {/* ── Campeón vigente ─────────────────────────────── */}
      {currentChamp && (
        <div className="cp-champ-banner">
          <span className="cp-champ-trophy">🏆</span>
          <div className="cp-champ-info">
            <div className="cp-champ-label">Campeón vigente</div>
            <div className="cp-champ-name">
              <Flag code={currentChamp.cc} size={20} />
              {currentChamp.champion}
            </div>
            {currentChamp.final?.venue && (
              <div className="cp-champ-sub">Final en {currentChamp.final.venue}</div>
            )}
          </div>
          <div className="cp-champ-badge-wrap">
            <div className="cp-champ-year-badge">
              <span className="year">{currentChamp.year}</span>
              <span className="label">Edición</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="cp-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`cp-tab ${tab === t.id ? 'cp-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Contenido ───────────────────────────────────── */}
      {tab === 'historia' && (
        <>
          <div className="cp-grid">
            {[...editions].reverse().map(ed => (
              <EditionCard key={ed.year} ed={ed} onSelect={setSelected} comp={comp} />
            ))}
          </div>
          {selected && (
            <EditionDetail
              ed={selected}
              onClose={() => setSelected(null)}
              comp={{ ...comp, badgeBg }}
            />
          )}
        </>
      )}

      {tab === 'palmares'     && <PalmaresTab data={data} comp={comp} />}
      {tab === 'stats'        && <StatsTab    data={data} comp={comp} />}
      {tab === 'curiosidades' && <CuriosTab   data={data} comp={comp} />}
    </div>
  )
}
