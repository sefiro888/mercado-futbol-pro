import { useState } from 'react'
import { flagCode } from '@/lib/flags.js'
import Icon from './Icon.jsx'

// Bandera de país como imagen SVG (se ve igual en Windows, Mac, Android…).
// Si la imagen no carga (sin red) o el país es desconocido, muestra un globo 🌍.
//
// props: country, size (alto en px), withName (añade el nombre al lado).
export default function Flag({ country, size = 15, withName = false }) {
  const [failed, setFailed] = useState(false)
  const code = flagCode(country)

  const visual =
    code && !failed ? (
      <img
        className="flag"
        src={`https://flagcdn.com/w40/${code}.png`}
        srcSet={`https://flagcdn.com/w40/${code}.png 1x, https://flagcdn.com/w80/${code}.png 2x`}
        width={Math.round(size * 1.5)}
        height={size}
        alt=""
        style={{ height: size }}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    ) : (
      <span className="flag-fallback" aria-hidden="true" style={{ height: size }}>
        <Icon name="globe" size={size + 1} />
      </span>
    )

  if (!withName) return visual

  return (
    <span className="flag-label">
      {visual}
      <span>{country}</span>
    </span>
  )
}
