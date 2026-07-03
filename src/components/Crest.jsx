import { useState } from 'react'

// Escudo de club / avatar de jugador.
// Si se pasa `logoUrl` (escudo real), lo muestra sobre un fondo neutro; si la
// imagen falla, cae automáticamente a las iniciales sobre el color del club.
//
// variant="crest" → cuadrado redondeado (clubes); variant="avatar" → círculo (jugadores).

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
}

export default function Crest({ name, size = 44, color, variant = 'crest', logoUrl }) {
  const [failed, setFailed] = useState(false)
  const showLogo = logoUrl && !failed

  const style = {
    width: size,
    height: size,
    fontSize: size * 0.36,
    ...(showLogo
      ? { background: 'rgba(255,255,255,0.06)', borderColor: 'var(--border)' }
      : color
        ? { background: `linear-gradient(135deg, ${color}, ${color}99)`, borderColor: `${color}88` }
        : {}),
  }

  return (
    <span className={`${variant} ${showLogo ? 'has-logo' : ''}`} style={style} aria-hidden="true">
      {showLogo ? (
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ width: '78%', height: '78%', objectFit: 'contain' }}
        />
      ) : (
        initials(name)
      )}
    </span>
  )
}
