import { useEffect, useMemo, useState } from 'react'
import RumourCard from '@/components/RumourCard.jsx'
import FilterPanel from '@/components/FilterPanel.jsx'
import Icon from '@/components/Icon.jsx'
import { setPageSeo } from '@/lib/seo.js'
import { RUMOUR_STATUS, RELIABILITY, OPERATION_TYPE } from '@/lib/taxonomy.js'
import { getAllRumours, getPlayerById } from '@/lib/data.js'
import './Pages.css'

const EMPTY = { q: '', reliability: '', status: '', operationType: '' }

const GUIDE = ['oficial', 'alta', 'media', 'baja', 'descartado']

export default function Rumours() {
  const [filters, setFilters] = useState(EMPTY)

  useEffect(() => {
    setPageSeo({
      title: 'Rumores contrastados',
      description: 'Rumores de fichajes clasificados por fiabilidad (oficial, alta, media, baja) y estado de la operación, con sus fuentes.',
    })
  }, [])

  const allRumours = useMemo(() => getAllRumours(), [])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return allRumours.filter((r) => {
      if (filters.reliability && r.reliability !== filters.reliability) return false
      if (filters.status && r.status !== filters.status) return false
      if (filters.operationType && r.operationType !== filters.operationType) return false
      if (q) {
        const player = getPlayerById(r.playerId)
        if (!`${player?.name || ''} ${r.summary}`.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [allRumours, filters])

  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const fields = [
    { type: 'text', name: 'q', label: 'Buscar', placeholder: 'Jugador o texto…' },
    { type: 'select', name: 'reliability', label: 'Fiabilidad', options: Object.entries(RELIABILITY).map(([value, v]) => ({ value, label: v.label })) },
    { type: 'select', name: 'status', label: 'Estado', options: Object.entries(RUMOUR_STATUS).map(([value, v]) => ({ value, label: v.label })) },
    { type: 'select', name: 'operationType', label: 'Operación', options: Object.entries(OPERATION_TYPE).map(([value, v]) => ({ value, label: v.label })) },
  ]

  return (
    <>
      <div className="container page-header">
        <Icon name="flame" size={150} className="page-watermark" />
        <h1>Rumores contrastados</h1>
        <p>
          Cada rumor lleva una etiqueta de fiabilidad según sus fuentes. Pulsa «Ver fuentes»
          en cualquier tarjeta para comprobar de dónde sale la información.
        </p>
      </div>

      <div className="container">
        <div className="reliability-guide">
          {GUIDE.map((key) => (
            <div key={key} className={`rg-item rg-${key}`}>
              <h4>{RELIABILITY[key].label}</h4>
              <p>{RELIABILITY[key].help}</p>
            </div>
          ))}
        </div>
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
              {filtered.map((r) => <RumourCard key={r.id} rumour={r} />)}
            </div>
          ) : (
            <div className="empty-state">No hay rumores que coincidan con los filtros.</div>
          )}
        </div>
      </div>
    </>
  )
}
