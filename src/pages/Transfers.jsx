import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TransferTable from '@/components/TransferTable.jsx'
import FilterPanel from '@/components/FilterPanel.jsx'
import Icon from '@/components/Icon.jsx'
import StatCard from '@/components/StatCard.jsx'
import Crest from '@/components/Crest.jsx'
import PremiumHeader from '@/components/PremiumHeader.jsx'
import EconomicReport from '@/components/EconomicReport.jsx'
import { setPageSeo } from '@/lib/seo.js'
import { TRANSFER_STATUS } from '@/lib/taxonomy.js'
import { formatDate, formatMoney } from '@/lib/format.js'
import { clubLogoUrl } from '@/lib/logos.js'
import {
  getAllTransfers,
  getAllClubs,
  getPlayerById,
  getClubById,
  getLeagues,
  getPositions,
  getNationalities,
  getMarketDashboard,
  getOverpaidSignings,
  getBargainSignings,
  getSellingDependencyClubs,
} from '@/lib/data.js'
import './Pages.css'

const EMPTY = {
  q: '',
  club: '',
  league: '',
  position: '',
  nationality: '',
  status: '',
  price: { min: '', max: '' },
}

function transferLabel(transfer) {
  if (!transfer) return 'Sin datos'
  return getPlayerById(transfer.playerId)?.name || transfer.playerId
}

function MarketSpotlight({ icon, title, value, hint, transfer, club, tone = 'brand' }) {
  const toClub = transfer ? getClubById(transfer.toClubId) : null
  const href = club ? `/clubes/${club.slug}` : transfer ? '/fichajes' : null
  const crestClub = club || toClub

  const content = (
    <>
      <div className="mk-icon"><Icon name={icon} size={22} /></div>
      <div className="mk-copy">
        <span className="mk-title">{title}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
      {crestClub && (
        <Crest
          name={crestClub.name}
          color={crestClub.primaryColor}
          logoUrl={clubLogoUrl(crestClub.id)}
          size={34}
        />
      )}
    </>
  )

  return href ? (
    <Link className={`market-spotlight card interactive tone-${tone}`} to={href}>
      {content}
    </Link>
  ) : (
    <div className={`market-spotlight card tone-${tone}`}>{content}</div>
  )
}

