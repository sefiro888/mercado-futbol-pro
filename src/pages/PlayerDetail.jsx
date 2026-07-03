import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import PlayerProfile from '@/components/PlayerProfile.jsx'
import { getPlayerBySlug, getClubById } from '@/lib/data.js'
import { setPageSeo } from '@/lib/seo.js'

export default function PlayerDetail() {
  const { slug } = useParams()
  const player = getPlayerBySlug(slug)

  useEffect(() => {
    if (player) {
      const club = getClubById(player.currentClubId)
      setPageSeo({
        title: player.name,
        description: `${player.name}: ${player.position}${club ? ` en ${club.name}` : ''}. Datos, valor de mercado, historial y rumores actualizados a 27/06/2026.`,
      })
    } else {
      setPageSeo({ title: 'Jugador no encontrado' })
    }
  }, [player])

  if (!player) {
    return (
      <div className="container section empty-state">
        <h1>Jugador no encontrado</h1>
        <p>El jugador que buscas no existe en la base de datos actual.</p>
        <Link className="btn btn-primary" to="/jugadores">Volver a jugadores</Link>
      </div>
    )
  }

  return <PlayerProfile player={player} />
}
