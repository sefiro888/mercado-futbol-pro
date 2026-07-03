import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ClubProfile from '@/components/ClubProfile.jsx'
import { getClubBySlug } from '@/lib/data.js'
import { setPageSeo } from '@/lib/seo.js'

export default function ClubDetail() {
  const { slug } = useParams()
  const club = getClubBySlug(slug)

  useEffect(() => {
    if (club) {
      setPageSeo({
        title: club.name,
        description: `${club.name} (${club.league}, ${club.country}): plantilla, valor de mercado, fichajes, salidas y rumores actualizados a 27/06/2026.`,
      })
    } else {
      setPageSeo({ title: 'Club no encontrado' })
    }
  }, [club])

  if (!club) {
    return (
      <div className="container section empty-state">
        <h1>Club no encontrado</h1>
        <p>El club que buscas no existe en la base de datos actual.</p>
        <Link className="btn btn-primary" to="/clubes">Volver a clubes</Link>
      </div>
    )
  }

  return <ClubProfile club={club} />
}
