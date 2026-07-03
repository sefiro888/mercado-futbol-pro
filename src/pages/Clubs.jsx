import { useEffect, useMemo, useState } from 'react'
import ClubCard from '@/components/ClubCard.jsx'
import FilterPanel from '@/components/FilterPanel.jsx'
import Icon from '@/components/Icon.jsx'
import { setPageSeo } from '@/lib/seo.js'
import { getAllClubs, getPlayersByClub, getLeagues } from '@/lib/data.js'
import './Pages.css'

const EMPTY = { q: '', league: '' }

export default function Clubs() {
  const [filters, setFilters] = useState(EMPTY)

  useEffect(() => {
    setPageSeo({
      title: 'Clubes',
      description: 'Fichas de clubes con plantilla, valor de mercado, edad media, fichajes, salidas y rumores relacionados.',
    })
  }, [])

  const allClubs = useMemo(() => getAllClubs(), [])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return allClubs.filter((c) => {
      if (filters.league && c.league !== filters.league) return false
      if (q && !`${c.name} ${c.country} ${c.coach}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [allClubs, filters])

  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const fields = [
    { type: 'text', name: 'q', label: 'Buscar', placeholder: 'Club, país o entrenador…' },
    { type: 'select', name: 'league', label: 'Liga', options: getLeagues().map((l) => ({ value: l, label: l })) },
  ]

  return (
    <>
      <div className="container page-header">
        <Icon name="shield" size={150} className="page-watermark" />
        <h1>Clubes</h1>
        <p>Explora las fichas de cada club: plantilla, valor de mercado, movimientos y rumores.</p>
      </div>

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
