import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setPageSeo } from '@/lib/seo.js'
import './Pages.css'

export default function NotFound() {
  useEffect(() => {
    setPageSeo({ title: 'Página no encontrada' })
  }, [])

  return (
    <div className="container section empty-state">
      <h1>404 · Página no encontrada</h1>
      <p>La página que buscas no existe o se ha movido.</p>
      <Link className="btn btn-primary" to="/">Volver al inicio</Link>
    </div>
  )
}
