import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { search, getClubById } from '@/lib/data.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { clubLogoUrl } from '@/lib/logos.js'
import Icon from './Icon.jsx'
import './GlobalSearch.css'

const MAX_PLAYERS = 6
const MAX_CLUBS = 4
const MAX_NEWS = 3

function debounce(fn, ms) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

function PlayerResult({ player, onSelect }) {
  const [imgErr, setImgErr] = useState(false)
  const photoUrl = !imgErr ? playerPhotoUrl(player) : null

  return (
    <button className="gs-result" onClick={() => onSelect(`/jugadores/${player.slug}`)}>
      <span className="gs-avatar">
        {photoUrl ? (
          <img src={photoUrl} alt="" onError={() => setImgErr(true)} className="gs-avatar-img" />
        ) : (
          <span className="gs-avatar-initials">
            {player.name.split(' ').slice(-1)[0]?.[0] ?? '?'}
          </span>
        )}
      </span>
      <span className="gs-info">
        <span className="gs-name">{player.name}</span>
        <span className="gs-sub">{player.position} · {getClubById(player.currentClubId)?.name ?? player.currentClubId}</span>
      </span>
      <span className="gs-value">{player.marketValue ? `${player.marketValue} M€` : ''}</span>
    </button>
  )
}

function ClubResult({ club, onSelect }) {
  const logoUrl = clubLogoUrl(club.id)
  return (
    <button className="gs-result" onClick={() => onSelect(`/clubes/${club.id}`)}>
      <span className="gs-avatar gs-avatar-club">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="gs-avatar-img" />
        ) : (
          <span className="gs-avatar-initials">{club.name[0]}</span>
        )}
      </span>
      <span className="gs-info">
        <span className="gs-name">{club.name}</span>
        <span className="gs-sub">{club.league} · {club.country}</span>
      </span>
      <span className="gs-value">{club.squadValue ? `${club.squadValue} M€` : ''}</span>
    </button>
  )
}

function NewsResult({ item, onSelect }) {
  return (
    <button className="gs-result" onClick={() => onSelect(`/noticias`)}>
      <span className="gs-avatar gs-avatar-news">
        <Icon name="news" size={16} />
      </span>
      <span className="gs-info">
        <span className="gs-name gs-name-sm">{item.title}</span>
        <span className="gs-sub">{item.date}</span>
      </span>
    </button>
  )
}

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [focused, setFocused] = useState(-1)
  const inputRef = useRef(null)
  const dropRef = useRef(null)
  const navigate = useNavigate()

  const doSearch = useCallback(
    debounce((q) => {
      if (q.length < 2) { setResults(null); return }
      const r = search(q)
      setResults({
        players: r.players.slice(0, MAX_PLAYERS),
        clubs: r.clubs.slice(0, MAX_CLUBS),
        news: r.news.slice(0, MAX_NEWS),
        total: r.players.length + r.clubs.length + r.news.length,
      })
      setFocused(-1)
    }, 180),
    [],
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') { onClose?.(); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    function onClickOut(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        onClose?.()
      }
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [onClose])

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    doSearch(q.trim())
  }

  function handleSelect(path) {
    navigate(path)
    onClose?.()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      navigate(`/jugadores?q=${encodeURIComponent(q)}`)
      onClose?.()
    }
  }

  const hasResults = results && (results.players.length + results.clubs.length + results.news.length) > 0
  const noResults = results && !hasResults

  return (
    <div className="gs-overlay" role="dialog" aria-label="Búsqueda global">
      <div className="gs-panel" ref={dropRef}>
        <form className="gs-form" onSubmit={handleSubmit}>
          <span className="gs-search-icon"><Icon name="search" size={20} /></span>
          <input
            ref={inputRef}
            className="gs-input"
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Buscar jugador, club, noticia…"
            autoComplete="off"
            aria-label="Buscar en el portal"
          />
          {query && (
            <button type="button" className="gs-clear" onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus() }}>
              <Icon name="close" size={16} />
            </button>
          )}
          <kbd className="gs-esc" onClick={onClose}>ESC</kbd>
        </form>

        {hasResults && (
          <div className="gs-drop">
            {results.players.length > 0 && (
              <div className="gs-group">
                <div className="gs-group-label">Jugadores</div>
                {results.players.map((p) => (
                  <PlayerResult key={p.id} player={p} onSelect={handleSelect} />
                ))}
              </div>
            )}
            {results.clubs.length > 0 && (
              <div className="gs-group">
                <div className="gs-group-label">Clubes</div>
                {results.clubs.map((c) => (
                  <ClubResult key={c.id} club={c} onSelect={handleSelect} />
                ))}
              </div>
            )}
            {results.news.length > 0 && (
              <div className="gs-group">
                <div className="gs-group-label">Noticias</div>
                {results.news.map((n) => (
                  <NewsResult key={n.id} item={n} onSelect={handleSelect} />
                ))}
              </div>
            )}
            {results.total > MAX_PLAYERS + MAX_CLUBS + MAX_NEWS && (
              <button className="gs-more" onClick={handleSubmit}>
                Ver todos los resultados para "{query}" →
              </button>
            )}
          </div>
        )}

        {noResults && (
          <div className="gs-empty">
            <Icon name="search" size={32} />
            <p>Sin resultados para "<strong>{query}</strong>"</p>
            <p className="gs-empty-hint">Prueba con el nombre del jugador o del club</p>
          </div>
        )}

        {!results && (
          <div className="gs-hints">
            <div className="gs-hint-item"><span>⚽</span> Jugadores, clubes y noticias</div>
            <div className="gs-hint-item"><span>↵</span> Buscar en toda la web</div>
            <div className="gs-hint-item"><span>ESC</span> Cerrar</div>
          </div>
        )}
      </div>
    </div>
  )
}
