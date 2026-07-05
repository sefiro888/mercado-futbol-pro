import { useState } from 'react'
import Icon from './Icon.jsx'
import './FilterPanel.css'

const SKIP_CHIPS = new Set(['sort']) // campos que no generan chip

function countActive(values) {
  return Object.values(values).reduce((n, v) => {
    if (v == null || v === '') return n
    if (typeof v === 'object') return n + (v.min || v.max ? 1 : 0)
    return n + 1
  }, 0)
}

function buildChips(fields, values) {
  const chips = []
  for (const field of fields) {
    if (SKIP_CHIPS.has(field.name)) continue
    const val = values[field.name]
    if (field.type === 'range') {
      const { min, max } = val || {}
      if (min || max) {
        const unit = field.unit ? ` ${field.unit}` : ''
        const label = min && max ? `${min}${unit} – ${max}${unit}` : min ? `≥ ${min}${unit}` : `≤ ${max}${unit}`
        chips.push({ name: field.name, label: `${field.label}: ${label}`, reset: { min: '', max: '' } })
      }
    } else if (val) {
      const opt = field.options?.find((o) => o.value === val)
      chips.push({ name: field.name, label: `${field.label}: ${opt?.label ?? val}`, reset: '' })
    }
  }
  return chips
}

export default function FilterPanel({ fields, values, onChange, onReset, resultCount }) {
  const [open, setOpen] = useState(false)
  const chips = buildChips(fields, values)
  const active = chips.length

  return (
    <aside className={`filter-panel card ${open ? 'is-open' : ''}`}>
      {/* Barra superior: en móvil es el botón que despliega/colapsa. */}
      <button
        className="filter-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="filter-toggle-label">
          <Icon name="sliders" size={18} /> Filtros
          {active > 0 && <span className="filter-count-badge">{active}</span>}
        </span>
        <span className="filter-chevron" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      <div className="filter-head">
        <h3>Filtros</h3>
        {active > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={onReset}>Limpiar ({active})</button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="filter-chips">
          {chips.map((chip) => (
            <button
              key={chip.name}
              className="filter-chip"
              onClick={() => onChange(chip.name, chip.reset)}
              title={`Quitar filtro: ${chip.label}`}
            >
              {chip.label}
              <span className="filter-chip-x" aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="filter-body">
       <div className="filter-inner">
        <div className="filter-fields">
          {fields.map((field) => {
            const value = values[field.name]

            if (field.type === 'select') {
              return (
                <div className="filter-field" key={field.name}>
                  <label className="field-label" htmlFor={`f-${field.name}`}>{field.label}</label>
                  <select
                    id={`f-${field.name}`}
                    className="select"
                    value={value ?? ''}
                    onChange={(e) => onChange(field.name, e.target.value)}
                  >
                    <option value="">Todos</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )
            }

            if (field.type === 'text') {
              return (
                <div className="filter-field" key={field.name}>
                  <label className="field-label" htmlFor={`f-${field.name}`}>{field.label}</label>
                  <input
                    id={`f-${field.name}`}
                    className="input"
                    type="search"
                    placeholder={field.placeholder || ''}
                    value={value ?? ''}
                    onChange={(e) => onChange(field.name, e.target.value)}
                  />
                </div>
              )
            }

            if (field.type === 'range') {
              const range = value || {}
              return (
                <div className="filter-field" key={field.name}>
                  <label className="field-label">
                    {field.label} {field.unit ? `(${field.unit})` : ''}
                  </label>
                  <div className="range-inputs">
                    <input
                      className="input"
                      type="number"
                      inputMode="numeric"
                      placeholder={`Mín${field.min != null ? ` ${field.min}` : ''}`}
                      min={field.min}
                      max={field.max}
                      step={field.step || 1}
                      value={range.min ?? ''}
                      onChange={(e) => onChange(field.name, { ...range, min: e.target.value })}
                    />
                    <span className="range-sep">—</span>
                    <input
                      className="input"
                      type="number"
                      inputMode="numeric"
                      placeholder={`Máx${field.max != null ? ` ${field.max}` : ''}`}
                      min={field.min}
                      max={field.max}
                      step={field.step || 1}
                      value={range.max ?? ''}
                      onChange={(e) => onChange(field.name, { ...range, max: e.target.value })}
                    />
                  </div>
                </div>
              )
            }

            return null
          })}
        </div>

        {resultCount != null && (
          <div className="filter-count">
            {resultCount} resultado{resultCount === 1 ? '' : 's'}
          </div>
        )}
       </div>
      </div>
    </aside>
  )
}
