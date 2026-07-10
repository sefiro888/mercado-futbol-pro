// =============================================================================
// Configuración global del sitio.
// Cambia aquí el nombre, el lema y los textos de marca. Todo el resto de la app
// lee estos valores, así que renombrar el portal es un cambio de una sola línea.
// =============================================================================

export const SITE = {
  // Nombre provisional del portal. Cámbialo cuando decidas la marca definitiva.
  name: 'Mercado Fútbol Pro',
  shortName: 'MF Pro',

  tagline: 'Noticias, fichajes y rumores contrastados',

  description:
    'Portal deportivo de análisis: noticias de fútbol, fichajes confirmados y rumores ' +
    'contrastados con fuentes reales, con tablas de traspasos y análisis económico.',

  // URL base (se usará para SEO/canonical cuando se despliegue).
  url: 'https://mercadofutbolpro.example',

  // Aviso visible sobre la naturaleza de los datos.
  demoNotice:
    'Datos reales de Premier League, LaLiga y Serie A. Valores de mercado y cifras son ' +
    'estimaciones aproximadas (actualizadas a 27 de junio de 2026), no datos en vivo.',

  nav: [
    { to: '/', label: 'Inicio' },
    { to: '/noticias', label: 'Noticias' },
    { to: '/fichajes', label: 'Fichajes' },
    { to: '/historial-fichajes', label: 'Historial' },
    { to: '/simulador', label: 'Simulador' },
    { to: '/mundial', label: 'Mundial' },
    { to: '/champions', label: 'Champions' },
    { to: '/eurocopa', label: 'Eurocopa' },
    { to: '/libertadores', label: 'Libertadores' },
    { to: '/clubes', label: 'Clubes' },
    { to: '/jugadores', label: 'Jugadores' },
    { to: '/rankings', label: 'Rankings' },
    { to: '/estadisticas', label: 'Estadísticas' },
    { to: '/once-ideal', label: 'Once Ideal' },
    { to: '/watchlist', label: 'Watchlist' },
    { to: '/comparar', label: 'Comparar' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/mercado-vivo', label: 'Mercado Vivo' },
    { to: '/rumores', label: 'Rumores' },
    { to: '/mercado-vivo', label: 'Mercado en vivo' },
    { to: '/historial-fichajes', label: 'Historial' },
    { to: '/once-ideal', label: 'Once ideal' },
    { to: '/rankings', label: 'Rankings' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/mundial', label: '🏆 Mundial 2026' },
    { to: '/comparador', label: 'Comparador', desktopHide: true },
    { to: '/simulador', label: 'Simulador', desktopHide: true },
  ],
}
