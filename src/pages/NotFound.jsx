import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { setPageSeo } from '@/lib/seo.js'
import './NotFound.css'

const PHRASES = [
  'El árbitro anuló el gol.',
  'Fuera de juego. Sin resultado.',
  'El VAR revisó la jugada y no existe.',
  'El portero la sacó bajo los palos.',
  'El pase no llegó a destino.',
  'El fichaje cayó en el último minuto.',
  'La pelota se fue al larguero.',
]

function AnimatedBall() {
  return (
    <div className="nf-ball-wrap" aria-hidden="true">
      <div className="nf-ball">
        <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" fill="#fff" stroke="#e2e8f0" strokeWidth="2"/>
          <g fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="40,26 49.5,33 46.1,44.5 33.9,44.5 30.5,33" fill="rgba(30,41,59,0.12)"/>
            <line x1="40" y1="2" x2="40" y2="26"/>
            <line x1="55.5" y1="8.5" x2="49.5" y2="33"/>
            <line x1="72.5" y1="26" x2="46.1" y2="44.5"/>
            <line x1="64" y1="65" x2="46.1" y2="44.5"/>
            <line x1="16" y1="65" x2="33.9" y2="44.5"/>
            <line x1="7.5" y1="26" x2="33.9" y2="44.5"/>
            <line x1="24.5" y1="8.5" x2="30.5" y2="33"/>
          </g>
          <ellipse cx="33" cy="28" rx="5" ry="3" fill="rgba(255,255,255,0.6)" transform="rotate(-20,33,28)"/>
        </svg>
      </div>
      <div className="nf-shadow"/>
    </div>
  )
}

export default function NotFound() {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])

  useEffect(() => {
    setPageSeo({ title: 'Fuera de juego — 404' })
  }, [])

  return (
    <div className="nf-page page-fade-in">
      <AnimatedBall />

      <div className="nf-code">404</div>
      <h1 className="nf-title">Fuera de juego</h1>
      <p className="nf-phrase">{phrase}</p>
      <p className="nf-desc">La página que buscas no existe o ha sido movida a otro campo.</p>

      <div className="nf-actions">
        <Link className="btn btn-primary" to="/">Volver al inicio</Link>
        <Link className="btn btn-ghost" to="/fichajes">Ver fichajes</Link>
        <Link className="btn btn-ghost" to="/rumores">Ver rumores</Link>
      </div>

      <div className="nf-suggestions">
        <p className="nf-suggest-label">Puede que buscabas…</p>
        <div className="nf-suggest-grid">
          <Link to="/jugadores" className="nf-suggest-chip">Jugadores</Link>
          <Link to="/clubes" className="nf-suggest-chip">Clubes</Link>
          <Link to="/comparador" className="nf-suggest-chip">Comparador</Link>
          <Link to="/rankings" className="nf-suggest-chip">Rankings</Link>
          <Link to="/quiz" className="nf-suggest-chip">Quiz</Link>
          <Link to="/once-ideal" className="nf-suggest-chip">Once ideal</Link>
        </div>
      </div>
    </div>
  )
}
