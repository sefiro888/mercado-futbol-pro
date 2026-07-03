import { useState } from 'react'
import Icon from './Icon.jsx'
import './SearchBar.css'

// Buscador general reutilizable. Es "controlado por callback":
// notifica el término al padre vía onSearch para que decida qué hacer
// (navegar, filtrar una lista, etc.).
export default function SearchBar({
  placeholder = 'Buscar jugadores, clubes o noticias…',
  defaultValue = '',
  onSearch,
  autoFocus = false,
  large = false,
}) {
  const [value, setValue] = useState(defaultValue)

  function submit(e) {
    e.preventDefault()
    onSearch?.(value.trim())
  }

  return (
    <form className={`searchbar ${large ? 'searchbar-lg' : ''}`} onSubmit={submit} role="search">
      <span className="search-icon" aria-hidden="true"><Icon name="search" size={18} /></span>
      <input
        className="input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value)
          // Búsqueda en vivo: también notifica al escribir.
          onSearch?.(e.target.value.trim())
        }}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />
      <button type="submit" className="btn btn-primary" aria-label="Buscar">
        <Icon name="search" size={16} />
        <span>Buscar</span>
      </button>
    </form>
  )
}
