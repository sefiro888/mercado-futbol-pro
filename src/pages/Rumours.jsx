import { useEffect, useMemo, useState } from 'react'
import RumourCard from '@/components/RumourCard.jsx'
import FilterPanel from '@/components/FilterPanel.jsx'
import Icon from '@/components/Icon.jsx'
import StatCard from '@/components/StatCard.jsx'
import SourceRanking from '@/components/SourceRanking.jsx'
import { setPageSeo } from '@/lib/seo.js'
import PremiumHeader from '@/components/PremiumHeader.jsx'
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

  // Estadísticas y termómetro de rumores
  const stats = useMemo(() => {
    const total = allRumours.length
    const hot = allRumours.filter(r => ['alta', 'oficial'].includes(r.reliability) && r.status !== 'descartado').length
    const negotiation = allRumours.filter(r => ['negociacion', 'acuerdo-cercano'].includes(r.status)).length
    const confirmed = allRumours.filter(r => r.status === 'confirmado').length
    
    // Temperatura de mercado (índice 0-100) basado en volumen de rumores calientes y negociaciones activas
    const temp = total > 0 ? Math.min(100, Math.round(((hot * 1.5 + negotiation * 1.2 + confirmed * 2) / total) * 100)) : 0

    return {
      total,
      hot,
      negotiation,
      temp
    }
  }, [allRumours])

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
      <PremiumHeader
        title="Rumores contrastados"
        description="Cada rumor lleva una etiqueta de fiabilidad según sus fuentes. Pulsa «Ver fuentes» en cualquier tarjeta para comprobar de dónde sale la información."
        tag="RUMORES"
        icon="flame"
        theme="rumours"
      />

      <div className="container" style={{ marginTop: 24 }}>
        <div className="grid grid-4">
          <StatCard label="Total rumores" value={`${stats.total}`} hint="Operaciones en el radar" icon="newspaper" accent="#38bdf8" />
          <StatCard label="Rumores calientes" value={`${stats.hot}`} hint="Fiabilidad alta/oficial" icon="flame" accent="#f59e0b" />
          <StatCard label="En negociación" value={`${stats.negotiation}`} hint="Contactos avanzados" icon="handshake" accent="#a78bfa" />
          <StatCard label="Termómetro de actividad" value={`${stats.temp}%`} hint="Índice de dinamismo" icon="ball" accent="#22c55e" />
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <div className="rumours-dashboard-layout">
          <div className="reliability-guide-col">
            <h3 className="section-title-sutil">Guía de fiabilidad</h3>
            <div className="reliability-guide">
              {GUIDE.map((key) => (
                <div key={key} className={`rg-item rg-${key}`}>
                  <h4>{RELIABILITY[key].label}</h4>
                  <p>{RELIABILITY[key].help}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="thermometer-card-col">
            <SourceRanking />
            <div className="card thermometer-card" style={{ '--temp-c': stats.temp > 75 ? '#ef4444' : stats.temp > 50 ? '#f59e0b' : '#22c55e' }}>
              <div className="tc-header">
                <Icon name="flame" size={20} className="tc-flame-icon" />
                <h3>Termómetro del Mercado</h3>
              </div>
              <div className="tc-body">
                <div className="tc-value-display">
                  <span className="tc-val">{stats.temp}°</span>
                  <span className="tc-status-text">
                    {stats.temp > 75 ? 'Mercado hirviendo' : stats.temp > 50 ? 'Mercado activo' : 'Mercado calmado'}
                  </span>
                </div>
                <div className="tc-bar-wrap">
                  <div className="tc-bar-fill" style={{ width: `${stats.temp}%` }} />
                </div>
                <p className="muted tc-desc">
                  Calculado en tiempo real según el porcentaje de rumores calientes, acuerdos inminentes y fichajes oficiales recientes.
                </p>
              </div>
            </div>
          </div>
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
