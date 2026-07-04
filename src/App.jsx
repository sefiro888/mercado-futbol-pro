import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'

import Header from '@/components/Header.jsx'
import Footer from '@/components/Footer.jsx'
import ScrollProgress from '@/components/ScrollProgress.jsx'

// Carga perezosa por página: el navegador solo descarga el código de la
// sección que visita. Acelera mucho la primera carga, sobre todo en móvil.
const Home = lazy(() => import('@/pages/Home.jsx'))
const News = lazy(() => import('@/pages/News.jsx'))
const Transfers = lazy(() => import('@/pages/Transfers.jsx'))
const Clubs = lazy(() => import('@/pages/Clubs.jsx'))
const ClubDetail = lazy(() => import('@/pages/ClubDetail.jsx'))
const Players = lazy(() => import('@/pages/Players.jsx'))
const PlayerDetail = lazy(() => import('@/pages/PlayerDetail.jsx'))
const Rumours = lazy(() => import('@/pages/Rumours.jsx'))
const Compare = lazy(() => import('@/pages/Compare.jsx'))
const Simulator = lazy(() => import('@/pages/Simulator.jsx'))
const MarketLive = lazy(() => import('@/pages/MarketLive.jsx'))
const OnceIdeal = lazy(() => import('@/pages/OnceIdeal.jsx'))
const Rankings = lazy(() => import('@/pages/Rankings.jsx'))
const Watchlist = lazy(() => import('@/pages/Watchlist.jsx'))
const Quiz = lazy(() => import('@/pages/Quiz.jsx'))
const LeagueStats = lazy(() => import('@/pages/LeagueStats.jsx'))
const NotFound = lazy(() => import('@/pages/NotFound.jsx'))

// Vuelve arriba al cambiar de ruta (mejor UX en navegación SPA).
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

// Indicador mínimo mientras se descarga el código de una página.
function RouteLoader() {
  return (
    <div className="route-loader" role="status" aria-label="Cargando sección">
      <span className="route-loader-ball" />
    </div>
  )
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
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/noticias" element={<News />} />
              <Route path="/fichajes" element={<Transfers />} />
              <Route path="/clubes" element={<Clubs />} />
              <Route path="/clubes/:slug" element={<ClubDetail />} />
              <Route path="/jugadores" element={<Players />} />
              <Route path="/jugadores/:slug" element={<PlayerDetail />} />
              <Route path="/rumores" element={<Rumours />} />
              <Route path="/comparador" element={<Compare />} />
              <Route path="/simulador" element={<Simulator />} />
              <Route path="/mercado-vivo" element={<MarketLive />} />
              <Route path="/once-ideal" element={<OnceIdeal />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/ligas" element={<LeagueStats />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
