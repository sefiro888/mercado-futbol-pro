import { useMemo } from 'react'
import { getAllPlayers, getAllClubs, getAllTransfers } from '@/lib/data.js'
import './LeagueStats.css'

const TODAY = new Date('2026-07-04')

function calcAge(birthDate) {
  if (!birthDate) return null
  const b = new Date(birthDate)
  let age = TODAY.getFullYear() - b.getFullYear()
  const m = TODAY.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && TODAY.getDate() < b.getDate())) age--
  return age
}

const LEAGUES = [
  { id: 'LaLiga',         color: '#e63946', flag: 'ES' },
  { id: 'Premier League', color: '#3a86ff', flag: 'EN' },
  { id: 'Serie A',        color: '#2ec4b6', flag: 'IT' },
  { id: 'Bundesliga',     color: '#ffd166', flag: 'DE' },
  { id: 'Ligue 1',        color: '#a8dadc', flag: 'FR' },
  { id: 'Liga Portugal',  color: '#8338ec', flag: 'PT' },
  { id: 'Brasileirão',    color: '#06d6a0', flag: 'BR' },
]

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="ls-bar-wrap">
      <div className="ls-bar" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function LeagueRow({ league, data, maxSpend, maxAge, maxDepend, rank }) {
  if (!data) return null
  return (
    <div className="ls-row">
      <div className="ls-rank">{rank}</div>
      <div className="ls-league-name">
        <span className="ls-flag">{league.flag}</span>
        <span>{league.id}</span>
      </div>
      <div className="ls-col">
        <span className="ls-val">{data.spend > 0 ? `${data.spend} M€` : '—'}</span>
        <Bar value={data.spend} max={maxSpend} color={league.color} />
      </div>
      <div className="ls-col">
        <span className="ls-val">{data.income > 0 ? `${data.income} M€` : '—'}</span>
        <Bar value={data.income} max={maxSpend} color={`${league.color}99`} />
      </div>
      <div className="ls-col">
        <span className="ls-val">{data.avgAge ? `${data.avgAge.toFixed(1)} años` : '—'}</span>
        <Bar value={data.avgAge ?? 0} max={maxAge} color={league.color} />
      </div>
      <div className="ls-col">
        <span className="ls-val">{data.squadValue > 0 ? `${data.squadValue} M€` : '—'}</span>
        <Bar value={data.squadValue} max={maxDepend} color={league.color} />
      </div>
    </div>
  )
}

