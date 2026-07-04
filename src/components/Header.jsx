import { useState, useEffect, lazy, Suspense } from 'react'
import { NavLink, Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { SITE } from '@/config/site.js'
import { useTheme } from '@/lib/useTheme.js'
import './Header.css'

const GlobalSearch = lazy(() => import('./GlobalSearch.jsx'))

export default function Header() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isDark, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cerrar menú al cambiar tamaño a desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 1060) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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

          {/* Logo */}
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden="true"><Icon name="ball" size={22} /></span>
            <span className="brand-text">
              {SITE.shortName}
              <small>{SITE.tagline}</small>
            </span>
          </Link>

          {/* Nav desktop — solo visible >1060px */}
          <nav className={`site-nav ${open ? 'is-open' : ''}`} aria-label="Navegación principal">
            {SITE.nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => [isActive ? 'active' : '', item.desktopHide ? 'nav-desktop-hide' : ''].join(' ').trim()}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Acciones siempre visibles */}
          <div className="header-actions">
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

            <button
              className="header-theme-btn"
              onClick={toggleTheme}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Hamburguesa — solo visible ≤1060px */}
            <button
              className="nav-toggle"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <Icon name="close" size={22} /> : <Icon name="menu" size={22} />}
            </button>
          </div>
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
