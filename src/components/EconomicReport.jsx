import { useState } from 'react'
import { Link } from 'react-router-dom'
import Crest from './Crest.jsx'
import { getPlayerById, getClubById } from '@/lib/data.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { formatMoney } from '@/lib/format.js'
import './EconomicReport.css'

// ── Utilidades ──────────────────────────────────────────────────────────────
function pct(diff, fee) {
  if (!fee || fee === 0) return null
  return Math.round((diff / fee) * 100)
}

function ClubLogo({ id, name, color, size = 28 }) {
  return (
    <Crest
      name={name}
      color={color}
      logoUrl={clubLogoUrl(id)}
      size={size}
    />
  )
}

function PlayerAvatar({ playerId, name }) {
  const url = playerPhotoUrl({ id: playerId, slug: playerId })
  const initials = (name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="er-avatar">
      <img
        src={url}
        alt={name}
        className="er-avatar-img"
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
      />
      <div className="er-avatar-fallback" style={{ display: 'none' }}>{initials}</div>
    </div>
  )
}

// ── Deal card (compras / gangas) ─────────────────────────────────────────────
function DealCard({ item, rank, mode }) {
  const { transfer, diff } = item
  const player = getPlayerById(transfer.playerId)
  const from = getClubById(transfer.fromClubId)
  const to = getClubById(transfer.toClubId)
  const percent = pct(diff, transfer.transferFee)
  const isBad = mode === 'bad'

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className={`er-deal-card ${isBad ? 'er-deal--bad' : 'er-deal--good'}`}>
      {/* Rank badge */}
      <div className="er-deal-rank">
        {rank < 3 ? medals[rank] : <span className="er-deal-rank-num">{rank + 1}</span>}
      </div>

      {/* Player photo */}
      <PlayerAvatar playerId={transfer.playerId} name={player?.name || transfer.playerName} />

      {/* Info */}
      <div className="er-deal-info">
        <div className="er-deal-name">
          {player
            ? <Link to={`/jugadores/${player.slug}`}>{player.name}</Link>
            : (transfer.playerName || transfer.playerId)}
        </div>
        <div className="er-deal-clubs">
          <ClubLogo id={from?.id} name={from?.name || transfer.fromClubName} color={from?.primaryColor} size={18} />
          <span className="er-deal-clubs-name">{from?.name || transfer.fromClubName || 'Agente libre'}</span>
          <span className="er-deal-arrow">→</span>
          <ClubLogo id={to?.id} name={to?.name || transfer.toClubName} color={to?.primaryColor} size={18} />
          <span className="er-deal-clubs-name">{to?.name || transfer.toClubName}</span>
        </div>
        {/* Fee bar */}
        <div className="er-deal-bar-wrap">
          <div className="er-deal-bar-labels">
            <span>Pagado: <strong>{formatMoney(transfer.transferFee)}</strong></span>
            <span>VM: <strong>{formatMoney(transfer.marketValueAtTransfer)}</strong></span>
          </div>
          <div className="er-deal-bar-track">
            <div
              className="er-deal-bar-fill"
              style={{ width: `${Math.min(100, (transfer.transferFee / (transfer.marketValueAtTransfer || transfer.transferFee)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Diff */}
      <div className={`er-deal-diff ${isBad ? 'bad' : 'good'}`}>
        <span className="er-deal-diff-val">
          {isBad ? '+' : '−'}{formatMoney(diff)}
        </span>
        {percent !== null && (
          <span className="er-deal-diff-pct">
            {isBad ? '+' : '−'}{Math.abs(percent)}%
          </span>
        )}
      </div>
    </div>
  )
}

// ── Dependency card ──────────────────────────────────────────────────────────
function DepCard({ row, rank }) {
  const ratio = Math.round(row.dependencyRatio * 100)
  const medals = ['🥇', '🥈', '🥉']
  const color = ratio > 60 ? '#f87171' : ratio > 40 ? '#fbbf24' : '#22c55e'

  return (
    <div className="er-dep-card">
      <div className="er-dep-rank">
        {rank < 3 ? medals[rank] : <span className="er-dep-rank-num">{rank + 1}</span>}
      </div>
      <ClubLogo id={row.club.id} name={row.club.name} color={row.club.primaryColor} size={36} />
      <div className="er-dep-info">
        <div className="er-dep-name">
          <Link to={`/clubes/${row.club.slug}`}>{row.club.name}</Link>
        </div>
        <div className="er-dep-sub">
          Vendió por <strong>{formatMoney(row.income)}</strong> · Plantilla vale <strong>{formatMoney(row.club.squadValue)}</strong>
        </div>
        <div className="er-dep-bar-track">
          <div className="er-dep-bar-fill" style={{ width: `${Math.min(ratio, 100)}%`, background: color }} />
        </div>
      </div>
      <div className="er-dep-pct" style={{ color }}>
        {ratio}%
        <span className="er-dep-pct-label">dependencia</span>
      </div>
    </div>
  )
}

// ── Insight banner ───────────────────────────────────────────────────────────
function InsightBanner({ overpaid, bargains }) {
  const worstDeal = overpaid[0]
  const bestDeal = bargains[0]
  if (!worstDeal && !bestDeal) return null

  const worstPlayer = worstDeal ? (getPlayerById(worstDeal.transfer.playerId)?.name || worstDeal.transfer.playerId) : null
  const bestPlayer = bestDeal ? (getPlayerById(bestDeal.transfer.playerId)?.name || bestDeal.transfer.playerId) : null
  const worstClub = worstDeal ? (getClubById(worstDeal.transfer.toClubId)?.name || worstDeal.transfer.toClubId) : null
  const bestClub = bestDeal ? (getClubById(bestDeal.transfer.toClubId)?.name || bestDeal.transfer.toClubId) : null

  return (
    <div className="er-insights">
      {worstDeal && (
        <div className="er-insight er-insight--bad">
          <span className="er-insight-emoji">🤯</span>
          <div>
            <div className="er-insight-label">Peor negocio del mercado</div>
            <div className="er-insight-text">
              {worstClub} pagó <strong>+{formatMoney(worstDeal.diff)}</strong> de más por {worstPlayer}.
              Un sobrepago de <strong>{pct(worstDeal.diff, worstDeal.transfer.transferFee)}%</strong> sobre su valor real.
            </div>
          </div>
        </div>
      )}
      {bestDeal && (
        <div className="er-insight er-insight--good">
          <span className="er-insight-emoji">💎</span>
          <div>
            <div className="er-insight-label">Mejor ganga del mercado</div>
            <div className="er-insight-text">
              {bestClub} fichó a {bestPlayer} con un descuento de <strong>{formatMoney(bestDeal.diff)}</strong>.
              El robo del verano.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function EconomicReport({ overpaid, bargains, dependency }) {
  const [activeTab, setActiveTab] = useState('sobrepago')

  const tabs = [
    { id: 'sobrepago', label: '🔥 Sobrepagos', count: overpaid.length },
    { id: 'gangas', label: '💎 Gangas', count: bargains.length },
    { id: 'dependencia', label: '📉 Dependencia', count: dependency.length },
  ]

  return (
    <div className="er-wrap">
      {/* Header */}
      <div className="er-header">
        <div className="er-header-left">
          <div className="er-header-badge">📊 ANÁLISIS ECONÓMICO</div>
          <h2 className="er-header-title">Informe de Gestión</h2>
          <p className="er-header-desc">
            Comparamos lo pagado con el valor real de cada jugador en el momento del traspaso.
            ¿Quién hizo el negocio del siglo? ¿Quién tiró el dinero?
          </p>
        </div>
      </div>

      {/* Insight banners */}
      <InsightBanner overpaid={overpaid} bargains={bargains} />

      {/* Tabs */}
      <div className="er-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`er-tab ${activeTab === t.id ? 'er-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            <span className="er-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="er-content">
        {activeTab === 'sobrepago' && (
          <div>
            <div className="er-section-hint">
              Operaciones donde el club pagó <strong>más</strong> que el valor de mercado del jugador.
            </div>
            <div className="er-deal-list">
              {overpaid.map((item, i) => (
                <DealCard key={item.transfer.id} item={item} rank={i} mode="bad" />
              ))}
              {overpaid.length === 0 && <p className="er-empty">Sin datos suficientes.</p>}
            </div>
          </div>
        )}

        {activeTab === 'gangas' && (
          <div>
            <div className="er-section-hint">
              Operaciones donde el club fichó <strong>por debajo</strong> del valor de mercado real del jugador.
            </div>
            <div className="er-deal-list">
              {bargains.map((item, i) => (
                <DealCard key={item.transfer.id} item={item} rank={i} mode="good" />
              ))}
              {bargains.length === 0 && <p className="er-empty">Sin datos suficientes.</p>}
            </div>
          </div>
        )}

        {activeTab === 'dependencia' && (
          <div>
            <div className="er-section-hint">
              Clubes cuya tesorería depende en mayor medida de los ingresos por ventas de jugadores.
            </div>
            <div className="er-dep-list">
              {dependency.map((row, i) => (
                <DepCard key={row.club.id} row={row} rank={i} />
              ))}
              {dependency.length === 0 && <p className="er-empty">Sin datos suficientes.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
