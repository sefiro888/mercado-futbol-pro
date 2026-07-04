import { useState, useEffect, lazy, Suspense } from 'react'
import { NavLink, Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { SITE } from '@/config/site.js'
import './Header.css'

const GlobalSearch = lazy(() => import('./GlobalSearch.jsx'))

export default function Header() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Ctrl+K / Cmd+K abre la búsqueda global.
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
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

            <button
              className="header-search-btn"
              onClick={() => { setSearchOpen(true); setOpen(false) }}
              aria-label="Buscar en el portal"
              title="Buscar (Ctrl+K)"
            >
              <Icon name="search" size={16} />
              <span className="header-search-label">Buscar</span>
              <kbd className="header-search-kbd">⌘K</kbd>
            </button>
          </nav>
        </div>
      </header>

      {searchOpen && (
        <Suspense fallback={null}>
          <GlobalSearch onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
