import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PlayerCard from '@/components/PlayerCard.jsx'
import FilterPanel from '@/components/FilterPanel.jsx'
import Icon from '@/components/Icon.jsx'
import StatCard from '@/components/StatCard.jsx'
import PremiumHeader from '@/components/PremiumHeader.jsx'
import { setPageSeo } from '@/lib/seo.js'
import { PLAYER_STATUS } from '@/lib/taxonomy.js'
import { formatMoney } from '@/lib/format.js'
import {
  getAllPlayers,
  getAllClubs,
  getClubById,
  getLeagues,
  getPositions,
  getNationalities,
  getSquadDashboard,
} from '@/lib/data.js'
import './Pages.css'

export default function Players() {
  // Lee ?q= de la URL (lo usa el buscador del header).
  const [params] = useSearchParams()
  const initialQ = params.get('q') || ''

  const [filters, setFilters] = useState({
    q: initialQ,
    club: '',
    league: '',
    position: '',
    nationality: '',
    status: '',
    sort: 'value-desc',
    value: { min: '', max: '' },
  })

  useEffect(() => {
    setPageSeo({
      title: 'Jugadores',
      description: 'Fichas de jugadores con datos personales y deportivos, valor de mercado, historial y noticias relacionadas.',
    })
  }, [])

  // Si cambia el ?q= externo (navegación desde el header), sincroniza el filtro.
  useEffect(() => {
    setFilters((f) => ({ ...f, q: initialQ }))
  }, [initialQ])

  // Orden por defecto: mayor valor de mercado primero (las estrellas arriba).
  const allPlayers = useMemo(
    () => [...getAllPlayers()].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0)),
    [],
  )

  const playerStats = useMemo(() => {
    const top = allPlayers[0]
    const ages = allPlayers.map((p) => p.age).filter((age) => age != null)
    const avgAge = ages.length
      ? Math.round((ages.reduce((sum, age) => sum + age, 0) / ages.length) * 10) / 10
      : null
    return {
      total: allPlayers.length,
      top,
      topClub: top ? getClubById(top.currentClubId) : null,
      u21: allPlayers.filter((p) => (p.age || 99) <= 21).length,
      avgAge,
    }
  }, [allPlayers])

  const squadDashboard = useMemo(() => getSquadDashboard(), [])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const min = filters.value.min === '' ? null : Number(filters.value.min)
    const max = filters.value.max === '' ? null : Number(filters.value.max)

    const list = allPlayers.filter((p) => {
      const club = getClubById(p.currentClubId)
      if (filters.club && p.currentClubId !== filters.club) return false
      if (filters.league && club?.league !== filters.league) return false
      if (filters.position && p.position !== filters.position) return false
      if (filters.nationality && p.nationality !== filters.nationality) return false
      if (filters.status && p.status !== filters.status) return false
      if (q && !`${p.name} ${p.nationality}`.toLowerCase().includes(q)) return false
      if (min != null && p.marketValue < min) return false
      if (max != null && p.marketValue > max) return false
      return true
    })

    return list.sort((a, b) => {
      if (filters.sort === 'age-asc') return (a.age || 99) - (b.age || 99)
      if (filters.sort === 'name-asc') return a.name.localeCompare(b.name, 'es')
      if (filters.sort === 'contract-asc') {
        return new Date(a.contractUntil || '2099-12-31') - new Date(b.contractUntil || '2099-12-31')
      }
      return (b.marketValue || 0) - (a.marketValue || 0)
    })
  }, [allPlayers, filters])

  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const fields = [
    { type: 'text', name: 'q', label: 'Buscar', placeholder: 'Nombre o nacionalidad…' },
    { type: 'select', name: 'club', label: 'Club', options: getAllClubs().map((c) => ({ value: c.id, label: c.name })) },
    { type: 'select', name: 'league', label: 'Liga', options: getLeagues().map((l) => ({ value: l, label: l })) },
    { type: 'select', name: 'position', label: 'Posición', options: getPositions().map((p) => ({ value: p, label: p })) },
    { type: 'select', name: 'nationality', label: 'Nacionalidad', options: getNationalities().map((n) => ({ value: n, label: n })) },
    { type: 'select', name: 'status', label: 'Estado', options: Object.entries(PLAYER_STATUS).map(([value, v]) => ({ value, label: v.label })) },
    {
      type: 'select',
      name: 'sort',
      label: 'Orden',
      options: [
        { value: 'value-desc', label: 'Mayor valor' },
        { value: 'age-asc', label: 'Más jóvenes' },
        { value: 'contract-asc', label: 'Contrato más corto' },
        { value: 'name-asc', label: 'Nombre A-Z' },
      ],
    },
    { type: 'range', name: 'value', label: 'Valor de mercado', unit: 'M€', min: 0, step: 1 },
  ]

  return (
    <>
      <PremiumHeader
        title="Jugadores"
        description="Busca y filtra jugadores por club, posición, nacionalidad, estado o valor de mercado."
        banner={`Plantillas revisadas a 27/06/2026: ${squadDashboard.totalPlayers} jugadores, ${squadDashboard.totalClubs} clubes y ${formatMoney(squadDashboard.totalValue)} de valor de plantilla agregado.`}
        tag="JUGADORES"
        icon="jersey"
        theme="players"
      />

      <div className="container" style={{ marginTop: 24 }}>
        <div className="grid grid-4">
          <StatCard label="Base total" value={`${playerStats.total}`} hint="Jugadores con ficha" icon="person" accent="#22c55e" />
          <StatCard label="Jugador top" value={playerStats.top?.name || '—'} hint={playerStats.topClub ? `${playerStats.topClub.name} · ${formatMoney(playerStats.top.marketValue)}` : 'Mayor valor de mercado'} icon="star" accent="#fbbf24" />
          <StatCard label="Talento sub-21" value={`${playerStats.u21}`} hint="Jugadores de 21 años o menos" icon="jersey" accent="#38bdf8" />
          <StatCard label="Edad media" value={playerStats.avgAge ? `${playerStats.avgAge}` : '—'} hint="De toda la base de datos" icon="clock" accent="#a78bfa" />
        </div>
      </div>

      <div className="container section">
        <div className="list-layout">
          <FilterPanel
            fields={fields}
            values={filters}
            onChange={set}
            onReset={() =>
              setFilters({ q: '', club: '', league: '', position: '', nationality: '', status: '', sort: 'value-desc', value: { min: '', max: '' } })
            }
            resultCount={filtered.length}
          />
          {filtered.length > 0 ? (
            <div className="grid grid-auto">
              {filtered.map((p) => <PlayerCard key={p.id} player={p} />)}
            </div>
          ) : (
            <div className="empty-state">No hay jugadores que coincidan con los filtros.</div>
          )}
        </div>
      </div>
    </>
  )
}
