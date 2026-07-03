import { useMemo, useState } from 'react'
import TransferRow from './TransferRow.jsx'
import { enrichTransfer } from '@/lib/calculations.js'
import { getPlayerById, getClubById, getSources } from '@/lib/data.js'
import './TransferTable.css'

// Columnas ordenables y su clave de comparación.
const COLUMNS = [
  { key: 'player', label: 'Jugador', sortKey: 'playerName' },
  { key: 'age', label: 'Edad', sortKey: 'age', align: 'right' },
  { key: 'position', label: 'Posición' },
  { key: 'nationality', label: 'Nacionalidad' },
  { key: 'from', label: 'Vende' },
  { key: 'to', label: 'Compra' },
  { key: 'fee', label: 'Precio', sortKey: 'transferFee', align: 'right' },
  { key: 'value', label: 'Valor mercado', sortKey: 'marketValueAtTransfer', align: 'right' },
  { key: 'diff', label: 'Dif. vs valor', sortKey: 'diff', align: 'right' },
  { key: 'prev', label: 'Compra anterior', align: 'right' },
  { key: 'gain', label: 'Ganancia vendedor', sortKey: 'gain', align: 'right' },
  { key: 'date', label: 'Fecha', sortKey: 'transferDate' },
  { key: 'status', label: 'Estado' },
  { key: 'sources', label: 'Fuentes' },
]

// Presets de ordenación rápida solicitados por el portal.
export const SORT_PRESETS = [
  { value: 'date-desc', label: 'Más recientes', key: 'transferDate', dir: 'desc' },
  { value: 'fee-desc', label: 'Precio más alto', key: 'transferFee', dir: 'desc' },
  { value: 'gain-desc', label: 'Mayor ganancia', key: 'gain', dir: 'desc' },
  { value: 'gain-asc', label: 'Mayor pérdida', key: 'gain', dir: 'asc' },
  { value: 'diff-desc', label: 'Mayor dif. sobre valor', key: 'diff', dir: 'desc' },
  { value: 'age-asc', label: 'Edad (menor primero)', key: 'age', dir: 'asc' },
]

// Combina cada fichaje con los datos del jugador, clubes y fuentes, y añade los
// cálculos económicos (diferencia, ganancia, porcentaje).
function buildRow(transfer) {
  const player = getPlayerById(transfer.playerId)
  return {
    ...enrichTransfer(transfer),
    player,
    playerName: player?.name || '',
    age: player?.age ?? null,
    position: player?.position || '',
    nationality: player?.nationality || '',
    fromClub: getClubById(transfer.fromClubId),
    toClub: getClubById(transfer.toClubId),
    fromClubName: transfer.fromClubName,
    toClubName: transfer.toClubName,
    sourceObjects: getSources(transfer.sources),
  }
}

function compare(a, b, key, dir) {
  const av = a[key]
  const bv = b[key]
  // Los valores nulos siempre se van al final, independientemente de la dirección.
  if (av == null && bv == null) return 0
  if (av == null) return 1
  if (bv == null) return -1

  let res
  if (typeof av === 'string') res = av.localeCompare(bv, 'es')
  else if (key === 'transferDate') res = new Date(av) - new Date(bv)
  else res = av - bv

  return dir === 'asc' ? res : -res
}

export default function TransferTable({ transfers, showSortSelect = true }) {
  const [sort, setSort] = useState({ key: 'transferDate', dir: 'desc' })

  const rows = useMemo(() => transfers.map(buildRow), [transfers])

  const sorted = useMemo(
    () => [...rows].sort((a, b) => compare(a, b, sort.key, sort.dir)),
    [rows, sort],
  )

  function toggleSort(sortKey) {
    if (!sortKey) return
    setSort((prev) =>
      prev.key === sortKey
        ? { key: sortKey, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key: sortKey, dir: 'desc' },
    )
  }

  function applyPreset(value) {
    const preset = SORT_PRESETS.find((p) => p.value === value)
    if (preset) setSort({ key: preset.key, dir: preset.dir })
  }

  const activePreset =
    SORT_PRESETS.find((p) => p.key === sort.key && p.dir === sort.dir)?.value || ''

  if (transfers.length === 0) {
    return <p className="muted center" style={{ padding: '32px 0' }}>No hay fichajes que coincidan con los filtros.</p>
  }

  return (
    <div className="transfer-table">
      {showSortSelect && (
        <div className="tt-toolbar">
          <label className="field-label" htmlFor="tt-sort">Ordenar por</label>
          <select
            id="tt-sort"
            className="select"
            value={activePreset}
            onChange={(e) => applyPreset(e.target.value)}
          >
            {!activePreset && <option value="">Personalizado</option>}
            {SORT_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="table-wrap">
        <table className="data transfers">
          <thead>
            <tr>
              {COLUMNS.map((col) => {
                const isActive = sort.key === col.sortKey
                return (
                  <th
                    key={col.key}
                    className={`${col.sortKey ? 'sortable' : ''} ${col.align === 'right' ? 'ta-right' : ''}`}
                    onClick={() => toggleSort(col.sortKey)}
                    aria-sort={isActive ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    {col.label}
                    {isActive && <span className="sort-ind">{sort.dir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <TransferRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
