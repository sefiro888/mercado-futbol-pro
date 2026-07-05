import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PremiumHeader from '@/components/PremiumHeader.jsx'
import Crest from '@/components/Crest.jsx'
import Flag from '@/components/Flag.jsx'
import Icon from '@/components/Icon.jsx'
import { setPageSeo } from '@/lib/seo.js'
import { getAllPlayers, getClubById } from '@/lib/data.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { formatMoney, formatHeight } from '@/lib/format.js'
import './Tools.css'

const SLOTS = [0, 1, 2]

// Fila de la tabla comparativa; resalta el mejor valor cuando tiene sentido.
function Row({ label, players, render, best }) {
  const values = players.map((p) => (p ? best?.(p) : null))
  const max = best ? Math.max(...values.filter((v) => v != null)) : null
  return (
    <tr>
      <th scope="row">{label}</th>
      {players.map((p, i) => (
        <td key={i} className={best && p && values[i] === max && max > 0 ? 'is-best' : ''}>
          {p ? render(p) : '—'}
        </td>
      ))}
    </tr>
  )
}

export default function Compare() {
  const [names, setNames] = useState(['', '', ''])

  useEffect(() => {
    setPageSeo({
      title: 'Comparador de jugadores',
      description: 'Compara hasta 3 jugadores lado a lado: valor de mercado, edad, contrato, físico y club.',
    })
  }, [])

  const all = useMemo(() => getAllPlayers(), [])
  const byName = useMemo(() => new Map(all.map((p) => [p.name.toLowerCase(), p])), [all])
  const players = names.map((n) => byName.get(n.trim().toLowerCase()) || null)
  const chosen = players.filter(Boolean)
  const maxValue = Math.max(1, ...chosen.map((p) => p.marketValue || 0))

  const set = (i, v) => setNames((ns) => ns.map((n, j) => (j === i ? v : n)))

  return (
    <>
      <PremiumHeader
        title="Comparador de jugadores"
        description="Elige hasta 3 jugadores de la base de datos y compáralos lado a lado. El mejor dato de cada fila se ilumina."
        tag="HERRAMIENTA"
        icon="sliders"
        theme="market"
      />

      <div className="container section tools-page">
        <datalist id="all-players">
          {all.map((p) => <option key={p.id} value={p.name} />)}
        </datalist>

        <div className="cmp-pickers">
          {SLOTS.map((i) => (
            <input
              key={i}
              className="input cmp-input"
              list="all-players"
              placeholder={i === 2 ? 'Jugador 3 (opcional)…' : `Jugador ${i + 1}…`}
              value={names[i]}
              onChange={(e) => set(i, e.target.value)}
            />
          ))}
        </div>

        {chosen.length < 2 ? (
          <div className="empty-state">
            <Icon name="sliders" size={28} /> Escribe al menos dos nombres (con autocompletado) para comparar.
          </div>
        ) : (
          <div className="card cmp-card">
            <div className="cmp-heads">
              <span />
              {players.map((p, i) => {
                if (!p) return <span key={i} />
                const club = getClubById(p.currentClubId)
                const photo = playerPhotoUrl(p)
                return (
                  <Link key={i} to={`/jugadores/${p.slug}`} className="cmp-head" style={{ '--club-c': club?.primaryColor }}>
                    {photo
                      ? <img className="cmp-photo" src={photo} alt={p.name} loading="lazy" />
                      : <Crest name={p.name} variant="avatar" size={64} color={club?.primaryColor} />}
                    <strong>{p.name}</strong>
                    <span className="cmp-club">
                      {club && <Crest name={club.name} size={16} color={club.primaryColor} logoUrl={clubLogoUrl(club.id)} />}
                      {club?.name || 'Agente libre'}
                    </span>
                  </Link>
                )
              })}
            </div>

            <table className="cmp-table">
              <tbody>
                <Row label="Valor de mercado" players={players} best={(p) => p.marketValue || 0}
                  render={(p) => (
                    <>
                      <span className="num cmp-value">{formatMoney(p.marketValue)}</span>
                      <span className="cmp-bar"><span style={{ width: `${((p.marketValue || 0) / maxValue) * 100}%` }} /></span>
                    </>
                  )} />
                <Row label="Edad" players={players} render={(p) => `${p.age} años`} />
                <Row label="Posición" players={players} render={(p) => p.position} />
                <Row label="Nacionalidad" players={players} render={(p) => <><Flag country={p.nationality} size={16} /> {p.nationality}</>} />
                <Row label="Altura" players={players} render={(p) => formatHeight(p.height)} />
                <Row label="Pie dominante" players={players} render={(p) => p.dominantFoot} />
                <Row label="Contrato hasta" players={players}
                  best={(p) => (p.contractUntil ? new Date(p.contractUntil).getFullYear() : 0)}
                  render={(p) => (p.contractUntil ? new Date(p.contractUntil).getFullYear() : '—')} />
                <Row label="Dorsal" players={players} render={(p) => p.shirtNumber ?? '—'} />
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
