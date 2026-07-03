import { useEffect, useMemo, useState } from 'react'
import TransferTable from '@/components/TransferTable.jsx'
import FilterPanel from '@/components/FilterPanel.jsx'
import Icon from '@/components/Icon.jsx'
import { setPageSeo } from '@/lib/seo.js'
import { TRANSFER_STATUS } from '@/lib/taxonomy.js'
import {
  getAllTransfers,
  getAllClubs,
  getPlayerById,
  getClubById,
  getLeagues,
  getPositions,
  getNationalities,
} from '@/lib/data.js'
import './Pages.css'

const EMPTY = {
  q: '',
  club: '',
  league: '',
  position: '',
  nationality: '',
  status: '',
  price: { min: '', max: '' },
}

export default function Transfers() {
  const [filters, setFilters] = useState(EMPTY)

  useEffect(() => {
    setPageSeo({
      title: 'Tabla de fichajes y traspasos',
      description: 'Tabla avanzada de fichajes con precio, valor de mercado, diferencia, ganancia del club vendedor y análisis económico. Filtros y ordenación.',
    })
  }, [])

  const allTransfers = useMemo(() => getAllTransfers(), [])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const min = filters.price.min === '' ? null : Number(filters.price.min)
    const max = filters.price.max === '' ? null : Number(filters.price.max)

    return allTransfers.filter((t) => {
      const player = getPlayerById(t.playerId)
      const from = getClubById(t.fromClubId)
      const to = getClubById(t.toClubId)

      if (filters.club && t.fromClubId !== filters.club && t.toClubId !== filters.club) return false
      if (filters.league && from?.league !== filters.league && to?.league !== filters.league) return false
      if (filters.position && player?.position !== filters.position) return false
      if (filters.nationality && player?.nationality !== filters.nationality) return false
      if (filters.status && t.status !== filters.status) return false
      if (q && !(player?.name || '').toLowerCase().includes(q)) return false
      if (min != null && t.transferFee < min) return false
      if (max != null && t.transferFee > max) return false
      return true
    })
  }, [allTransfers, filters])

  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const fields = [
    { type: 'text', name: 'q', label: 'Jugador', placeholder: 'Nombre del jugador…' },
    {
      type: 'select', name: 'club', label: 'Club',
      options: getAllClubs().map((c) => ({ value: c.id, label: c.name })),
    },
    { type: 'select', name: 'league', label: 'Liga', options: getLeagues().map((l) => ({ value: l, label: l })) },
    { type: 'select', name: 'position', label: 'Posición', options: getPositions().map((p) => ({ value: p, label: p })) },
    { type: 'select', name: 'nationality', label: 'Nacionalidad', options: getNationalities().map((n) => ({ value: n, label: n })) },
    {
      type: 'select', name: 'status', label: 'Estado',
      options: Object.entries(TRANSFER_STATUS).map(([value, v]) => ({ value, label: v.label })),
    },
    { type: 'range', name: 'price', label: 'Precio', unit: 'M€', min: 0, step: 1 },
  ]

  return (
    <>
      <div className="container page-header">
        <Icon name="handshake" size={150} className="page-watermark" />
        <h1>Fichajes y traspasos</h1>
        <p>
          Tabla avanzada con precio del traspaso, valor de mercado, diferencia y la ganancia
          o pérdida real del club vendedor. Filtra y ordena según te interese.
        </p>
        <p className="demo-banner"><Icon name="warning" size={16} /> Fichajes reales del mercado 2025; los valores de mercado son estimaciones aproximadas.</p>
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
          <TransferTable transfers={filtered} />
        </div>
      </div>
    </>
  )
}
