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
    { to: '/clubes', label: 'Clubes' },
    { to: '/jugadores', label: 'Jugadores' },
    { to: '/rumores', label: 'Rumores' },
    { to: '/mercado-vivo', label: 'Mercado en vivo' },
    { to: '/once-ideal', label: 'Once ideal' },
    { to: '/rankings', label: 'Rankings' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/comparador', label: 'Comparador', desktopHide: true },
    { to: '/simulador', label: 'Simulador', desktopHide: true },
  ],
}
