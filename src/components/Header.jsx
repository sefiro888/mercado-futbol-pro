import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import GlobalSearch from './GlobalSearch.jsx'
import { SITE } from '@/config/site.js'
import newsData from '@/data/news.json'
import rumoursData from '@/data/rumours.json'
import transfersData from '@/data/transfers.json'
import { getAllPlayers, getAllClubs } from '@/lib/data.js'
import './Header.css'

// ── Emojis por sección ─────────────────────────────────────────────────────
const NAV_EMOJI = {
  '/':                  { emoji: '🏠', cat: 'general' },
  '/noticias':          { emoji: '📰', cat: 'info' },
  '/fichajes':          { emoji: '💸', cat: 'mercado' },
  '/historial-fichajes':{ emoji: '📜', cat: 'mercado' },
  '/simulador':         { emoji: '🔮', cat: 'herramientas' },
  '/mundial':           { emoji: '🌍', cat: 'competiciones' },
  '/champions':         { emoji: '⭐', cat: 'competiciones' },
  '/eurocopa':          { emoji: '🌟', cat: 'competiciones' },
  '/libertadores':      { emoji: '🏔️', cat: 'competiciones' },
  '/clubes':            { emoji: '🏟️', cat: 'datos' },
  '/jugadores':         { emoji: '⚽', cat: 'datos' },
  '/rankings':          { emoji: '🏆', cat: 'datos' },
  '/estadisticas':      { emoji: '📊', cat: 'datos' },
  '/once-ideal':        { emoji: '🦅', cat: 'herramientas' },
  '/watchlist':         { emoji: '👀', cat: 'herramientas' },
  '/comparar':          { emoji: '⚡', cat: 'herramientas' },
  '/quiz':              { emoji: '🧩', cat: 'herramientas' },
  '/mercado-vivo':      { emoji: '📡', cat: 'mercado' },
  '/rumores':           { emoji: '💬', cat: 'info' },
}

const CAT_LABELS = {
  general:      'General',
  info:         'Información',
  mercado:      'Mercado',
  competiciones:'Competiciones',
  datos:        'Datos',
  herramientas: 'Herramientas',
}

// ── Ticker: construye los items del banner ─────────────────────────────────
function buildTickerItems(players, clubs) {
  const items = []

  // Fichajes confirmados
  transfersData.slice(0, 8).forEach((t) => {
    const player = players.find((p) => p.id === t.playerId || p.slug === t.playerId)
    const toClub = clubs.find((c) => c.id === t.toClubId)
    if (player && toClub) {
      const fee = t.transferFee ? `${t.transferFee}M€` : 'Libre'
      items.push({ type: 'transfer', text: `💸 ${player.name} firma con ${toClub.name} · ${fee}`, color: '#22c55e' })
    }
  })

  // Noticias
  newsData.slice(0, 6).forEach((n) => {
    items.push({ type: 'news', text: `📰 ${n.title}`, color: '#fbbf24' })
  })

  // Rumores
  rumoursData.slice(0, 6).forEach((r) => {
    const player = players.find((p) => p.id === r.playerId || p.slug === r.playerId)
    const club = clubs.find((c) => c.id === r.interestedClubId)
    if (player && club && r.summary) {
      items.push({ type: 'rumour', text: `🔥 ${r.summary}`, color: '#f97316' })
    }
  })

  return items.length > 0 ? items : [
    { type: 'news', text: '📰 Bienvenido a Mercado Fútbol Pro · Las mejores noticias del fútbol mundial', color: '#fbbf24' },
  ]
}