function BalanceList({ title, items, metric }) {
  return (
    <div className="card market-balance-card">
      <h3>{title}</h3>
      <div className="market-balance-list">
        {items.map(({ club, spent, income, balance, activity }) => {
          const value = metric === 'spent' ? spent : metric === 'income' ? income : balance
          const positive = value >= 0
          return (
            <Link key={club.id} to={`/clubes/${club.slug}`} className="market-balance-row">
              <Crest
                name={club.name}
                color={club.primaryColor}
                logoUrl={clubLogoUrl(club.id)}
                size={28}
              />
              <span className="mbr-main">
                <strong>{club.name}</strong>
                <small>{activity} movimiento{activity === 1 ? '' : 's'}</small>
              </span>
              <span className={`mbr-value ${metric === 'balance' && !positive ? 'is-negative' : ''}`}>
                {metric === 'balance' && positive ? '+' : ''}{formatMoney(value)}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function RecentDeals({ deals }) {
  return (
    <div className="card recent-deals-card">
      <div className="recent-deals-head">
        <h3>Últimos movimientos registrados</h3>
        <span>Actualizado a 27/06/2026</span>
      </div>
      <div className="recent-deals-list">
        {deals.map((deal) => {
          const player = getPlayerById(deal.playerId)
          const to = getClubById(deal.toClubId)
          const from = getClubById(deal.fromClubId)
          return (
            <Link key={deal.id} to={player ? `/jugadores/${player.slug}` : '/fichajes'} className="recent-deal">
              <span className="rd-date">{formatDate(deal.transferDate)}</span>
              <span className="rd-main">
                <strong>{player?.name || deal.playerId}</strong>
                <small>{from?.name || deal.fromClubName || 'Libre'} → {to?.name || deal.toClubId}</small>
              </span>
              <span className="rd-fee">{deal.transferFee === 0 ? 'Libre' : formatMoney(deal.transferFee)}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function Transfers() {
  const [filters, setFilters] = useState(EMPTY)

  useEffect(() => {
    setPageSeo({
      title: 'Tabla de fichajes y traspasos',
      description: 'Tabla avanzada de fichajes con precio, valor de mercado, diferencia, ganancia del club vendedor y análisis económico. Filtros y ordenación.',
    })
  }, [])

  const allTransfers = useMemo(() => getAllTransfers(), [])
  const dashboard = useMemo(() => getMarketDashboard(), [])
  const overpaid = useMemo(() => getOverpaidSignings(6), [])
  const bargains = useMemo(() => getBargainSignings(6), [])
  const dependency = useMemo(() => getSellingDependencyClubs(6), [])

  // Estadísticas globales del mercado de traspasos
  const stats = useMemo(() => {
    const totalSpent = allTransfers.reduce((sum, t) => sum + (t.transferFee || 0), 0)
    
    const recordTransfer = [...allTransfers].sort((a, b) => (b.transferFee || 0) - (a.transferFee || 0))[0]
    const recordPlayer = recordTransfer ? getPlayerById(recordTransfer.playerId) : null
    const recordText = recordTransfer && recordPlayer 
      ? `${recordPlayer.name} (${formatMoney(recordTransfer.transferFee)})` 
      : '—'

    const totalGain = allTransfers.reduce((sum, t) => {
      if (t.transferFee != null && t.previousPurchaseFee != null) {
        const gain = t.transferFee - t.previousPurchaseFee
        if (gain > 0) return sum + gain
      }
      return sum
    }, 0)

    return {
      totalSpent: formatMoney(totalSpent),
      recordSigning: recordText,
      totalGain: formatMoney(totalGain),
      totalCount: allTransfers.length,
      avgFee: formatMoney(dashboard.avgFee),
      freeDeals: dashboard.freeDeals,
    }
  }, [allTransfers, dashboard])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const min = filters.price.min === '' ? null : Number(filters.price.min)
    const max = filters.price.max === '' ? null : Number(filters.price.max)

    return allTransfers.filter((t) => {
      const player = getPlayerById(t.playerId)
      const from = getClubById(t.fromClubId)
      const to = getClubById(t.toClubId)

      if (filters.club && t.fromClubId !== filters.club && t.toClubId !== filters.club) return false
      if (filters.league && from?.league !== filters.league && to?.league !== filters.league) return false
      if (filters.position && player?.position !== filters.position) return false
      if (filters.nationality && player?.nationality !== filters.nationality) return false
      if (filters.status && t.status !== filters.status) return false
      if (q && !(player?.name || '').toLowerCase().includes(q)) return false
      if (min != null && t.transferFee < min) return false
      if (max != null && t.transferFee > max) return false
      return true
    })
  }, [allTransfers, filters])

  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const fields = [
    { type: 'text', name: 'q', label: 'Jugador', placeholder: 'Nombre del jugador…' },
    {
      type: 'select', name: 'club', label: 'Club',
      options: getAllClubs().map((c) => ({ value: c.id, label: c.name })),
    },
    { type: 'select', name: 'league', label: 'Liga', options: getLeagues().map((l) => ({ value: l, label: l })) },
    { type: 'select', name: 'position', label: 'Posición', options: getPositions().map((p) => ({ value: p, label: p })) },
    { type: 'select', name: 'nationality', label: 'Nacionalidad', options: getNationalities().map((n) => ({ value: n, label: n })) },
    {
      type: 'select', name: 'status', label: 'Estado',
      options: Object.entries(TRANSFER_STATUS).map(([value, v]) => ({ value, label: v.label })),
    },
    { type: 'range', name: 'price', label: 'Precio', unit: 'M€', min: 0, step: 1 },
  ]

  return (
    <>
      <PremiumHeader
        title="Fichajes y traspasos"
        description="Tabla avanzada con precio del traspaso, valor de mercado, diferencia y la ganancia o pérdida real del club vendedor. Filtra y ordena según te interese."
        banner="Fichajes reales del mercado 2026; los valores de mercado son estimaciones aproximadas."
        tag="MERCADO"
        icon="ball"
        theme="market"
      />

      <div className="container" style={{ marginTop: 24 }}>
        <div className="grid grid-4">
          <StatCard label="Volumen total" value={stats.totalSpent} hint="Gasto total en traspasos" icon="briefcase" accent="#22c55e" />
          <StatCard label="Fichaje récord" value={stats.recordSigning} hint="Operación más cara" icon="trophy" accent="#fbbf24" />
          <StatCard label="Precio medio" value={stats.avgFee} hint={`${stats.freeDeals} operaciones libres`} icon="handshake" accent="#38bdf8" />
          <StatCard label="Movimientos" value={`${stats.totalCount}`} hint="Operaciones registradas" icon="person" accent="#a78bfa" />
        </div>
      </div>

      <section className="container section market-command-center">
        <div className="market-spotlight-grid">
          <MarketSpotlight
            icon="trophy"
            title="Operación líder"
            value={transferLabel(dashboard.topSigning)}
            hint={dashboard.topSigning ? `${formatMoney(dashboard.topSigning.transferFee)} hacia ${getClubById(dashboard.topSigning.toClubId)?.name || dashboard.topSigning.toClubId}` : 'Sin fichajes'}
            transfer={dashboard.topSigning}
            tone="gold"
          />
          <MarketSpotlight
            icon="shield"
            title="Club más activo"
            value={dashboard.busiestClub?.club.name || 'Sin datos'}
            hint={dashboard.busiestClub ? `${dashboard.busiestClub.activity} movimientos, balance ${formatMoney(dashboard.busiestClub.balance)}` : 'Sin actividad'}
            club={dashboard.busiestClub?.club}
          />
          <MarketSpotlight
            icon="arrow-out"
            title="Mejor plusvalía"
            value={dashboard.topProfit ? transferLabel(dashboard.topProfit.transfer) : 'Sin datos'}
            hint={dashboard.topProfit ? `+${formatMoney(dashboard.topProfit.profit)} para el vendedor` : 'Faltan compras previas'}
            transfer={dashboard.topProfit?.transfer}
            tone="info"
          />
        </div>

        <div className="market-command-grid">
          <BalanceList title="Más inversión" items={dashboard.topSpenders} metric="spent" />
          <BalanceList title="Más ingresos" items={dashboard.topSellers} metric="income" />
          <BalanceList title="Mejor balance neto" items={dashboard.bestBalances} metric="balance" />
          <RecentDeals deals={dashboard.latest} />
        </div>
      </section>

      <section className="container section">
        <EconomicReport overpaid={overpaid} bargains={bargains} dependency={dependency} />
      </section>

      <div className="container section">
        <div className="list-layout">
          <FilterPanel
            fields={fields}
            values={filters}
            onChange={set}
            onReset={() => setFilters(EMPTY)}
            resultCount={filtered.length}
          />
          <TransferTable transfers={filtered} />
        </div>
      </div>
    </>
  )
}
