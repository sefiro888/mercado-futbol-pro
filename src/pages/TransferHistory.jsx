import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllPlayers, getAllClubs, getAllTransfers, getPlayerById, getClubById } from '@/lib/data.js'
import { flagCode } from '@/lib/flags.js'
import historicalData from '@/data/transfers-history.json'
import './TransferHistory.css'

// ─── Constantes ───────────────────────────────────────────────────────────────
const SEASONS = [
  { id: '2026/27', label: '26/27', full: 'Temporada 2026/27' },
  { id: '2025/26', label: '25/26', full: 'Temporada 2025/26' },
  { id: '2024/25', label: '24/25', full: 'Temporada 2024/25' },
  { id: '2023/24', label: '23/24', full: 'Temporada 2023/24' },
  { id: '2022/23', label: '22/23', full: 'Temporada 2022/23' },
  { id: '2021/22', label: '21/22', full: 'Temporada 2021/22' },
  { id: '2020/21', label: '20/21', full: 'Temporada 2020/21' },
  { id: '2019/20', label: '19/20', full: 'Temporada 2019/20' },
  { id: '2018/19', label: '18/19', full: 'Temporada 2018/19' },
  { id: '2017/18', label: '17/18', full: 'Temporada 2017/18' },
]

const LEAGUES = ['Todas', 'Premier League', 'LaLiga', 'Bundesliga', 'Serie A', 'Ligue 1']

const LEAGUE_META = {
  'Premier League': { code: 'pl', color: '#38003c', accent: '#00ff85', flag: 'gb-eng', short: 'PL' },
  'LaLiga':         { code: 'lla', color: '#ff4b1f', accent: '#ffd700', flag: 'es', short: 'LL' },
  'Bundesliga':     { code: 'bl', color: '#d20515', accent: '#ffd700', flag: 'de', short: 'BL' },
  'Serie A':        { code: 'sa', color: '#024494', accent: '#ffffff', flag: 'it', short: 'SA' },
  'Ligue 1':        { code: 'l1', color: '#001e96', accent: '#fd5d00', flag: 'fr', short: 'L1' },
}

const POS_GROUPS = [
  { id: 'Todas', label: 'Todas' },
  { id: 'GK',  label: 'Porteros' },
  { id: 'DEF', label: 'Defensas' },
  { id: 'LAT', label: 'Laterales' },
  { id: 'MID', label: 'Centrocampistas' },
  { id: 'EXT', label: 'Extremos' },
  { id: 'DEL', label: 'Delanteros' },
]

const POS_META = {
  GK:  { label: 'POR', color: '#10b981' },
  DEF: { label: 'DEF', color: '#3b82f6' },
  LAT: { label: 'LAT', color: '#6366f1' },
  MID: { label: 'MED', color: '#a855f7' },
  EXT: { label: 'EXT', color: '#f59e0b' },
  DEL: { label: 'DEL', color: '#ef4444' },
}

const FEE_RANGES = [
  { id: 'all',    label: 'Todos',    min: 0,    max: Infinity },
  { id: 'free',   label: 'Libre',    min: -1,   max: 0.01 },
  { id: 'u30',    label: '< 30M',    min: 0.01, max: 30 },
  { id: '30-60',  label: '30–60M',   min: 30,   max: 60 },
  { id: '60-100', label: '60–100M',  min: 60,   max: 100 },
  { id: '100p',   label: '100M+ 🔥', min: 100,  max: Infinity },
]

