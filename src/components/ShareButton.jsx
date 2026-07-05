import { useState } from 'react'
import './ShareButton.css'

const BASE_URL = 'https://sefiro888.github.io/mercado-futbol-pro'

function buildUrl(path) {
  return `${BASE_URL}/#${path}`
}

export default function ShareButton({ path, title, text, size = 'md', label = 'Compartir' }) {
  const [state, setState] = useState('idle')

  async function handleClick() {
    if (state === 'loading') return
    const url = buildUrl(path)

    if (navigator.share) {
      setState('loading')
      try {
        await navigator.share({ title, text: text ?? title, url })
        setState('done')
      } catch {
        setState('idle')
        return
      }
    } else {
      // Fallback: copiar URL al portapapeles
      try {
        await navigator.clipboard.writeText(url)
        setState('done')
      } catch {
        setState('error')
      }
    }
    setTimeout(() => setState('idle'), 2200)
  }

  return (
    <button
      className={`share-btn share-btn--${size} share-btn--${state}`}
      onClick={handleClick}
      title={label}
      aria-label={label}
    >
      {state === 'loading' ? (
        <svg className="sb-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      ) : state === 'done' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      )}
      {size !== 'icon' && (
        <span className="sb-label">
          {state === 'done' ? (navigator.share ? 'Compartido' : 'Copiado') : label}
        </span>
      )}
    </button>
  )
}
