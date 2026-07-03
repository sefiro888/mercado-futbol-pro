import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { formatMoney } from '@/lib/format.js'
import './TopTransfers.css'

const fee = (v) => (v === 0 ? 'Libre' : formatMoney(v))

function RankList({ title, icon, iconClass, items, prep }) {
  if (!items.length) return <p className="muted">Sin datos disponibles.</p>
  return (
    <div className="tt-col">
      <h3 className="tt-title">
        <span className={`tt-ico ${iconClass}`}><Icon name={icon} size={17} /></span>
        {title}
      </h3>
      <ol className="tt-list">
        {items.map((it, i) => (
          <li key={`${it.name}-${it.year}`}>
            <span className={`tt-rank ${i < 3 ? 'top3' : ''}`}>{i + 1}</span>
            <span className="tt-main">
              <span className="tt-name">
                {it.slug ? <Link to={`/jugadores/${it.slug}`}>{it.name}</Link> : it.name}
              </span>
              <span className="tt-meta">{prep} {it.club} · {it.year}</span>
            </span>
            <span className="tt-fee num">{fee(it.fee)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function TopTransfers({ signings, sales }) {
  if (!signings.length && !sales.length) {
    return <p className="muted">Sin datos de traspasos históricos para este club.</p>
  }
  return (
    <div className="tt-grid">
      <RankList title="Top fichajes" icon="arrow-in" iconClass="hl-in" items={signings} prep="de" />
      <RankList title="Top ventas" icon="arrow-out" iconClass="hl-out" items={sales} prep="a" />
    </div>
  )
}
