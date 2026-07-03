import { RELIABILITY, resolve } from '@/lib/taxonomy.js'

// Muestra una fuente como enlace externo con su nivel de fiabilidad.
// rel="nofollow noopener" porque enlazamos a terceros (buenas prácticas SEO/seguridad).
export default function SourceBadge({ source }) {
  if (!source) return null
  const { tone } = resolve(RELIABILITY, source.reliabilityLevel)

  return (
    <a
      className={`badge tone-${tone}`}
      href={source.url}
      target="_blank"
      rel="nofollow noopener noreferrer"
      title={`${source.name} · ${source.type} · ${source.country}`}
    >
      <span className="dot" aria-hidden="true" />
      {source.name}
      <span aria-hidden="true" style={{ opacity: 0.7 }}>↗</span>
    </a>
  )
}
