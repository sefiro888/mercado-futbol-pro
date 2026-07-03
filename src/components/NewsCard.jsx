import Badge from './Badge.jsx'
import ReliabilityBadge from './ReliabilityBadge.jsx'
import Icon from './Icon.jsx'
import { NEWS_CATEGORY, resolve } from '@/lib/taxonomy.js'
import { formatDate } from '@/lib/format.js'
import './Cards.css'

// Tarjeta de noticia. Muestra SOLO resumen propio + fuente + fecha + enlace.
// Nunca reproduce el contenido completo del medio (compromiso editorial).
export default function NewsCard({ item }) {
  const category = resolve(NEWS_CATEGORY, item.category)

  return (
    <article className="card interactive news-card">
      <div className="news-thumb" aria-hidden="true">
        {item.image ? <img src={item.image} alt="" /> : <Icon name="newspaper" size={40} />}
      </div>

      <div className="news-body">
        <div className="news-meta">
          <Badge tone={category.tone}>{category.label}</Badge>
          <ReliabilityBadge level={item.reliability} />
          <span>· {formatDate(item.publishedAt)}</span>
        </div>

        <h3 className="clamp-2">{item.title}</h3>
        <p className="news-summary clamp-3">{item.summary}</p>

        <div className="news-foot">
          <span className="news-source">
            Fuente: <strong>{item.sourceName}</strong>
          </span>
          <a
            className="link-more"
            href={item.sourceUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            Ver fuente ↗
          </a>
        </div>
      </div>
    </article>
  )
}
