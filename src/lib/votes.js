// =============================================================================
// Votación del "once ideal" por club.
//
// IMPORTANTE: una votación GLOBAL compartida entre todos los visitantes necesita
// un backend. Este módulo guarda los votos en localStorage (solo en el navegador
// del usuario), de modo que la experiencia funciona ya. La interfaz es async para
// poder migrar a Supabase sin tocar los componentes: bastaría reescribir el
// cuerpo de estas funciones por consultas a una tabla `eleven_votes`
// (club_id, player_id, votes) con un upsert/increment. Ver ROADMAP.
// =============================================================================

const KEY = 'mfp_eleven_votes_v1' // recuento por club/jugador
const MINE = 'mfp_eleven_mine_v1' // selección personal del usuario

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}')
  } catch {
    return {}
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* almacenamiento no disponible: se ignora silenciosamente */
  }
}

/** Recuento de votos por jugador de un club: { playerId: count }. */
export async function getVotes(clubId) {
  const all = read(KEY)
  return all[clubId] || {}
}

/** Suma un voto a cada jugador del once elegido (array de playerIds). */
export async function submitVote(clubId, playerIds) {
  const all = read(KEY)
  const club = { ...(all[clubId] || {}) }
  for (const id of playerIds) club[id] = (club[id] || 0) + 1
  all[clubId] = club
  write(KEY, all)

  // Guarda también la selección personal del usuario.
  const mine = read(MINE)
  mine[clubId] = playerIds
  write(MINE, mine)

  return club
}

/** Selección personal guardada del usuario para un club (array de playerIds) o null. */
export function getMyEleven(clubId) {
  const mine = read(MINE)
  return mine[clubId] || null
}

/** Número total de onces votados (aprox.: máximo recuento individual). */
export async function getVoteCount(clubId) {
  const votes = await getVotes(clubId)
  const values = Object.values(votes)
  return values.length ? Math.max(...values) : 0
}