const SORT_OPTIONS = [
  { id: 'fee-desc',  label: 'Mayor cuota' },
  { id: 'fee-asc',   label: 'Menor cuota' },
  { id: 'date-desc', label: 'Más reciente' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function flagUrl(code) {
  if (!code) return null
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`
}

// Posición textual del dataset → grupo del filtro (GK/DEF/LAT/MID/EXT/DEL).
function posToGroup(position = '') {
  const p = position.toLowerCase()
  if (p.includes('portero')) return 'GK'
  if (p.includes('lateral') || p.includes('carrilero')) return 'LAT'
  if (p.includes('central') || p.includes('defensa')) return 'DEF'
  if (p.includes('extremo')) return 'EXT'
  if (p.includes('delantero')) return 'DEL'
  return 'MID'
}

// Temporada futbolística (jul–jun) a partir de una fecha: '2026/27'.
function seasonFromDate(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1
  return `${y}/${String((y + 1) % 100).padStart(2, '0')}`
}

// Fichajes confirmados del mercado EN CURSO (transfers.json) convertidos al
// formato del archivo histórico. Solo la temporada 2026/27: las anteriores ya
// están curadas a mano en transfers-history.json (evita duplicados).
function buildLiveSeason() {
  return getAllTransfers()
    .filter((t) => t.status === 'confirmado' && seasonFromDate(t.transferDate) === '2026/27')
    .map((t) => {
      const player = getPlayerById(t.playerId)
      const from = getClubById(t.fromClubId)
      const to = getClubById(t.toClubId)
      if (!player || !to) return null
      return {
        id: `live-${t.id}`,
        season: '2026/27',
        playerName: player.name,
        playerSlug: player.slug,
        nationality: player.nationality,
        nationalityCode: flagCode(player.nationality) || null,
        position: player.position,
        posGroup: posToGroup(player.position),
        age: player.age,
        fromClubName: from?.name ?? t.fromClubName ?? '—',
        fromClubId: t.fromClubId,
        fromLeague: from?.league ?? null,
        toClubName: to.name,
        toClubId: t.toClubId,
        toLeague: to.league,
        transferFee: t.transferFee ?? 0,
        marketValue: t.marketValueAtTransfer ?? player.marketValue ?? null,
        transferDate: t.transferDate,
        notes: t.notes ?? null,
        sources: [],
      }
    })
    .filter(Boolean)
}

function feeTier(fee) {
  if (!fee || fee === 0) return 'free'
  if (fee >= 100) return 'elite'
  if (fee >= 60)  return 'high'
  if (fee >= 30)  return 'mid'
  return 'low'
}

function feeLabel(fee) {
  if (!fee || fee === 0) return 'Libre'
  return `${fee % 1 === 0 ? fee : fee.toFixed(1)} M€`
}

function useCountUp(target, active, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round(p * p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, active, duration])
  return val
}

// ─── Stat counter animado ─────────────────────────────────────────────────────
function StatBox({ value, suffix = '', label, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  const displayed = useCountUp(value, visible)
  return (
    <div className="th2-stat" ref={ref}>
      <span className="th2-stat-val">{displayed}{suffix}</span>
      <span className="th2-stat-label">{label}</span>
    </div>
  )
}

// ─── Bandera ──────────────────────────────────────────────────────────────────
function Flag({ code, name }) {
  const [err, setErr] = useState(false)
  const url = flagUrl(code)
  if (!url || err) return <span className="th2-flag-fallback" title={name}>🏳</span>
  return (
    <img
      src={url}
      alt={name}
      title={name}
      className="th2-flag"
      onError={() => setErr(true)}
      loading="lazy"
      decoding="async"
    />
  )
}

// ─── Escudo de club ───────────────────────────────────────────────────────────
function ClubCrest({ clubId, clubName, league, size = 32 }) {
  const [err, setErr] = useState(false)
  const leagueMeta = LEAGUE_META[league] ?? {}
  const url = clubId ? `https://tmssl.akamaized.net/images/wappen/normquadrat/${clubId}.png` : null
  const logoFallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clubName ?? '?')}&backgroundColor=1e293b&textColor=94a3b8`

  return (
    <div
      className="th2-crest"
      style={{ width: size, height: size, borderColor: leagueMeta.accent ?? '#334155' }}
      title={clubName}
    >
      {!err && (url || logoFallback) ? (
        <img
          src={url ?? logoFallback}
          alt={clubName}
          onError={() => setErr(true)}
          className="th2-crest-img"
        />
      ) : (
        <span className="th2-crest-init" style={{ background: leagueMeta.color ?? '#1e293b' }}>
          {(clubName ?? '?')[0]}
        </span>
      )}
    </div>
  )
}

// ─── Badge de liga ────────────────────────────────────────────────────────────
function LeagueBadge({ league }) {
  const meta = LEAGUE_META[league]
  if (!meta) return <span className="th2-league-badge th2-lb-other">{league ?? '—'}</span>
  return (
    <span
      className={`th2-league-badge th2-lb-${meta.code}`}
      style={{ '--lbg': meta.color, '--lacc': meta.accent }}
    >
      <Flag code={meta.flag} name={league} />
      {meta.short}
    </span>
  )
}

// ─── Badge de posición ────────────────────────────────────────────────────────
function PosBadge({ posGroup }) {
  const meta = POS_META[posGroup] ?? { label: posGroup, color: '#64748b' }
  return (
    <span className="th2-pos-badge" style={{ '--pc': meta.color }}>
      {meta.label}
    </span>
  )
}

// ─── Tarjeta de traspaso ──────────────────────────────────────────────────────
function TransferCard({ transfer, players, clubs, rank }) {
  const [expanded, setExpanded] = useState(false)
  const [flagErr, setFlagErr] = useState(false)

  const tier = feeTier(transfer.transferFee)
  const isElite = tier === 'elite'

  // Intentar vincular a jugador existente en el dataset
  const playerInDb = players.find(
    (p) => p.slug === transfer.playerSlug || p.id === transfer.playerSlug
  )
  const toClubInDb = clubs.find((c) => c.id === transfer.toClubId)
  const fromClubInDb = clubs.find((c) => c.id === transfer.fromClubId)

  const mv = transfer.marketValue
  const fee = transfer.transferFee
  const surplus = fee && mv ? ((fee - mv) / mv * 100).toFixed(0) : null

  return (
    <article
      className={`th2-card th2-card--${tier} ${expanded ? 'th2-card--open' : ''} ${isElite ? 'th2-card--elite' : ''}`}
      onClick={() => setExpanded((e) => !e)}
    >
      {isElite && <div className="th2-elite-glow" />}
      {rank <= 3 && <div className="th2-rank-badge">#{rank}</div>}

      {/* Cabecera: clubs */}
      <div className="th2-card-clubs">
        <div className="th2-club-block">
          <ClubCrest
            clubId={transfer.fromClubId}
            clubName={transfer.fromClubName}
            league={transfer.fromLeague}
            size={40}
          />
          <div className="th2-club-info">
            {fromClubInDb
              ? <Link to={`/clubes/${fromClubInDb.id}`} onClick={(e) => e.stopPropagation()} className="th2-club-name">{transfer.fromClubName}</Link>
              : <span className="th2-club-name">{transfer.fromClubName}</span>
            }
            <LeagueBadge league={transfer.fromLeague} />
          </div>
        </div>

        <div className="th2-transfer-arrow">
          <svg viewBox="0 0 40 16" className="th2-arrow-svg">
            <path d="M0 8 H32 M26 2 L38 8 L26 14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={`th2-fee-pill th2-fee--${tier}`}>{feeLabel(fee)}</span>
        </div>

        <div className="th2-club-block th2-club-block--to">
          <div className="th2-club-info th2-club-info--right">
            {toClubInDb
              ? <Link to={`/clubes/${toClubInDb.id}`} onClick={(e) => e.stopPropagation()} className="th2-club-name">{transfer.toClubName}</Link>
              : <span className="th2-club-name">{transfer.toClubName}</span>
            }
            <LeagueBadge league={transfer.toLeague} />
          </div>
          <ClubCrest
            clubId={transfer.toClubId}
            clubName={transfer.toClubName}
            league={transfer.toLeague}
            size={40}
          />
        </div>
      </div>

      {/* Jugador */}
      <div className="th2-card-player">
        <div className="th2-player-main">
          <Flag code={transfer.nationalityCode} name={transfer.nationality} />
          {playerInDb
            ? <Link to={`/jugadores/${playerInDb.slug}`} onClick={(e) => e.stopPropagation()} className="th2-player-name">{transfer.playerName}</Link>
            : <span className="th2-player-name">{transfer.playerName}</span>
          }
          <PosBadge posGroup={transfer.posGroup} />
        </div>
        <div className="th2-player-meta">
          <span className="th2-meta-chip">⚽ {transfer.age} años</span>
          {mv && <span className="th2-meta-chip">📊 {mv} M€</span>}
          {transfer.contractYears && <span className="th2-meta-chip">📝 {transfer.contractYears} años</span>}
          <span className="th2-meta-chip th2-date-chip">
            {transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>
      </div>

      {/* Expand indicator */}
      <div className="th2-expand-hint">
        <span>{expanded ? 'Cerrar' : 'Ver detalles'}</span>
        <svg viewBox="0 0 12 12" className={`th2-chevron ${expanded ? 'th2-chevron--up' : ''}`}>
          <path d="M2 4 L6 8 L10 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Panel expandido */}
      {expanded && (
        <div className="th2-card-detail" onClick={(e) => e.stopPropagation()}>
          <div className="th2-detail-divider" />

          {/* Métricas */}
          <div className="th2-detail-metrics">
            <div className="th2-detail-metric">
              <span className="th2-dm-label">Cuota pagada</span>
              <span className={`th2-dm-val th2-fee--${tier}`}>{feeLabel(fee)}</span>
            </div>
            {mv && (
              <div className="th2-detail-metric">
                <span className="th2-dm-label">Valor mercado</span>
                <span className="th2-dm-val">{mv} M€</span>
              </div>
            )}
            {surplus !== null && fee > 0 && (
              <div className="th2-detail-metric">
                <span className="th2-dm-label">Diferencia VM</span>
                <span className={`th2-dm-val ${Number(surplus) > 0 ? 'th2-surplus--over' : 'th2-surplus--under'}`}>
                  {Number(surplus) > 0 ? '+' : ''}{surplus}%
                </span>
              </div>
            )}
            {transfer.contractYears && (
              <div className="th2-detail-metric">
                <span className="th2-dm-label">Contrato</span>
                <span className="th2-dm-val">{transfer.contractYears} temporadas</span>
              </div>
            )}
            {transfer.age && (
              <div className="th2-detail-metric">
                <span className="th2-dm-label">Edad al fichar</span>
                <span className="th2-dm-val">{transfer.age} años</span>
              </div>
            )}
            <div className="th2-detail-metric">
              <span className="th2-dm-label">Temporada</span>
              <span className="th2-dm-val">{transfer.season}</span>
            </div>
          </div>

          {/* Barra VM vs Fee */}
          {mv && fee > 0 && (
            <div className="th2-ratio-bar-wrap">
              <span className="th2-ratio-label">VM {mv}M€</span>
              <div className="th2-ratio-bar">
                <div
                  className={`th2-ratio-fill th2-fee--${tier}`}
                  style={{ width: `${Math.min((fee / Math.max(fee, mv)) * 100, 100)}%` }}
                />
                <div
                  className="th2-ratio-mv"
                  style={{ left: `${Math.min((mv / Math.max(fee, mv)) * 100, 100)}%` }}
                  title={`Valor de mercado: ${mv}M€`}
                />
              </div>
              <span className="th2-ratio-label">Fee {feeLabel(fee)}</span>
            </div>
          )}

          {/* Contexto narrativo */}
          {transfer.notes && (
            <blockquote className="th2-notes">
              <span className="th2-notes-icon">💬</span>
              {transfer.notes}
            </blockquote>
          )}

          {/* Fuentes */}
          {transfer.sources?.length > 0 && (
            <div className="th2-sources">
              <span className="th2-sources-label">Fuentes:</span>
              {transfer.sources.map((s) => (
                <span key={s} className="th2-source-chip">{s}</span>
              ))}
            </div>
          )}

          {/* Enlace al jugador si existe */}
          {playerInDb && (
            <Link
              to={`/jugadores/${playerInDb.slug}`}
              className="th2-detail-link"
              onClick={(e) => e.stopPropagation()}
            >
              Ver ficha de {transfer.playerName} →
            </Link>
          )}
        </div>
      )}
    </article>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function TransferHistory() {
  const [season, setSeason]       = useState('2026/27')
  const [league, setLeague]       = useState('Todas')
  const [posGroup, setPosGroup]   = useState('Todas')
  const [feeRange, setFeeRange]   = useState('all')
  const [sortBy, setSortBy]       = useState('fee-desc')
  const [search, setSearch]       = useState('')

  const players = getAllPlayers()
  const clubs   = getAllClubs()

  const seasonData = useMemo(() => {
    if (season === '2026/27') return buildLiveSeason()
    return historicalData.filter((t) => t.season === season)
  }, [season])

  const filtered = useMemo(() => {
    let ts = [...seasonData]

    if (league !== 'Todas') {
      ts = ts.filter((t) => t.toLeague === league || t.fromLeague === league)
    }
    if (posGroup !== 'Todas') {
      ts = ts.filter((t) => t.posGroup === posGroup)
    }
    if (feeRange !== 'all') {
      const range = FEE_RANGES.find((r) => r.id === feeRange)
      if (range) {
        ts = ts.filter((t) => {
          const fee = t.transferFee ?? 0
          return fee >= range.min && fee < range.max
        })
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      ts = ts.filter(
        (t) =>
          t.playerName?.toLowerCase().includes(q) ||
          t.fromClubName?.toLowerCase().includes(q) ||
          t.toClubName?.toLowerCase().includes(q)
      )
    }

    if (sortBy === 'fee-desc') ts.sort((a, b) => (b.transferFee ?? 0) - (a.transferFee ?? 0))
    else if (sortBy === 'fee-asc') ts.sort((a, b) => (a.transferFee ?? 0) - (b.transferFee ?? 0))
    else if (sortBy === 'date-desc') ts.sort((a, b) => new Date(b.transferDate) - new Date(a.transferDate))

    return ts
  }, [seasonData, league, posGroup, feeRange, sortBy, search])

  // Stats de la temporada seleccionada
  const totalFee    = seasonData.reduce((s, t) => s + (t.transferFee ?? 0), 0)
  const biggestFee  = seasonData.reduce((m, t) => Math.max(m, t.transferFee ?? 0), 0)
  const biggestDeal = seasonData.find((t) => t.transferFee === biggestFee)
  const eliteCount  = seasonData.filter((t) => (t.transferFee ?? 0) >= 100).length

  useEffect(() => {
    document.title = `Historial de Fichajes · Mercado Fútbol Pro`
    return () => { document.title = 'Mercado Fútbol Pro' }
  }, [])

  const resetFilters = () => {
    setLeague('Todas')
    setPosGroup('Todas')
    setFeeRange('all')
    setSearch('')
  }

  const hasActiveFilters = league !== 'Todas' || posGroup !== 'Todas' || feeRange !== 'all' || search.trim()

  return (
    <div className="th2-root">
      {/* ── HERO ── */}
      <div className="th2-hero">
        <div className="th2-hero-bg" />
        <div className="th2-hero-content container">
          <div className="th2-eyebrow">Top 5 Ligas · Archivo histórico</div>
          <h1 className="th2-hero-title">
            Grandes <span className="th2-hero-accent">Fichajes</span>
          </h1>
          <p className="th2-hero-sub">
            Las operaciones que sacudieron el mercado. Premier League, LaLiga, Bundesliga, Serie A y Ligue 1.
          </p>
        </div>
      </div>

      <div className="container th2-body">

        {/* ── SELECTOR DE TEMPORADA ── */}
        <div className="th2-season-bar">
          <span className="th2-season-label">Temporada</span>
          <div className="th2-season-tabs">
            {SEASONS.map((s) => (
              <button
                key={s.id}
                className={`th2-season-tab ${season === s.id ? 'th2-season-tab--active' : ''}`}
                onClick={() => { setSeason(s.id); resetFilters() }}
                title={s.full}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── STATS DE LA TEMPORADA ── */}
        <div className="th2-stats-row">
          <StatBox value={seasonData.length}       label="Fichajes registrados"  delay={0}   />
          <StatBox value={Math.round(totalFee)}    suffix=" M€" label="Total invertido"   delay={80}  />
          <StatBox value={biggestFee}              suffix=" M€" label="Mayor operación"   delay={160} />
          <StatBox value={eliteCount}              label="Operaciones +100M€"  delay={240} />
          {biggestDeal && (
            <div className="th2-stat th2-stat--deal">
              <span className="th2-stat-val th2-stat-val--name">{biggestDeal.playerName}</span>
              <span className="th2-stat-label">El grande de la temporada</span>
            </div>
          )}
        </div>

        {/* ── FILTROS ── */}
        <div className="th2-filters-panel">
          {/* Búsqueda */}
          <div className="th2-search-wrap">
            <svg className="th2-search-icon" viewBox="0 0 20 20"><circle cx="8" cy="8" r="5"/><path d="M13 13 L18 18"/></svg>
            <input
              className="th2-search"
              type="text"
              placeholder="Buscar jugador o club…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Liga */}
          <div className="th2-filter-group">
            <span className="th2-filter-label">Liga destino</span>
            <div className="th2-chips">
              {LEAGUES.map((l) => (
                <button
                  key={l}
                  className={`th2-chip ${league === l ? 'th2-chip--active' : ''}`}
                  onClick={() => setLeague(l)}
                >
                  {l !== 'Todas' && LEAGUE_META[l] && (
                    <img
                      src={flagUrl(LEAGUE_META[l].flag)}
                      alt=""
                      className="th2-chip-flag"
                      loading="lazy"
                    />
                  )}
                  {l === 'Todas' ? 'Todas las ligas' : LEAGUE_META[l]?.short ?? l}
                </button>
              ))}
            </div>
          </div>

          {/* Posición */}
          <div className="th2-filter-group">
            <span className="th2-filter-label">Posición</span>
            <div className="th2-chips">
              {POS_GROUPS.map((p) => (
                <button
                  key={p.id}
                  className={`th2-chip ${posGroup === p.id ? 'th2-chip--active' : ''}`}
                  onClick={() => setPosGroup(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cuantía */}
          <div className="th2-filter-group">
            <span className="th2-filter-label">Cuantía</span>
            <div className="th2-chips">
              {FEE_RANGES.map((r) => (
                <button
                  key={r.id}
                  className={`th2-chip ${feeRange === r.id ? 'th2-chip--active' : ''}`}
                  onClick={() => setFeeRange(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ordenar + reset */}
          <div className="th2-filter-row-bottom">
            <div className="th2-sort-wrap">
              <span className="th2-filter-label">Ordenar</span>
              <select
                className="th2-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button className="th2-reset-btn" onClick={resetFilters}>
                ✕ Limpiar filtros
              </button>
            )}

            <div className="th2-results-count">
              <strong>{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* ── GRID DE TARJETAS ── */}
        {filtered.length === 0 ? (
          <div className="th2-empty">
            <span className="th2-empty-icon">🔍</span>
            <p>No hay fichajes para este filtro</p>
            <button className="th2-reset-btn" onClick={resetFilters}>Limpiar filtros</button>
          </div>
        ) : (
          <div className="th2-grid">
            {filtered.map((t, i) => (
              <TransferCard
                key={t.id}
                transfer={t}
                players={players}
                clubs={clubs}
                rank={sortBy === 'fee-desc' ? i + 1 : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
