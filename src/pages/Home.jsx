import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import SearchBar from '@/components/SearchBar.jsx'
import NewsCard from '@/components/NewsCard.jsx'
import ClubCard from '@/components/ClubCard.jsx'
import PlayerCard from '@/components/PlayerCard.jsx'
import RumourCard from '@/components/RumourCard.jsx'
import Crest from '@/components/Crest.jsx'
import Flag from '@/components/Flag.jsx'
import Reveal from '@/components/Reveal.jsx'
import CountStat from '@/components/CountStat.jsx'
import Icon from '@/components/Icon.jsx'

import { SITE } from '@/config/site.js'
import { setPageSeo } from '@/lib/seo.js'
import { RELIABILITY } from '@/lib/taxonomy.js'
import {
  getAllNews,
  getAllTransfers,
  getAllRumours,
  getAllClubs,
  getAllPlayers,
  getTrendingClubs,
  getTrendingPlayers,
  getPlayersByClub,
  getMostValuablePlayers,
  getMarketStats,
  getLeagueSummary,
  getPlayerById,
  getClubById,
  search,
} from '@/lib/data.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { enrichTransfer } from '@/lib/calculations.js'
import { formatMoney } from '@/lib/format.js'
import './Pages.css'

// Bloque que explica las reglas de clasificación de rumores (transparencia editorial).
const GUIDE = [
  { key: 'oficial', cls: 'rg-oficial' },
  { key: 'alta', cls: 'rg-alta' },
  { key: 'media', cls: 'rg-media' },
  { key: 'baja', cls: 'rg-baja' },
  { key: 'descartado', cls: 'rg-descartado' },
]

