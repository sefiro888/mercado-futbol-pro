import { useEffect, useMemo, useState } from 'react'
import ClubCard from '@/components/ClubCard.jsx'
import FilterPanel from '@/components/FilterPanel.jsx'
import Icon from '@/components/Icon.jsx'
import { setPageSeo } from '@/lib/seo.js'
import PremiumHeader from '@/components/PremiumHeader.jsx'
import { formatMoney } from '@/lib/format.js'
import { getAllClubs, getPlayersByClub, getLeagues, getLeagueSummary, getSquadDashboard } from '@/lib/data.js'
import './Pages.css'

const EMPTY = { q: '', league: '', sort: 'value-desc' }

function SquadAuditCard({ icon, label, value, hint, accent = '#22c55e' }) {
  return (
    <div className="card squad-audit-card" style={{ '--audit-c': accent }}>
      <span className="sqa-icon"><Icon name={icon} size={20} /></span>
      <span className="sqa-copy">
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{hint}</em>
      </span>
    </div>
  )
}

export default function Clubs() {
  const [filters, setFilters] = useState(EMPTY)

  useEffect(() => {
    setPageSeo({
      title: 'Clubes',
      description: 'Fichas de clubes con plantilla, valor de mercado, edad media, fichajes, salidas y rumores relacionados.',
    })
  }, [])

  const allClubs = useMemo(() => getAllClubs(), [])
  const leagueSummary = useMemo(() => getLeagueSummary(), [])
  const squadDashboard = useMemo(() => getSquadDashboard(), [])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const list = allClubs.filter((c) => {
      if (filters.league && c.league !== filters.league) return false
      if (q && !`${c.name} ${c.country} ${c.coach}`.toLowerCase().includes(q)) return false
      return true
    })

    return list.sort((a, b) => {
      if (filters.sort === 'name-asc') return a.name.localeCompare(b.name, 'es')
      if (filters.sort === 'age-asc') return (a.averageAge || 99) - (b.averageAge || 99)
      if (filters.sort === 'players-desc') {
        return getPlayersByClub(b.id).length - getPlayersByClub(a.id).length
      }
      return (b.squadValue || 0) - (a.squadValue || 0)
    })
  }, [allClubs, filters])

  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const fields = [
    { type: 'text', name: 'q', label: 'Buscar', placeholder: 'Club, país o entrenador…' },
    { type: 'select', name: 'league', label: 'Liga', options: getLeagues().map((l) => ({ value: l, label: l })) },
    {
      type: 'select',
      name: 'sort',
      label: 'Orden',
      options: [
        { value: 'value-desc', label: 'Mayor valor de plantilla' },
        { value: 'players-desc', label: 'Plantilla más amplia' },
        { value: 'age-asc', label: 'Edad media más baja' },
        { value: 'name-asc', label: 'Nombre A-Z' },
      ],
    },
  ]

  return (
    <>
      <PremiumHeader
        title="Clubes"
        description="Explora las fichas de cada club: plantilla, valor de mercado, movimientos y rumores."
        tag="CLUBES"
        icon="shield"
        theme="clubs"
      />

      <section className="container section league-switcher">
        <button
          className={`league-switch-card card ${filters.league === '' ? 'is-active' : ''}`}
          type="button"
          onClick={() => set('league', '')}
        >
          <strong>Todos</strong>
          <span>{allClubs.length} clubes</span>
          <small>{formatMoney(allClubs.reduce((sum, c) => sum + (c.squadValue || 0), 0))}</small>
        </button>
        {leagueSummary.map((league) => (
          <button
            key={league.league}
            className={`league-switch-card card ${filters.league === league.league ? 'is-active' : ''}`}
            type="button"
            onClick={() => set('league', league.league)}
          >
            <strong>{league.league}</strong>
            <span>{league.clubs} clubes</span>
            <small>{formatMoney(league.value)}</small>
          </button>
        ))}
      </section>

      <section className="container squad-audit">
        <SquadAuditCard
          icon="person"
          label="Plantillas revisadas"
          value={`${squadDashboard.totalPlayers} jugadores`}
          hint={`${squadDashboard.totalClubs} clubes · 27/06/2026`}
          accent="#22c55e"
        />
        <SquadAuditCard
          icon="money"
          label="Mayor valor"
          value={squadDashboard.mostValuableClub?.club.name || 'Sin datos'}
          hint={squadDashboard.mostValuableClub ? formatMoney(squadDashboard.mostValuableClub.value) : 'Pendiente'}
          accent="#38bdf8"
        />
        <SquadAuditCard
          icon="clock"
          label="Plantilla joven"
          value={squadDashboard.youngestClub?.club.name || 'Sin datos'}
          hint={squadDashboard.youngestClub ? `${squadDashboard.youngestClub.averageAge} años de media` : 'Pendiente'}
          accent="#a78bfa"
        />
        <SquadAuditCard
          icon="handshake"
          label="Más actividad"
          value={squadDashboard.mostActiveSquad?.club.name || 'Sin datos'}
          hint={squadDashboard.mostActiveSquad ? `${squadDashboard.mostActiveSquad.activity} movimientos` : 'Sin movimientos'}
          accent="#fbbf24"
        />
      </section>

      <div className="container section">
        <div className="list-layout">
          <FilterPanel
            fields={fields}
            values={filters}
            onChange={set}
            onReset={() => setFilters(EMPTY)}
            resultCount={filtered.length}
          />
          {filtered.length > 0 ? (
            <div className="grid grid-auto">
              {filtered.map((c) => (
                <ClubCard key={c.id} club={c} playerCount={getPlayersByClub(c.id).length} />
              ))}
            </div>
          ) : (
            <div className="empty-state">No hay clubes que coincidan con los filtros.</div>
          )}
        </div>
      </div>
    </>
  )
}