export default function LeagueStats() {
  const allPlayers   = useMemo(() => getAllPlayers(), [])
  const allClubs     = useMemo(() => getAllClubs(), [])
  const allTransfers = useMemo(() => getAllTransfers(), [])

  const stats = useMemo(() => {
    const map = {}

    for (const l of LEAGUES) {
      const clubs = allClubs.filter((c) => c.league === l.id)
      const clubIds = new Set(clubs.map((c) => c.id))
      const players = allPlayers.filter((p) => {
        const pid = p.currentClubId ?? p.clubId ?? p.club?.id
        return pid && clubIds.has(pid)
      })

      // Gasto / ingreso via transfers
      let spend = 0, income = 0
      for (const t of allTransfers) {
        const fee = t.transferFee ?? 0
        if (clubIds.has(t.toClubId))   spend  += fee
        if (clubIds.has(t.fromClubId)) income += fee
      }

      // Edad media
      const ages = players.map((p) => calcAge(p.birthDate)).filter((a) => a !== null && a > 14 && a < 45)
      const avgAge = ages.length > 0 ? ages.reduce((s, a) => s + a, 0) / ages.length : null

      // Valor plantilla total
      const squadValue = Math.round(clubs.reduce((s, c) => s + (c.squadValue ?? 0), 0))

      map[l.id] = { spend, income, avgAge, squadValue, playerCount: players.length, clubCount: clubs.length }
    }

    return map
  }, [allPlayers, allClubs, allTransfers])

  const maxSpend  = Math.max(...Object.values(stats).map((s) => s.spend), 1)
  const maxAge    = Math.max(...Object.values(stats).map((s) => s.avgAge ?? 0), 1)
  const maxDepend = Math.max(...Object.values(stats).map((s) => s.squadValue), 1)

  const sorted = {
    spend:      [...LEAGUES].sort((a, b) => (stats[b.id]?.spend ?? 0)   - (stats[a.id]?.spend ?? 0)),
    income:     [...LEAGUES].sort((a, b) => (stats[b.id]?.income ?? 0)  - (stats[a.id]?.income ?? 0)),
    age:        [...LEAGUES].sort((a, b) => (stats[a.id]?.avgAge ?? 99) - (stats[b.id]?.avgAge ?? 99)),
    squadValue: [...LEAGUES].sort((a, b) => (stats[b.id]?.squadValue ?? 0) - (stats[a.id]?.squadValue ?? 0)),
  }

  const totalSpend = Object.values(stats).reduce((s, v) => s + v.spend, 0)
  const totalIncome = Object.values(stats).reduce((s, v) => s + v.income, 0)

  return (
    <div className="league-stats page-fade-in">
      <div className="ls-hero">
        <p className="ls-eyebrow">ANÁLISIS ECONÓMICO</p>
        <h1>Comparativa de ligas</h1>
        <p className="ls-sub">Gasto, ingresos, edad media y valor de plantilla en el mercado verano 2026.</p>
      </div>

      {/* Resumen global */}
      <div className="ls-summary">
        <div className="ls-summary-stat">
          <span className="ls-summary-val">{totalSpend.toLocaleString('es-ES')} M€</span>
          <span className="ls-summary-label">Gasto total 7 ligas</span>
        </div>
        <div className="ls-summary-stat">
          <span className="ls-summary-val">{totalIncome.toLocaleString('es-ES')} M€</span>
          <span className="ls-summary-label">Ingresos por ventas</span>
        </div>
        <div className="ls-summary-stat">
          <span className="ls-summary-val">{(totalSpend - totalIncome).toLocaleString('es-ES')} M€</span>
          <span className="ls-summary-label">Gasto neto</span>
        </div>
        <div className="ls-summary-stat">
          <span className="ls-summary-val">{allTransfers.length}</span>
          <span className="ls-summary-label">Traspasos confirmados</span>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="ls-table-wrap">
        <div className="ls-table-head">
          <div className="ls-rank">#</div>
          <div className="ls-league-name">Liga</div>
          <div className="ls-col">Gasto (compras)</div>
          <div className="ls-col">Ingresos (ventas)</div>
          <div className="ls-col">Edad media</div>
          <div className="ls-col">Valor plantilla</div>
        </div>

        {LEAGUES.map((l, i) => (
          <LeagueRow
            key={l.id}
            league={l}
            data={stats[l.id]}
            maxSpend={maxSpend}
            maxAge={maxAge}
            maxDepend={maxDepend}
            rank={i + 1}
          />
        ))}
      </div>

      {/* Rankings individuales */}
      <div className="ls-rankings">
        <RankingBlock title="Mayor gasto" leagues={sorted.spend} stats={stats} field="spend" unit="M€" />
        <RankingBlock title="Mayor ingreso" leagues={sorted.income} stats={stats} field="income" unit="M€" />
        <RankingBlock title="Plantilla más joven" leagues={sorted.age} stats={stats} field="avgAge" unit="años" decimals={1} />
        <RankingBlock title="Mayor valor de plantilla" leagues={sorted.squadValue} stats={stats} field="squadValue" unit="M€" />
      </div>
    </div>
  )
}

function RankingBlock({ title, leagues, stats, field, unit, decimals = 0 }) {
  return (
    <div className="ls-rank-block">
      <h3 className="ls-rank-title">{title}</h3>
      {leagues.slice(0, 5).map((l, i) => {
        const val = stats[l.id]?.[field] ?? 0
        return (
          <div key={l.id} className="ls-rank-row">
            <span className={`ls-rank-n ${i < 3 ? `ls-rank-${i + 1}` : ''}`}>{i + 1}</span>
            <span className="ls-rank-flag">{l.flag}</span>
            <span className="ls-rank-name">{l.id}</span>
            <span className="ls-rank-val">
              {decimals > 0 ? val.toFixed(decimals) : val.toLocaleString('es-ES')} {unit}
            </span>
          </div>
        )
      })}
    </div>
  )
}
