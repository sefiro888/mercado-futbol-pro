import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { setPageSeo } from '@/lib/seo.js'
import { useEffect } from 'react'
import WC_DATA from '@/data/worldcups.json'
import './Mundial.css'

const { editions, records, curiosities } = WC_DATA

// Banderas via flagcdn (2 letras ISO)
function Flag({ code, size = 20 }) {
  if (!code || code.startsWith('gb-')) {
    const special = { 'gb-eng': 'gb', 'gb-wls': 'gb', 'gb-nir': 'gb', 'gb-sct': 'gb' }
    const c = special[code] || 'xx'
    return <img src={`https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${c}.png`} alt="" className="wc-flag" />
  }
  return <img src={`https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${code}.png`} alt="" className="wc-flag" />
}

// Score + overtime/pens display
function Score({ m }) {
  if (!m) return null
  const { hs, as, et, pen, penH, penA } = m
  return (
    <span className="wc-score">
      {hs} – {as}
      {pen && penH != null && <span className="wc-score-pen">({penH}-{penA} pens)</span>}
      {et && !pen && <span className="wc-score-et">AET</span>}
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
        {isLive && <span className="wc-live-pill">EN CURSO</span>}
      </div>
      {!isLive ? (
        <>
          <div className="wc-ed-champ">
            <Flag code={ed.cc} size={14} />
            <strong>{ed.champion}</strong>
          </div>
          {ed.final && (
            <div className="wc-ed-score">
              <Score m={ed.final} />
              <small>vs {ed.ru}</small>
            </div>
          )}
          <div className="wc-ed-meta">
            <span>{ed.teams} equipos</span>
            <span>{ed.goals} goles</span>
            <span>{ed.top.name} ({ed.top.g} ⚽)</span>
          </div>
        </>
      ) : (
        <div className="wc-ed-meta">
          <span>{ed.teams} equipos</span>
          <span>104 partidos</span>
          <span>USA · México · Canadá</span>
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
      if (m?.note) return <div key={idx} className="wc-match wc-match-note">{m.note}</div>
      return null
    }
    return (
      <div key={idx} className={`wc-match ${m._isFinal ? 'wc-match-final' : ''} ${m.pen ? 'pens' : ''} ${m.note ? 'has-note' : ''}`}>
        <div className={`wc-match-team ${m.hs > m.as ? 'winner' : ''}`}>
          <Flag code={m.hc} size={14} />
          <span>{m.h}</span>
          <strong>{m.hs}</strong>
        </div>
        <div className={`wc-match-team ${m.as > m.hs ? 'winner' : m.pen && m.penA > m.penH ? 'winner' : ''}`}>
          <Flag code={m.ac} size={14} />
          <span>{m.a}</span>
          <strong>{m.as}</strong>
        </div>
        {m.pen && m.penH != null && (
          <div className="wc-match-pen">{m.penH}-{m.penA} penaltis</div>
        )}
        {m.et && !m.pen && <div className="wc-match-et">Prórroga</div>}
        {m.note && <div className="wc-match-note-text">{m.note}</div>}
      </div>
    )
  }

  return (
    <div className="wc-bracket">
      {finalRound && (
        <section className="wc-bracket-round">
          <h4 className="wc-round-label">Ronda final (Round Robin)</h4>
          <div className="wc-matches">{finalRound.map(renderMatch)}</div>
        </section>
      )}
      {secondRound && (
        <section className="wc-bracket-round">
          <h4 className="wc-round-label">Segunda fase de grupos</h4>
          <div className="wc-matches">{secondRound.map(renderMatch)}</div>
        </section>
      )}
      {r16 && r16.length > 0 && (
        <section className="wc-bracket-round">
          <h4 className="wc-round-label">Octavos de Final</h4>
          <div className="wc-matches wc-matches-grid">{r16.map(renderMatch)}</div>
        </section>
      )}
      {qf && qf.length > 0 && (
        <section className="wc-bracket-round">
          <h4 className="wc-round-label">Cuartos de Final</h4>
          <div className="wc-matches wc-matches-grid">{qf.map(renderMatch)}</div>
        </section>
      )}
      {sf && sf.length > 0 && (
        <section className="wc-bracket-round">
          <h4 className="wc-round-label">Semifinales</h4>
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
            <p className="wc-final-note">"{finalMatch.note}"</p>
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
              <th>Sede</th>
              <th>Campeón</th>
              <th>Final</th>
              <th>Subcampeón</th>
              <th>3.º Puesto</th>
              <th>Máximo goleador</th>
              <th className="ta-right">Equipos</th>
              <th className="ta-right">Goles</th>
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
                    </span>
                  ) : <span className="wc-muted">En curso</span>}
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
  const highestAvg = [...editions].filter(e => e.avgGoals).sort((a, b) => b.avgGoals - a.avgGoals)[0]
  const lowestAvg = [...editions].filter(e => e.avgGoals).sort((a, b) => a.avgGoals - b.avgGoals)[0]

  return (
    <div className="wc-stats">
      <div className="wc-stat-grid">
        <div className="wc-stat-card">
          <div className="wc-stat-num">{editions.length - 1}</div>
          <div className="wc-stat-label">Mundiales celebrados</div>
        </div>
        <div className="wc-stat-card">
          <div className="wc-stat-num">{totalGoals.toLocaleString()}</div>
          <div className="wc-stat-label">Goles totales (1930–2022)</div>
        </div>
        <div className="wc-stat-card">
          <div className="wc-stat-num">{totalMatches.toLocaleString()}</div>
          <div className="wc-stat-label">Partidos jugados</div>
        </div>
        <div className="wc-stat-card">
          <div className="wc-stat-num">{(totalAtt / 1e6).toFixed(1)}M</div>
          <div className="wc-stat-label">Espectadores totales</div>
        </div>
        <div className="wc-stat-card accent-gold">
          <div className="wc-stat-num">{highestAvg?.avgGoals}</div>
          <div className="wc-stat-label">Mayor media goles/partido ({highestAvg?.year} {highestAvg?.host})</div>
        </div>
        <div className="wc-stat-card accent-blue">
          <div className="wc-stat-num">{lowestAvg?.avgGoals}</div>
          <div className="wc-stat-label">Menor media goles/partido ({lowestAvg?.year} {lowestAvg?.host})</div>
        </div>
      </div>

      <div className="wc-records-grid">
        <div className="wc-records-block">
          <h3 className="wc-records-title">Máximos goleadores históricos</h3>
          <div className="wc-top-list">
            {records.topScorers.map((s, i) => (
              <div key={s.name} className={`wc-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                <span className="wc-top-rank">{i + 1}</span>
                <Flag code={s.nc} size={16} />
                <span className="wc-top-name">{s.name}</span>
                <strong className="wc-top-goals">{s.goals} ⚽</strong>
                <span className="wc-top-detail">{s.editions}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="wc-records-block">
          <h3 className="wc-records-title">Más títulos mundiales</h3>
          <div className="wc-top-list">
            {records.mostTitles.map((t, i) => (
              <div key={t.name} className={`wc-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                <span className="wc-top-rank">{i + 1}</span>
                <Flag code={t.nc} size={16} />
                <span className="wc-top-name">{t.name}</span>
                <strong className="wc-top-goals">{t.titles} 🏆</strong>
                <span className="wc-top-detail">{t.years}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="wc-records-block">
          <h3 className="wc-records-title">Más finales disputadas</h3>
          <div className="wc-top-list">
            {records.mostFinals.map((t, i) => (
              <div key={t.name} className={`wc-top-row ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                <span className="wc-top-rank">{i + 1}</span>
                <Flag code={t.nc} size={16} />
                <span className="wc-top-name">{t.name}</span>
                <span className="wc-top-goals">{t.finals} finales</span>
                <strong className="wc-top-detail">{t.wins} ganadas</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="wc-records-block">
          <h3 className="wc-records-title">Goles por edición</h3>
          <div className="wc-goals-chart">
            {editions.filter(e => e.goals).map(ed => {
              const max = 172
              const pct = Math.round((ed.goals / max) * 100)
              return (
                <div key={ed.year} className="wc-goals-bar-row">
                  <span className="wc-goals-year">{ed.year}</span>
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

// Pestaña de curiosidades
function CuriosidadesTab() {
  return (
    <div className="wc-curiosidades">
      {curiosities.map(c => (
        <div key={c.id} className="wc-curio-card">
          <div className="wc-curio-icon">{c.icon}</div>
          <div className="wc-curio-body">
            <h3 className="wc-curio-title">{c.title}</h3>
            <p className="wc-curio-text">{c.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Pestaña "Por edición": selector de año + bracket completo
function EdicionTab() {
  const selectableEditions = editions.filter(e => e.rounds)
  const [selectedYear, setSelectedYear] = useState(2022)
  const ed = editions.find(e => e.year === selectedYear)

  return (
    <div className="wc-edicion">
      <div className="wc-year-selector">
        {selectableEditions.map(e => (
          <button
            key={e.year}
            className={`wc-year-btn ${e.year === selectedYear ? 'active' : ''} ${e.status === 'live' ? 'live' : ''}`}
            onClick={() => setSelectedYear(e.year)}
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
                  <span>Campeón:</span>
                  <Flag code={ed.cc} size={18} />
                  <strong>{ed.champion}</strong>
                </div>
              )}
            </div>
            {ed.nickname && (
              <div className="wc-ed-detail-nickname">
                <span>"{ed.nickname}"</span>
              </div>
            )}
          </div>

          <div className="wc-ed-curiosity">
            <span className="wc-curio-icon-sm">💡</span>
            {ed.curiosity}
          </div>

          <div className="wc-ed-detail-meta">
            <span>{ed.teams} equipos</span>
            <span>{ed.matches} partidos</span>
            {ed.goals && <span>{ed.goals} goles</span>}
            {ed.avgGoals && <span>{ed.avgGoals} goles/partido</span>}
            {ed.att && <span>{(ed.att / 1e6).toFixed(2)}M espectadores</span>}
            {ed.top?.g && (
              <span>
                <Flag code={ed.top.nc} size={13} />
                {ed.top.name} — {ed.top.g} ⚽
              </span>
            )}
          </div>

          <EditionBracket ed={ed} />
        </div>
      )}
    </div>
  )
}

const TABS = [
  { id: 'historia', label: '📅 Historia' },
  { id: 'palmares', label: '🏆 Palmarés' },
  { id: 'estadisticas', label: '📊 Estadísticas' },
  { id: 'curiosidades', label: '💡 Curiosidades' },
  { id: 'edicion', label: '🔍 Por edición' },
]

export default function Mundial() {
  const [tab, setTab] = useState('historia')
  const [selectedEd, setSelectedEd] = useState(null)

  useEffect(() => {
    setPageSeo({
      title: 'Historia del Mundial de Fútbol — Todos los Mundiales 1930–2026 | Mercado Fútbol Pro',
      description: 'Palmarés completo, estadísticas, curiosidades y brackets de todos los Mundiales de fútbol desde Uruguay 1930 hasta Catar 2022 y el Mundial 2026.',
    })
  }, [])

  function handleEdSelect(ed) {
    setSelectedEd(ed)
    setTab('edicion')
  }

  return (
    <div className="container section wc-page">
      {/* Hero */}
      <header className="wc-hero">
        <div className="wc-hero-badge">⚽ Copa del Mundo FIFA</div>
        <h1 className="wc-hero-title">
          Historia del <span className="wc-hero-gold">Mundial</span>
        </h1>
        <p className="wc-hero-lead">
          22 ediciones · 92 años · Todos los resultados, palmarés y datos desglosados partido a partido desde Uruguay 1930 hasta la gloria de Argentina en Catar 2022
        </p>
        <div className="wc-hero-stats">
          <div className="wc-hs"><strong>22</strong><span>Mundiales</span></div>
          <div className="wc-hs"><strong>2.458</strong><span>Partidos</span></div>
          <div className="wc-hs"><strong>16</strong><span>Goles de Klose</span></div>
          <div className="wc-hs"><strong>13</strong><span>Goles de Fontaine 1958</span></div>
          <div className="wc-hs"><strong>5</strong><span>Copas de Brasil</span></div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="wc-tabs">
        {TABS.map(t => (
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
        {tab === 'historia' && (
          <div>
            <p className="wc-intro">Haz clic en cualquier edición para ver el bracket completo con todos los resultados desglosados.</p>
            <div className="wc-editions-grid">
              {[...editions].reverse().map(ed => (
                <EditionCard key={ed.year} ed={ed} onSelect={handleEdSelect} />
              ))}
            </div>
          </div>
        )}
        {tab === 'palmares' && <PalmaresTab />}
        {tab === 'estadisticas' && <StatsTab />}
        {tab === 'curiosidades' && <CuriosidadesTab />}
        {tab === 'edicion' && <EdicionTab />}
      </div>
    </div>
  )
}
