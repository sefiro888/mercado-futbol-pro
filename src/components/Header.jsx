import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import { SITE } from '@/config/site.js'
import './Header.css'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  // Compacta y opaca el header al desplazar (efecto premium sutil).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function onSearch(e) {
    e.preventDefault()
    const term = q.trim()
    if (term) navigate(`/jugadores?q=${encodeURIComponent(term)}`)
    setOpen(false)
  }

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true"><Icon name="ball" size={22} /></span>
          <span className="brand-text">
            {SITE.name}
            <small>{SITE.tagline}</small>
          </span>
        </Link>

        <button
          className="nav-toggle"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Icon name="close" size={22} /> : <Icon name="menu" size={22} />}
        </button>

        <nav className={`site-nav ${open ? 'is-open' : ''}`}>
          {SITE.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <form className="header-search" onSubmit={onSearch} role="search">
            <input
              className="input"
              type="search"
              placeholder="Buscar jugador, club…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar en el portal"
            />
          </form>
        </nav>
      </div>
    </header>
  )
}
