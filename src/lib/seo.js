// =============================================================================
// SEO: actualización del <title>, meta description y Open Graph por página.
// En un MVP sin SSR esto se hace en el cliente (suficiente para navegación SPA).
// Para SEO avanzado, el ROADMAP contempla migrar a un framework con SSR/SSG.
// =============================================================================

import { SITE } from '@/config/site.js'

function setMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Actualiza los metadatos de la página actual.
 * @param {{title?: string, description?: string}} opts
 */
export function setPageSeo({ title, description } = {}) {
  const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`
  document.title = fullTitle

  const desc = description || SITE.description
  setMeta('name', 'description', desc)
  setMeta('property', 'og:title', fullTitle)
  setMeta('property', 'og:description', desc)
  setMeta('name', 'twitter:title', fullTitle)
  setMeta('name', 'twitter:description', desc)
}

// ---------------------------------------------------------------------------
// Generadores de datos estructurados (schema.org).
// Devuelven objetos JSON-LD listos para inyectar en un <script type="application/ld+json">.
// En el MVP se dejan preparados; se pueden activar con <JsonLd data={...} />.
// ---------------------------------------------------------------------------

/** Schema NewsArticle a partir de una noticia. */
export function newsArticleSchema(item) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    datePublished: item.publishedAt,
    description: item.summary,
    // Importante: no reproducimos el cuerpo del medio, solo enlazamos a la fuente.
    isBasedOn: item.sourceUrl,
    publisher: { '@type': 'Organization', name: SITE.name },
  }
}

/** Schema SportsTeam a partir de un club. */
export function sportsTeamSchema(club) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: club.name,
    sport: 'Football',
    memberOf: { '@type': 'SportsOrganization', name: club.league },
    location: club.country,
  }
}

/** Schema Person a partir de un jugador. */
export function personSchema(player) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.name,
    nationality: player.nationality,
    height: player.height ? `${player.height} cm` : undefined,
    jobTitle: player.position,
  }
}
