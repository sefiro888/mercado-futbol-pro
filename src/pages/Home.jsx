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
import DeadlineCountdown from '@/components/DeadlineCountdown.jsx'
import MarketSmash from '@/components/MarketSmash.jsx'

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
  getMarketDashboard,
  getLeagueSummary,
  getPlayerById,
  getClubById,
  search,
} from '@/lib/data.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { enrichTransfer } from '@/lib/calculations.js'
import { formatMoney } from '@/lib/format.js'
import './Pages.css'

// Calendario del Mundial 2026 para determinar la fase actual
const WC2026 = [
  { label: 'Fase de Grupos', from: new Date('2026-06-11'), to: new Date('2026-06-27') },
  { label: '32avos de Final', from: new Date('2026-06-29'), to: new Date('2026-07-03') },
  { label: 'Octavos de Final', from: new Date('2026-07-04'), to: new Date('2026-07-07') },
  { label: 'Cuartos de Final', from: new Date('2026-07-09'), to: new Date('2026-07-10') },
  { label: 'Semifinales', from: new Date('2026-07-14'), to: new Date('2026-07-15') },
  { label: 'Final', from: new Date('2026-07-19'), to: new Date('2026-07-19') },
]
const WC_START = new Date('2026-06-11')
const WC_END = new Date('2026-07-19T23:59:59')