export default function Home() {
  const [query, setQuery] = useState('')

  useEffect(() => {
    setPageSeo({}) // título y descripción por defecto del sitio
  }, [])

  const latestNews = getAllNews().slice(0, 6)
  const featuredTransfers = getAllTransfers()
    .filter((t) => t.status === 'confirmado')
    .map(enrichTransfer)
    .sort((a, b) => b.transferFee - a.transferFee)
    .slice(0, 4)
  const hotRumours = getAllRumours()
    .filter((r) => ['alta', 'oficial'].includes(r.reliability))
    .slice(0, 3)
  const trendingClubs = getTrendingClubs(4)
  const trendingPlayers = getTrendingPlayers(6)
  const topValued = getMostValuablePlayers(8)
  const leagues = getLeagueSummary()
  const market = getMarketStats()
  const priciestPlayer = market.priciest ? getPlayerById(market.priciest.playerId) : null
  const priciestToClub = market.priciest ? getClubById(market.priciest.toClubId) : null

  const results = query.length >= 2 ? search(query) : null
  const hasResults =
    results && (results.players.length || results.clubs.length || results.news.length)

  const stats = [
    { v: getAllTransfers().length, l: 'Fichajes' },
    { v: getAllRumours().length, l: 'Rumores' },
    { v: getAllClubs().length, l: 'Clubes' },
    { v: getAllPlayers().length, l: 'Jugadores' },
  ]

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="home-hero container">
        <span className="live-badge">
          <span className="live-dot" aria-hidden="true" />
          Mercado en vivo · Temporada {new Date().getFullYear()}
        </span>
        <h1 className="hero-title">
          Fichajes, rumores y <span className="text-shine">noticias de fútbol</span>, contrastados.
        </h1>
        <p className="hero-lead">
          {SITE.name} reúne noticias, fichajes confirmados y rumores clasificados por
          fiabilidad, con tablas de traspasos y análisis económico. Sin sensacionalismo:
          cada información enlaza a su fuente.
        </p>

        <div className="hero-search">
          <SearchBar
            large
            placeholder="Busca un jugador, club o noticia…"
            onSearch={setQuery}
          />

          {results && (
            <div className="search-results">
              {!hasResults && <div className="sr-empty">Sin resultados para «{query}».</div>}

              {results.players.length > 0 && (
                <>
                  <div className="sr-group-title">Jugadores</div>
                  {results.players.slice(0, 4).map((p) => (
                    <Link key={p.id} to={`/jugadores/${p.slug}`} className="sr-item" onClick={() => setQuery('')}>
                      <Crest name={p.name} variant="avatar" size={28} />
                      {p.name} <small>{p.position}</small>
                    </Link>
                  ))}
                </>
              )}

              {results.clubs.length > 0 && (
                <>
                  <div className="sr-group-title">Clubes</div>
                  {results.clubs.slice(0, 4).map((c) => (
                    <Link key={c.id} to={`/clubes/${c.slug}`} className="sr-item" onClick={() => setQuery('')}>
                      <Crest name={c.name} color={c.primaryColor} size={28} />
                      {c.name} <small>{c.league}</small>
                    </Link>
                  ))}
                </>
              )}

              {results.news.length > 0 && (
                <>
                  <div className="sr-group-title">Noticias</div>
                  {results.news.slice(0, 4).map((n) => (
                    <a key={n.id} href={n.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" className="sr-item">
                      <Icon name="newspaper" size={18} /> <span className="clamp-2">{n.title}</span> <small>{n.sourceName}</small>
                    </a>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="hero-stats">
          {stats.map((s, i) => (
            <CountStat key={s.l} value={s.v} label={s.l} delay={0.1 + i * 0.08} />
          ))}
        </div>
      </section>

      {/* ============================ ÚLTIMAS NOTICIAS ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>Últimas noticias</h2>
          <Link className="link-more" to="/noticias">Ver todas →</Link>
        </div>
        <Reveal stagger className="grid grid-3">
          {latestNews.map((n) => <NewsCard key={n.id} item={n} />)}
        </Reveal>
      </section>

      {/* ============================ EL MERCADO EN CIFRAS ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>El mercado en cifras</h2>
        </div>
        <Reveal stagger className="market-stats">
          <div className="ms-card">
            <Icon name="arrow-in" size={22} className="ms-ico" />
            <div className="ms-value num">{formatMoney(market.totalSpend)}</div>
            <div className="ms-label">Invertido en fichajes</div>
          </div>
          <div className="ms-card">
            <Icon name="star" size={22} className="ms-ico ms-gold" />
            <div className="ms-value num">{formatMoney(market.priciest?.transferFee)}</div>
            <div className="ms-label">
              Fichaje más caro{priciestPlayer ? `: ${priciestPlayer.name}` : ''}
              {priciestToClub ? ` (${priciestToClub.name})` : ''}
            </div>
          </div>
          <div className="ms-card">
            <Icon name="ball" size={22} className="ms-ico" />
            <div className="ms-value num">{formatMoney(market.totalSquadValue)}</div>
            <div className="ms-label">Valor total de las plantillas</div>
          </div>
          <div className="ms-card">
            <Icon name="newspaper" size={22} className="ms-ico" />
            <div className="ms-value num">{market.transferCount}</div>
            <div className="ms-label">Operaciones registradas</div>
          </div>
        </Reveal>
      </section>

      {/* ============================ FICHAJES DESTACADOS ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>Fichajes destacados</h2>
          <Link className="link-more" to="/fichajes">Tabla completa →</Link>
        </div>
        <Reveal stagger className="grid grid-4">
          {featuredTransfers.map((t) => (
            <Link key={t.id} to="/fichajes" className="card interactive stat-card">
              <div className="stat-label">{t.status}</div>
              <div className="stat-value num text-gradient">{formatMoney(t.transferFee)}</div>
              <div className="stat-hint clamp-2">{t.diffText}</div>
            </Link>
          ))}
        </Reveal>
      </section>

      {/* ============================ RUMORES CALIENTES ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>Rumores calientes</h2>
          <Link className="link-more" to="/rumores">Ver todos →</Link>
        </div>
        <Reveal stagger className="grid grid-3">
          {hotRumours.map((r) => <RumourCard key={r.id} rumour={r} />)}
        </Reveal>
      </section>

      {/* ============================ CLUBES MÁS CONSULTADOS ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>Clubes más consultados</h2>
          <Link className="link-more" to="/clubes">Ver clubes →</Link>
        </div>
        <Reveal stagger className="grid grid-4">
          {trendingClubs.map(({ club }) => (
            <ClubCard key={club.id} club={club} playerCount={getPlayersByClub(club.id).length} />
          ))}
        </Reveal>
      </section>

      {/* ============================ LAS GRANDES LIGAS ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>Las grandes ligas</h2>
          <Link className="link-more" to="/clubes">Ver clubes →</Link>
        </div>
        <Reveal stagger className="grid grid-3">
          {leagues.map((l) => (
            <div key={l.league} className="card interactive league-card">
              <div className="lc-head">
                <Flag country={l.country} size={22} />
                <h3>{l.league}</h3>
              </div>
              <div className="lc-stats">
                <div><span className="num">{l.clubs}</span><small>equipos</small></div>
                <div><span className="num">{formatMoney(l.value)}</span><small>valor total</small></div>
              </div>
              {l.top && (
                <Link to={`/clubes/${l.top.slug}`} className="lc-top">
                  <Crest name={l.top.name} color={l.top.primaryColor} size={28} logoUrl={clubLogoUrl(l.top.id)} />
                  <span><small>Más valioso</small>{l.top.name}</span>
                  <span className="num lc-top-val">{formatMoney(l.top.squadValue)}</span>
                </Link>
              )}
            </div>
          ))}
        </Reveal>
      </section>

      {/* ============================ JUGADORES MÁS VALIOSOS ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>Jugadores más valiosos</h2>
          <Link className="link-more" to="/jugadores">Ver ranking →</Link>
        </div>
        <Reveal stagger className="topval-list">
          {topValued.map((p, i) => {
            const c = getClubById(p.currentClubId)
            return (
              <Link key={p.id} to={`/jugadores/${p.slug}`} className="topval-row card interactive">
                <span className={`topval-rank ${i < 3 ? 'top3' : ''}`}>{i + 1}</span>
                <Crest name={p.name} variant="avatar" size={36} color={c?.primaryColor} />
                <span className="topval-main">
                  <span className="topval-name">{p.name}</span>
                  <span className="topval-club">{c?.name || '—'}</span>
                </span>
                <span className="topval-pos">{p.position}</span>
                <span className="topval-val num">{formatMoney(p.marketValue)}</span>
              </Link>
            )
          })}
        </Reveal>
      </section>

      {/* ============================ JUGADORES EN TENDENCIA ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>Jugadores en tendencia</h2>
          <Link className="link-more" to="/jugadores">Ver jugadores →</Link>
        </div>
        <Reveal stagger className="grid grid-3">
          {trendingPlayers.map(({ player }) => <PlayerCard key={player.id} player={player} />)}
        </Reveal>
      </section>

      {/* ============================ CÓMO CLASIFICAMOS LOS RUMORES ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>Cómo clasificamos los rumores</h2>
        </div>
        <p className="muted" style={{ maxWidth: '70ch' }}>
          Cada rumor recibe una etiqueta de fiabilidad según el número y la calidad de las
          fuentes. Así sabes de un vistazo cuánta confianza merece una información.
        </p>
        <Reveal stagger className="reliability-guide">
          {GUIDE.map(({ key, cls }) => (
            <div key={key} className={`rg-item ${cls}`}>
              <h4>{RELIABILITY[key].label}</h4>
              <p>{RELIABILITY[key].help}</p>
            </div>
          ))}
        </Reveal>
      </section>
    </>
  )
}
