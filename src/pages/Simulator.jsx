import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PremiumHeader from '@/components/PremiumHeader.jsx'
import Crest from '@/components/Crest.jsx'
import Icon from '@/components/Icon.jsx'
import { setPageSeo } from '@/lib/seo.js'
import { getAllPlayers, getAllTransfers, getPlayerById, getClubById } from '@/lib/data.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { formatMoney } from '@/lib/format.js'
import './Tools.css'

// ---------------------------------------------------------------------------
// Estimación de traspaso: parte del valor de mercado y aplica factores
// clásicos del mercado (edad, contrato restante, rol). Es una ESTIMACIÓN
// orientativa, y así se comunica en la página.
// ---------------------------------------------------------------------------
function estimateFee(player) {
  const factors = []
  const value = player.marketValue || 0

  const age = player.age ?? 27
  let fAge = 1
  if (age <= 21) { fAge = 1.3; factors.push(['Prima de juventud (≤21)', fAge]) }
  else if (age <= 25) { fAge = 1.15; factors.push(['Edad en proyección (22-25)', fAge]) }
  else if (age <= 28) { fAge = 1; factors.push(['Plenitud (26-28)', fAge]) }
  else if (age <= 31) { fAge = 0.8; factors.push(['Veteranía (29-31)', fAge]) }
  else { fAge = 0.5; factors.push(['Última etapa (32+)', fAge]) }

  const years = player.contractUntil
    ? Math.max(0, new Date(player.contractUntil).getFullYear() - new Date().getFullYear())
    : 0
  let fContract = 1
  if (years >= 4) fContract = 1.2
  else if (years === 3) fContract = 1.1
  else if (years === 2) fContract = 0.9
  else if (years === 1) fContract = 0.65
  else fContract = 0.2
  factors.push([`Contrato: ${years} año${years === 1 ? '' : 's'} restante${years === 1 ? '' : 's'}`, fContract])

  const fStatus = player.status === 'titular' ? 1.1 : player.status === 'cantera' ? 1.05 : 1
  if (fStatus !== 1) factors.push([player.status === 'titular' ? 'Titular indiscutible' : 'Perla de cantera', fStatus])

  const fee = Math.round(value * fAge * fContract * fStatus)
  return { fee, factors, low: Math.round(fee * 0.88), high: Math.round(fee * 1.12) }
}

export default function Simulator() {
  const [name, setName] = useState('')

  useEffect(() => {
    setPageSeo({
      title: 'Simulador de fichajes',
      description: '¿Cuánto costaría fichar a cualquier jugador? Estimación según valor de mercado, edad y contrato.',
    })
  }, [])

  const all = useMemo(() => getAllPlayers(), [])
  const player = all.find((p) => p.name.toLowerCase() === name.trim().toLowerCase()) || null
  const club = player ? getClubById(player.currentClubId) : null
  const est = player ? estimateFee(player) : null

  // Traspasos reales con precio más parecido a la estimación, como referencia.
  const comparables = useMemo(() => {
    if (!est) return []
    return getAllTransfers()
      .filter((t) => t.transferFee > 0)
      .map((t) => ({ t, diff: Math.abs(t.transferFee - est.fee) }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 3)
  }, [est?.fee])

  return (
    <>
      <PremiumHeader
        title="Simulador de fichajes"
        description="Elige un jugador y calculamos cuánto costaría su traspaso hoy, a partir de su valor de mercado, edad, contrato y rol. Estimación orientativa, no cifra oficial."
        tag="HERRAMIENTA"
        icon="money"
        theme="market"
      />

      <div className="container section tools-page">
        <datalist id="sim-players">
          {all.map((p) => <option key={p.id} value={p.name} />)}
        </datalist>
        <input
          className="input cmp-input sim-input"
          list="sim-players"
          placeholder="Escribe un jugador… (p. ej. Lamine Yamal)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {!player ? (
          <div className="empty-state">
            <Icon name="money" size={28} /> Elige un jugador para simular su fichaje.
          </div>
        ) : (
          <div className="sim-result">
            <div className="card sim-main" style={{ '--club-c': club?.primaryColor }}>
              <div className="sim-player">
                {playerPhotoUrl(player)
                  ? <img className="cmp-photo" src={playerPhotoUrl(player)} alt={player.name} />
                  : <Crest name={player.name} variant="avatar" size={64} color={club?.primaryColor} />}
                <div>
                  <Link to={`/jugadores/${player.slug}`}><strong>{player.name}</strong></Link>
                  <div className="dim">
                    {club ? (
                      <span className="cmp-club">
                        <Crest name={club.name} size={15} color={club.primaryColor} logoUrl={clubLogoUrl(club.id)} /> {club.name}
                      </span>
                    ) : 'Agente libre'} · {player.age} años
                  </div>
                </div>
              </div>

              <div className="sim-fee">
                <span className="sim-fee-label">Coste estimado del traspaso</span>
                <span className="sim-fee-value num">{formatMoney(est.fee)}</span>
                <span className="sim-fee-range dim">Horquilla: {formatMoney(est.low)} – {formatMoney(est.high)}</span>
              </div>

              <ul className="sim-factors">
                <li>
                  <span>Valor de mercado (base)</span>
                  <strong className="num">{formatMoney(player.marketValue)}</strong>
                </li>
                {est.factors.map(([label, f]) => (
                  <li key={label}>
                    <span>{label}</span>
                    <strong className={`num ${f > 1 ? 'up' : f < 1 ? 'down' : ''}`}>×{f}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card sim-comps">
              <h3><Icon name="handshake" size={17} /> Traspasos reales por un precio parecido</h3>
              <ul className="sim-comp-list">
                {comparables.map(({ t }) => {
                  const p = getPlayerById(t.playerId)
                  const to = getClubById(t.toClubId)
                  return (
                    <li key={t.id}>
                      <span className="scl-main">
                        <strong>{p?.name || t.playerId}</strong>
                        <small className="dim">→ {to?.name || t.toClubName} ({new Date(t.transferDate).getFullYear()})</small>
                      </span>
                      <span className="num scl-fee">{formatMoney(t.transferFee)}</span>
                    </li>
                  )
                })}
              </ul>
              <p className="dim sim-note">
                Método: valor de mercado × factor de edad × contrato restante × rol en el equipo.
                Los precios reales dependen de cláusulas, subastas y urgencias — esto es un juego informado.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