function WorldCupBanner() {
  const now = new Date()
  const isActive = now >= WC_START && now <= WC_END
  const isFuture = now < WC_START
  const isOver = now > WC_END

  let phase = null
  if (isActive) {
    phase = WC2026.find(p => now >= p.from && now <= p.to)?.label
      || WC2026.slice().reverse().find(p => now >= p.from)?.label
      || 'En curso'
  }

  // Countdown para cuando sea futuro
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = WC_START - new Date()
    if (diff <= 0) return null
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return { d, h, m }
  })

  useEffect(() => {
    if (!isFuture) return
    const id = setInterval(() => {
      const diff = WC_START - new Date()
      if (diff <= 0) { clearInterval(id); setTimeLeft(null); return }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
      })
    }, 30000)
    return () => clearInterval(id)
  }, [isFuture])

  if (isOver) return null

  return (
    <Link to="/mundial" className="wc-banner">
      <div className="wc-banner-left">
        <span className="wc-banner-trophy">🏆</span>
        <div>
          <div className="wc-banner-title">Copa del Mundo 2026</div>
          <div className="wc-banner-sub">USA · México · Canadá · 48 equipos</div>
        </div>
      </div>
      <div className="wc-banner-right">
        {isActive && (
          <>
            <span className="wc-banner-live">
              <span className="wc-banner-dot" />
              EN CURSO
            </span>
            {phase && <span className="wc-banner-phase">{phase}</span>}
          </>
        )}
        {isFuture && timeLeft && (
          <div className="wc-countdown">
            <div className="wc-cd-unit"><strong>{timeLeft.d}</strong><span>días</span></div>
            <div className="wc-cd-sep">:</div>
            <div className="wc-cd-unit"><strong>{timeLeft.h}</strong><span>horas</span></div>
            <div className="wc-cd-sep">:</div>
            <div className="wc-cd-unit"><strong>{timeLeft.m}</strong><span>min</span></div>
          </div>
        )}
        <span className="wc-banner-arrow">→</span>
      </div>
    </Link>
  )
}

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
  const marketDashboard = getMarketDashboard()
  const topSpender = marketDashboard.topSpenders[0]
  const bestBalance = marketDashboard.bestBalances[0]
  const latestDeal = marketDashboard.latest[0]
  const latestDealPlayer = latestDeal ? getPlayerById(latestDeal.playerId) : null
  const latestDealClub = latestDeal ? getClubById(latestDeal.toClubId) : null
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
          Mercado 2026/27 · Actualizado 27/06/2026
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
                  {results.players.slice(0, 5).map((p) => {
                    const photo = playerPhotoUrl(p)
                    const pClub = getClubById(p.currentClubId)
                    return (
                      <Link key={p.id} to={`/jugadores/${p.slug}`} className="sr-item" onClick={() => setQuery('')}>
                        {photo ? (
                          <div className="sr-avatar-wrap" style={{ borderColor: pClub?.primaryColor || 'var(--brand)' }}>
                            <img className="sr-avatar" src={photo} alt="" />
                          </div>
                        ) : (
                          <Crest name={p.name} variant="avatar" size={28} color={pClub?.primaryColor} />
                        )}
                        <div className="sr-name-wrap">
                          <span className="sr-pname">{p.name}</span>
                          {pClub ? (
                            <span className="sr-pclub">
                              <Crest name={pClub.name} color={pClub.primaryColor} size={12} logoUrl={clubLogoUrl(pClub.id)} />
                              {pClub.name}
                            </span>
                          ) : (
                            <span className="sr-pclub dim">Agente libre</span>
                          )}
                        </div>
                        <small className="sr-pos-label">{p.position}</small>
                      </Link>
                    )
                  })}
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

        <DeadlineCountdown />

        <div className="hero-stats">
          {stats.map((s, i) => (
            <CountStat key={s.l} value={s.v} label={s.l} delay={0.1 + i * 0.08} />
          ))}
        </div>

        <MarketSmash />

        <WorldCupBanner />

        <div className="hero-market-strip">
          {topSpender && (
            <Link to={`/clubes/${topSpender.club.slug}`} className="hms-item">
              <span>Más inversión</span>
              <strong>{topSpender.club.name}</strong>
              <small>{formatMoney(topSpender.spent)}</small>
            </Link>
          )}
          {bestBalance && (
            <Link to={`/clubes/${bestBalance.club.slug}`} className="hms-item">
              <span>Mejor balance</span>
              <strong>{bestBalance.club.name}</strong>
              <small>+{formatMoney(bestBalance.balance)}</small>
            </Link>
          )}
          {latestDeal && (
            <Link to={latestDealPlayer ? `/jugadores/${latestDealPlayer.slug}` : '/fichajes'} className="hms-item">
              <span>Último movimiento</span>
              <strong>{latestDealPlayer?.name || latestDeal.playerId}</strong>
              <small>{latestDealClub?.name || latestDeal.toClubId}</small>
            </Link>
          )}
        </div>
      </section>

      {/* ============================ ÚLTIMAS NOTICIAS ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>Últimas noticias</h2>
          <Link className="link-more" to="/noticias">Ver todas →</Link>
        </div>
        <Reveal stagger className="grid grid-3">
          {latestNews.map((n, i) => <NewsCard key={n.id} item={n} featured={i === 0} />)}
        </Reveal>
      </section>

      {/* ============================ EL MERCADO EN CIFRAS ============================ */}
      <section className="section container">
        <div className="section-head">
          <h2>El mercado en cifras</h2>
        </div>
        <Reveal stagger className="market-stats">
          <div className="ms-card">
            <Icon name="briefcase" size={22} className="ms-ico" />
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
          {featuredTransfers.map((t) => {
            const p = getPlayerById(t.playerId)
            const from = getClubById(t.fromClubId)
            const to = getClubById(t.toClubId)
            const photo = p ? playerPhotoUrl(p) : null
            const clubColor = to?.primaryColor || 'var(--brand)'
            return (
              <Link 
                key={t.id} 
                to="/fichajes" 
                className="card interactive featured-transfer-card"
                style={{ '--club-c': clubColor }}
              >
                {photo && (
                  <img className="ftc-player-bg" src={photo} alt="" aria-hidden="true" />
                )}
                
                <div className="ftc-content">
                  <div className="ftc-status">{t.status}</div>
                  <h3 className="ftc-name">{p?.name || t.playerId}</h3>
                  
                  <div className="ftc-clubs">
                    {from ? (
                      <Crest name={from.name} color={from.primaryColor} size={18} logoUrl={clubLogoUrl(from.id)} />
                    ) : (
                      <span className="ftc-club-fallback">{t.fromClubName || '—'}</span>
                    )}
                    <span className="ftc-arrow">→</span>
                    {to && (
                      <Crest name={to.name} color={to.primaryColor} size={18} logoUrl={clubLogoUrl(to.id)} />
                    )}
                  </div>
                  
                  <div className="ftc-bottom">
                    <div className="ftc-fee num">{t.transferFee === 0 ? 'Libre' : formatMoney(t.transferFee)}</div>
                    <div className="ftc-hint" title={t.diffText}>{t.diffText}</div>
                  </div>
                </div>
              </Link>
            )
          })}
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
