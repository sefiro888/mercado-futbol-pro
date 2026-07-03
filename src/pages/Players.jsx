import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PlayerCard from '@/components/PlayerCard.jsx'
import FilterPanel from '@/components/FilterPanel.jsx'
import Icon from '@/components/Icon.jsx'
import { setPageSeo } from '@/lib/seo.js'
import { PLAYER_STATUS } from '@/lib/taxonomy.js'
import {
  getAllPlayers,
  getAllClubs,
  getPositions,
  getNationalities,
} from '@/lib/data.js'
import './Pages.css'

export default function Players() {
  // Lee ?q= de la URL (lo usa el buscador del header).
  const [params] = useSearchParams()
  const initialQ = params.get('q') || ''

  const [filters, setFilters] = useState({
    q: initialQ,
    club: '',
    position: '',
    nationality: '',
    status: '',
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

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const min = filters.value.min === '' ? null : Number(filters.value.min)
    const max = filters.value.max === '' ? null : Number(filters.value.max)

    return allPlayers.filter((p) => {
      if (filters.club && p.currentClubId !== filters.club) return false
      if (filters.position && p.position !== filters.position) return false
      if (filters.nationality && p.nationality !== filters.nationality) return false
      if (filters.status && p.status !== filters.status) return false
      if (q && !`${p.name} ${p.nationality}`.toLowerCase().includes(q)) return false
      if (min != null && p.marketValue < min) return false
      if (max != null && p.marketValue > max) return false
      return true
    })
  }, [allPlayers, filters])

  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const fields = [
    { type: 'text', name: 'q', label: 'Buscar', placeholder: 'Nombre o nacionalidad…' },
    { type: 'select', name: 'club', label: 'Club', options: getAllClubs().map((c) => ({ value: c.id, label: c.name })) },
    { type: 'select', name: 'position', label: 'Posición', options: getPositions().map((p) => ({ value: p, label: p })) },
    { type: 'select', name: 'nationality', label: 'Nacionalidad', options: getNationalities().map((n) => ({ value: n, label: n })) },
    { type: 'select', name: 'status', label: 'Estado', options: Object.entries(PLAYER_STATUS).map(([value, v]) => ({ value, label: v.label })) },
    { type: 'range', name: 'value', label: 'Valor de mercado', unit: 'M€', min: 0, step: 1 },
  ]

  return (
    <>
      <div className="container page-header">
        <Icon name="jersey" size={150} className="page-watermark" />
        <h1>Jugadores</h1>
        <p>Busca y filtra jugadores por club, posición, nacionalidad, estado o valor de mercado.</p>
      </div>

      <div className="container section">
        <div className="list-layout">
          <FilterPanel
            fields={fields}
            values={filters}
            onChange={set}
            onReset={() =>
              setFilters({ q: '', club: '', position: '', nationality: '', status: '', value: { min: '', max: '' } })
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
