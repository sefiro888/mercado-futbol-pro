// =============================================================================
// Escudos reales de los clubes.
//
// Usamos el CDN público de imágenes de api-sports (media.api-sports.io), que
// sirve los escudos por id de equipo. Aquí mapeamos nuestro slug de club → id.
// El componente <Crest> intenta cargar el escudo y, si falla (id ausente o
// imagen no disponible), cae automáticamente a las iniciales sobre el color del
// club. Así nunca se rompe la UI.
//
// Nota: los escudos son marcas de sus clubes; se usan solo con fines
// ilustrativos en este proyecto.
// =============================================================================

const TEAM_IDS = {
  // --- Premier League ---
  arsenal: 42,
  'manchester-city': 50,
  liverpool: 40,
  chelsea: 49,
  'manchester-united': 33,
  tottenham: 47,
  newcastle: 34,
  'aston-villa': 66,
  brighton: 51,
  'west-ham': 48,
  'crystal-palace': 52,
  bournemouth: 35,
  brentford: 55,
  fulham: 36,
  wolves: 39,
  everton: 45,
  'nottingham-forest': 65,
  burnley: 44,
  leeds: 63,
  sunderland: 746,
  // --- LaLiga ---
  'real-madrid': 541,
  barcelona: 529,
  'atletico-madrid': 530,
  'athletic-club': 531,
  'real-sociedad': 548,
  'real-betis': 543,
  villarreal: 533,
  valencia: 532,
  sevilla: 536,
  girona: 547,
  'celta-vigo': 538,
  'rayo-vallecano': 728,
  osasuna: 727,
  getafe: 546,
  mallorca: 798,
  espanyol: 540,
  alaves: 542,
  levante: 539,
  elche: 797,
  'real-oviedo': 718,
  // --- Serie A ---
  inter: 505,
  milan: 489,
  napoli: 492,
  juventus: 496,
}

/** URL del escudo real de un club (o null si no se conoce su id). */
export function clubLogoUrl(clubId) {
  const id = TEAM_IDS[clubId]
  return id ? `https://media.api-sports.io/football/teams/${id}.png` : null
}
