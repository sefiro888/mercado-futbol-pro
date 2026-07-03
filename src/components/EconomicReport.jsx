import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Crest from './Crest.jsx'
import { getPlayerById, getClubById } from '@/lib/data.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { formatMoney } from '@/lib/format.js'
import './EconomicReport.css'

// Ranking simple de operaciones (compras ruinosas / gangas) reutilizando el
// estilo visual de TopTransfers (tt-*) para mantener coherencia.
function DealRankList({ rows, tone }) {
  return (
    <ul className="tt-list">
      {rows.map(({ transfer, diff }, i) => {
        const player = getPlayerById(transfer.playerId)
        const from = getClubById(transfer.fromClubId)
        const to = getClubById(transfer.toClubId)
        return (
          <li key={transfer.id}>
            <span className={`tt-rank ${i < 3 ? 'top3' : ''}`}>{i + 1}</span>
            <span className="tt-main">
              <span className="tt-name">
                {player ? <Link to={`/jugadores/${player.slug}`}>{player.name}</Link> : transfer.playerId}
              </span>
              <span className="tt-meta">
                {(from?.name || transfer.fromClubName || 'Agente libre')} → {(to?.name || transfer.toClubName)}
              </span>
            </span>
            <span className={`tt-fee er-diff ${tone}`}>
              {tone === 'bad' ? '+' : '−'}{formatMoney(diff)}
            </span>
          </li>
        )
      })}
      {rows.length === 0 && <li className="er-empty">Sin datos suficientes todavía.</li>}
    </ul>
  )
}

function DependencyList({ rows }) {
  return (
    <ul className="tt-list">
      {rows.map((row, i) => (
        <li key={row.club.id}>
          <span className={`tt-rank ${i < 3 ? 'top3' : ''}`}>{i + 1}</span>
          <Crest name={row.club.name} color={row.club.primaryColor} logoUrl={clubLogoUrl(row.club.id)} size={26} />
          <span className="tt-main">
            <span className="tt-name"><Link to={`/clubes/${row.club.slug}`}>{row.club.name}</Link></span>
            <span className="tt-meta">Ingresó {formatMoney(row.income)} vendiendo, plantilla vale {formatMoney(row.club.squadValue)}</span>
          </span>
          <span className="tt-fee er-ratio">{Math.round(row.dependencyRatio * 100)}%</span>
        </li>
      ))}
      {rows.length === 0 && <li className="er-empty">Sin datos suficientes todavía.</li>}
    </ul>
  )
}

// Informe de gestión económica del mercado: quién paga de más, quién hace
// gangas y qué clubes dependen de vender jugadores para cuadrar sus cuentas.
// Es el ángulo diferencial de la web frente a portales de solo noticias.
export default function EconomicReport({ overpaid, bargains, dependency }) {
  return (
    <div className="card economic-report">
      <div className="er-head">
        <h2><Icon name="money" size={20} /> Informe de gestión económica</h2>
        <p className="muted">
          Comparamos lo pagado en cada traspaso con el valor de mercado estimado en ese momento.
          No es una crítica a los clubes: es lectura de negocio, no de fútbol.
        </p>
      </div>

      <div className="er-grid-3">
        <div className="tt-col">
          <h3 className="tt-title"><Icon className="tt-ico hl-out" name="arrow-out" size={18} /> Compras por encima de mercado</h3>
          <DealRankList rows={overpaid} tone="bad" />
        </div>
        <div className="tt-col">
          <h3 className="tt-title"><Icon className="tt-ico hl-in" name="arrow-in" size={18} /> Mejores gangas del mercado</h3>
          <DealRankList rows={bargains} tone="good" />
        </div>
        <div className="tt-col">
          <h3 className="tt-title"><Icon name="shield" size={18} /> Clubes que viven de vender</h3>
          <DependencyList rows={dependency} />
        </div>
      </div>
    </div>
  )
}
