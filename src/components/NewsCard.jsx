import Badge from './Badge.jsx'
import ReliabilityBadge from './ReliabilityBadge.jsx'
import Icon from './Icon.jsx'
import Crest from './Crest.jsx'
import { NEWS_CATEGORY, resolve } from '@/lib/taxonomy.js'
import { getClubById, getPlayerById } from '@/lib/data.js'
import { formatDate } from '@/lib/format.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import './Cards.css'

// Tarjeta de noticia. Muestra SOLO resumen propio + fuente + fecha + enlace.
// Nunca reproduce el contenido completo del medio (compromiso editorial).
export default function NewsCard({ item, featured = false }) {
  const category = resolve(NEWS_CATEGORY, item.category)
  const relatedPlayer = (item.relatedPlayerIds || []).map(getPlayerById).find(Boolean)
  const relatedClub = (item.relatedClubIds || []).map(getClubById).find(Boolean)
  const playerPhoto = relatedPlayer ? playerPhotoUrl(relatedPlayer) : null
  const clubColor = relatedClub?.primaryColor || 'var(--brand)'

  return (
    <article
      className={`card interactive news-card rel-${item.reliability || 'neutral'} ${featured ? 'news-card-featured' : ''}`}
      style={{ '--news-c': clubColor }}
    >
      <div className="news-thumb" aria-hidden="true">
        {item.image ? (
          <img src={item.image} alt="" />
        ) : playerPhoto ? (
          <img className="news-player-img" src={playerPhoto} alt="" />
        ) : relatedClub ? (
          <div className="news-thumb-crest">
            <Crest
              name={relatedClub.name}
              color={relatedClub.primaryColor}
              logoUrl={clubLogoUrl(relatedClub.id)}
              size={76}
            />
          </div>
        ) : (
          <Icon name="newspaper" size={40} />
        )}
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
