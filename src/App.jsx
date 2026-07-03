import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Header from '@/components/Header.jsx'
import Footer from '@/components/Footer.jsx'
import ScrollProgress from '@/components/ScrollProgress.jsx'

import Home from '@/pages/Home.jsx'
import News from '@/pages/News.jsx'
import Transfers from '@/pages/Transfers.jsx'
import Clubs from '@/pages/Clubs.jsx'
import ClubDetail from '@/pages/ClubDetail.jsx'
import Players from '@/pages/Players.jsx'
import PlayerDetail from '@/pages/PlayerDetail.jsx'
import Rumours from '@/pages/Rumours.jsx'
import NotFound from '@/pages/NotFound.jsx'

// Vuelve arriba al cambiar de ruta (mejor UX en navegación SPA).
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  // La clave por ruta hace que el contenido re-anime su entrada en cada
  // navegación (sensación viva, no solo en la primera carga).
  const { pathname } = useLocation()

  return (
    <>
      <ScrollProgress />
      <ScrollToTop />
      <Header />
      <main id="contenido">
        <div className="route-view" key={pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/fichajes" element={<Transfers />} />
            <Route path="/clubes" element={<Clubs />} />
            <Route path="/clubes/:slug" element={<ClubDetail />} />
            <Route path="/jugadores" element={<Players />} />
            <Route path="/jugadores/:slug" element={<PlayerDetail />} />
            <Route path="/rumores" element={<Rumours />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  )
}
