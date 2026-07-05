import { useState, useEffect } from 'react'
import { isWatched, toggleWatchItem } from '@/lib/watchlist.js'
import './WatchlistButton.css'

export default function WatchlistButton({ id, type, name, size = 'md' }) {
  const [watched, setWatched] = useState(() => isWatched(id))

  useEffect(() => {
    function onWatchlistChange(e) {
      if (e.detail.id === id) setWatched(e.detail.watched)
    }
    window.addEventListener('mfp-watchlist', onWatchlistChange)
    return () => window.removeEventListener('mfp-watchlist', onWatchlistChange)
  }, [id])

  function toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    setWatched(toggleWatchItem(id, type, name))
  }

  return (
    <button
      className={`wl-btn wl-btn--${size} ${watched ? 'wl-btn--active' : ''}`}
      onClick={toggle}
      title={watched ? 'Quitar de seguidos' : 'Seguir'}
      aria-label={watched ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      <svg viewBox="0 0 24 24" fill={watched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="wl-btn-label">{watched ? 'Siguiendo' : 'Seguir'}</span>
    </button>
  )
}
