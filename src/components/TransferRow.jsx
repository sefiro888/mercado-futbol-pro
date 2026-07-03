import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import SourceBadge from './SourceBadge.jsx'
import Flag from './Flag.jsx'
import Crest from './Crest.jsx'
import { clubLogoUrl } from '@/lib/logos.js'
import { TRANSFER_STATUS } from '@/lib/taxonomy.js'
import { formatMoney, formatDate, formatPercent } from '@/lib/format.js'

// Celda con valor numérico coloreado según signo (+ verde / - rojo).
function SignedMoney({ amount }) {
  if (amount == null) return <span className="dim">No disponible</span>
  const cls = amount > 0 ? 'pos' : amount < 0 ? 'neg' : ''
  const sign = amount > 0 ? '+' : ''
  return <span className={`num ${cls}`}>{sign}{formatMoney(amount)}</span>
}

// Fila de la tabla de fichajes. Cada <td> lleva data-label para el modo tarjeta
// en móvil (definido en TransferTable.css).
export default function TransferRow({ row }) {
  const { player, fromClub, toClub } = row

  return (
    <tr>
      <td data-label="Jugador">
        {player ? (
          <Link to={`/jugadores/${player.slug}`} className="cell-link">
            {player.name}
          </Link>
        ) : (
          row.playerId
        )}
      </td>
      <td data-label="Edad" className="num">{player?.age ?? '—'}</td>
      <td data-label="Posición">{player?.position ?? '—'}</td>
      <td data-label="Nacionalidad">{player ? <Flag country={player.nationality} withName /> : '—'}</td>

      <td data-label="Vende">
        {fromClub ? (
          <Link to={`/clubes/${fromClub.slug}`} className="cell-link cell-club">
            <Crest name={fromClub.name} color={fromClub.primaryColor} size={20} logoUrl={clubLogoUrl(fromClub.id)} />
            {fromClub.name}
          </Link>
        ) : (
          row.fromClubName || '—'
        )}
      </td>
      <td data-label="Compra">
        {toClub ? (
          <Link to={`/clubes/${toClub.slug}`} className="cell-link cell-club">
            <Crest name={toClub.name} color={toClub.primaryColor} size={20} logoUrl={clubLogoUrl(toClub.id)} />
            {toClub.name}
          </Link>
        ) : (
          row.toClubName || '—'
        )}
      </td>

      <td data-label="Precio" className="num strong">{formatMoney(row.transferFee)}</td>
      <td data-label="Valor mercado" className="num">{formatMoney(row.marketValueAtTransfer)}</td>

      <td data-label="Dif. vs valor">
        <SignedMoney amount={row.diff} />
        {row.diffPct != null && (
          <span className="dim" style={{ marginLeft: 6 }}>({formatPercent(row.diffPct)})</span>
        )}
      </td>

      <td data-label="Compra anterior" className="num">
        {row.previousPurchaseFee != null ? formatMoney(row.previousPurchaseFee) : <span className="dim">No disp.</span>}
      </td>

      <td data-label="Ganancia vendedor"><SignedMoney amount={row.gain} /></td>

      <td data-label="Fecha" className="nowrap">{formatDate(row.transferDate)}</td>
      <td data-label="Estado"><StatusBadge map={TRANSFER_STATUS} value={row.status} /></td>

      <td data-label="Fuentes">
        <div className="row-wrap">
          {row.sourceObjects.length > 0
            ? row.sourceObjects.map((s) => <SourceBadge key={s.id} source={s} />)
            : <span className="dim">—</span>}
        </div>
      </td>
    </tr>
  )
}