// ── Ticker Component ───────────────────────────────────────────────────────
function NewsTicker() {
  const players = getAllPlayers()
  const clubs   = getAllClubs()
  const items   = buildTickerItems(players, clubs)
  // Duplicamos para bucle infinito
  const all = [...items, ...items, ...items]

  return (
    <div className="ticker-wrap" aria-label="Últimas noticias">
      <div className="ticker-label">🔴 EN VIVO</div>
      <div className="ticker-track-outer">
        <div className="ticker-track">
          {all.map((item, i) => (
            <span key={i} className="ticker-item" style={{ '--tc': item.color }}>
              {item.text}
              <span className="ticker-sep">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Menu overlay ───────────────────────────────────────────────────────────
function MenuOverlay({ open, onClose }) {
  const location = useLocation()

  // Agrupa nav por categoría
  const grouped = {}
  SITE.nav.forEach((item) => {
    const meta = NAV_EMOJI[item.to] ?? { emoji: '📌', cat: 'general' }
    const cat = meta.cat
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push({ ...item, emoji: meta.emoji })
  })

  return (
    <div className={`nav-overlay ${open ? 'nav-overlay--open' : ''}`} onClick={onClose}>
      <div className="nav-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header del panel */}
        <div className="nav-panel-head">
          <span className="nav-panel-title">⚽ Navegación</span>
          <button className="nav-panel-close" onClick={onClose} aria-label="Cerrar menú">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Links agrupados */}
        <div className="nav-panel-body">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="nav-group">
              <span className="nav-group-label">{CAT_LABELS[cat] ?? cat}</span>
              <div className="nav-group-items">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="nav-item-emoji">{item.emoji}</span>
                    <span className="nav-item-label">{item.label}</span>
                    {item.to === location.pathname && (
                      <span className="nav-item-dot" />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer del panel */}
        <div className="nav-panel-footer">
          <span className="nav-footer-text">Mercado Fútbol Pro · Datos 2026</span>
        </div>
      </div>
    </div>
  )
}

// ── Header principal ───────────────────────────────────────────────────────
export default function Header() {
  const [open, setOpen]       = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location              = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cierra el menú al cambiar ruta
  useEffect(() => { setOpen(false); setSearchOpen(false) }, [location.pathname])

  // Bloquea scroll del body cuando el menú o el buscador están abiertos
  useEffect(() => {
    document.body.style.overflow = open || searchOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open, searchOpen])

  // Atajo de teclado: Ctrl/Cmd+K abre la búsqueda global
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const currentEmoji = NAV_EMOJI[location.pathname]?.emoji ?? '⚽'

  return (
    <>
      {/* Banner de noticias */}
      <NewsTicker />

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">

          {/* Marca */}
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden="true">
              <Icon name="ball" size={22} />
            </span>
            <span className="brand-text">
              {SITE.name}
              <small>{SITE.tagline}</small>
            </span>
          </Link>

          {/* Disparador del buscador global (desktop) */}
          <button
            type="button"
            className="header-search"
            onClick={() => setSearchOpen(true)}
            aria-label="Abrir búsqueda global (Ctrl+K)"
          >
            <svg className="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8.5" cy="8.5" r="5.5"/><path d="M14 14l3.5 3.5" strokeLinecap="round"/>
            </svg>
            <span className="input header-search-fake">Buscar jugador, club…</span>
            <kbd className="header-search-kbd">Ctrl K</kbd>
          </button>

          {/* Lupa (móvil): abre el mismo buscador global */}
          <button
            type="button"
            className="header-search-mobile"
            onClick={() => setSearchOpen(true)}
            aria-label="Abrir búsqueda"
          >
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8.5" cy="8.5" r="5.5"/><path d="M14 14l3.5 3.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Botón de menú */}
          <button
            className={`menu-btn ${open ? 'menu-btn--open' : ''}`}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="menu-btn-emoji">{open ? '✕' : currentEmoji}</span>
            <span className="menu-btn-label">{open ? 'Cerrar' : 'Menú'}</span>
            <span className="menu-btn-bars" aria-hidden="true">
              <span /><span /><span />
            </span>
          </button>
        </div>
      </header>

      {/* Panel overlay */}
      <MenuOverlay open={open} onClose={() => setOpen(false)} />

      {/* Búsqueda global instantánea */}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  )
}
