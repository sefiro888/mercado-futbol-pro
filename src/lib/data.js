// =============================================================================
// CAPA DE ACCESO A DATOS (repositorio).
//
// Mantiene un ALMACÉN en memoria (`store`) que arranca con los datos demo de
// `src/data/*.json`. Si el entorno está configurado para Supabase
// (VITE_DATA_SOURCE=supabase + claves públicas), `initData()` reemplaza ese
// almacén con los datos remotos al iniciar la app. Si Supabase no está
// configurado o falla, se conservan los datos demo (fallback seguro).
//
// La interfaz pública (getAllClubs, getPlayerBySlug, search, etc.) NO cambia
// según el origen, de modo que ningún componente necesita tocarse. Las funciones
// de "fetch" siguen siendo async para soportar datos remotos.
// Ver ROADMAP_AUTOMATIZACION.md y SUPABASE_SETUP.md.
// =============================================================================

import transfersSeed from '@/data/transfers.json'
import rumoursSeed from '@/data/rumours.json'
import newsSeed from '@/data/news.json'
import sourcesSeed from '@/data/sources.json'
import recordsData from '@/data/records.json'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// CARGA DE EQUIPOS REALES.
// Cada club vive en su propio archivo: src/data/teams/<liga>/<slug>.json con la
// forma { club: {...}, players: [...] }. Vite los recoge TODOS automáticamente
// con import.meta.glob, así que añadir un equipo = añadir un archivo (sin tocar
// código). data.js calcula solo los valores derivados (edad, valor de plantilla,
// edad media, historial), para no repetirlos a mano y que nunca se descuadren.
// ---------------------------------------------------------------------------
const teamModules = import.meta.glob('../data/teams/**/*.json', { eager: true })

// Edad a partir de la fecha de nacimiento (YYYY-MM-DD).
function calcAge(birthDate) {
  if (!birthDate) return null
  const b = new Date(birthDate)
  if (Number.isNaN(b.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

// Historial de valor de mercado sintético (estimación) si el jugador no trae uno,
// para que el gráfico de evolución tenga algo coherente que mostrar.
function synthHistory(value) {
  if (!value || value <= 0) return []
  const factors = [0.55, 0.7, 0.85, 0.95, 1]
  const dates = ['2024-01', '2024-07', '2025-01', '2025-07', '2026-01']
  return factors.map((f, i) => ({
    date: dates[i],
    value: Math.round(value * f * 10) / 10,
  }))
}

const round1 = (n) => Math.round(n * 10) / 10

// Combina todos los archivos de equipo en colecciones planas de clubes y jugadores.
function buildFromTeams() {
  const clubs = []
  const players = []

  for (const path in teamModules) {
    const mod = teamModules[path]
    const team = mod.default || mod
    if (!team || !team.club) continue

    const club = { ...team.club }
    const teamPlayers = (team.players || []).map((p) => {
      const age = p.age ?? calcAge(p.birthDate)
      return {
        ...p,
        currentClubId: club.id,
        age,
        photo: p.photo ?? null,
        stats: p.stats || {},
        seasonStats: p.seasonStats || [],
        transferHistory: p.transferHistory || [],
        marketValueHistory: p.marketValueHistory || [],
      }
    })

    // Valores derivados del club (calculados, nunca a mano).
    club.playerIds = teamPlayers.map((p) => p.id)
    const values = teamPlayers.map((p) => p.marketValue || 0)
    const ages = teamPlayers.map((p) => p.age).filter((a) => a != null)
    club.squadValue = round1(values.reduce((a, b) => a + b, 0))
    club.averageAge = ages.length
      ? round1(ages.reduce((a, b) => a + b, 0) / ages.length)
      : null

    clubs.push(club)
    players.push(...teamPlayers)
  }

  // Orden estable de clubes: por liga y luego por valor de plantilla desc.
  clubs.sort(
    (a, b) => (a.league || '').localeCompare(b.league || '') || b.squadValue - a.squadValue,
  )
  return { clubs, players }
}

const seeded = buildFromTeams()

// Origen de datos: "local" (por defecto) | "supabase".
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'local'

// Nombres de las colecciones = nombres de las tablas en Supabase.
const COLLECTIONS = ['clubs', 'players', 'transfers', 'rumours', 'news', 'sources']

// ---------------------------------------------------------------------------
// Almacén mutable. Las funciones de abajo SIEMPRE leen de `store` en tiempo de
// llamada, por lo que reflejan el origen activo (demo o Supabase) sin cambios.
// ---------------------------------------------------------------------------
const store = {
  clubs: seeded.clubs,
  players: seeded.players,
  transfers: [...transfersSeed],
  rumours: [...rumoursSeed],
  news: [...newsSeed],
  sources: [...sourcesSeed],
}

// Accesos cómodos a las colecciones actuales del almacén.
const clubs = () => store.clubs
const players = () => store.players
const transfers = () => store.transfers
const rumours = () => store.rumours
const news = () => store.news
const sources = () => store.sources

// ---------------------------------------------------------------------------
// Índices en memoria para búsquedas O(1) por id. Se reconstruyen tras cargar.
// ---------------------------------------------------------------------------
const byId = (list) => Object.fromEntries(list.map((item) => [item.id, item]))

let clubsById = byId(store.clubs)
let playersById = byId(store.players)
let sourcesById = byId(store.sources)

function rebuildIndexes() {
  clubsById = byId(store.clubs)
  playersById = byId(store.players)
  sourcesById = byId(store.sources)
}

// ---------------------------------------------------------------------------
// INICIALIZACIÓN. Llamar UNA vez al arrancar la app (ver src/main.jsx).
// En modo local no hace nada (los datos demo ya están cargados). En modo
// supabase, carga las 6 colecciones; ante cualquier error conserva los demo.
// ---------------------------------------------------------------------------
export async function initData() {
  if (DATA_SOURCE !== 'supabase') return { source: 'local' }
  if (!isSupabaseConfigured()) {
    console.warn(
      '[data] VITE_DATA_SOURCE=supabase pero faltan VITE_SUPABASE_URL / ' +
        'VITE_SUPABASE_ANON_KEY. Se usan los datos demo.',
    )
    return { source: 'local' }
  }
  try {
    const supabase = await getSupabaseClient()
    if (!supabase) return { source: 'local' }

    const results = await Promise.all(
      COLLECTIONS.map((name) => supabase.from(name).select('*')),
    )
    results.forEach((res, i) => {
      if (res.error) throw res.error
      if (Array.isArray(res.data)) store[COLLECTIONS[i]] = res.data
    })
    rebuildIndexes()
    return { source: 'supabase' }
  } catch (error) {
    console.warn(
      '[data] Falló la carga desde Supabase; se mantienen los datos demo.',
      error,
    )
    return { source: 'local', error }
  }
}

// ---------------------------------------------------------------------------
// Resolutores síncronos (relaciones entre entidades).
// Útiles dentro de componentes que ya tienen los datos cargados.
// ---------------------------------------------------------------------------
export const getClubById = (id) => clubsById[id] || null
export const getPlayerById = (id) => playersById[id] || null
export const getSourceById = (id) => sourcesById[id] || null

export const getClubBySlug = (slug) => clubs().find((c) => c.slug === slug) || null
export const getPlayerBySlug = (slug) =>
  players().find((p) => p.slug === slug) || null

export const getPlayersByClub = (clubId) =>
  players().filter((p) => p.currentClubId === clubId)

export const getTransfersByPlayer = (playerId) =>
  transfers().filter((t) => t.playerId === playerId)

export const getTransfersByClub = (clubId) =>
  transfers().filter((t) => t.fromClubId === clubId || t.toClubId === clubId)

export const getRumoursByPlayer = (playerId) =>
  rumours().filter((r) => r.playerId === playerId)

export const getRumoursByClub = (clubId) =>
  rumours().filter((r) => r.currentClubId === clubId || r.interestedClubId === clubId)

export const getNewsByPlayer = (playerId) =>
  news().filter((n) => (n.relatedPlayerIds || []).includes(playerId))

export const getNewsByClub = (clubId) =>
  news().filter((n) => (n.relatedClubIds || []).includes(clubId))

export const getSources = (ids = []) => ids.map(getSourceById).filter(Boolean)

// ---------------------------------------------------------------------------
// Colecciones completas (ordenadas de forma razonable por defecto).
// ---------------------------------------------------------------------------
const byDateDesc = (a, b) =>
  new Date(b.publishedAt || b.transferDate || b.lastUpdated) -
  new Date(a.publishedAt || a.transferDate || a.lastUpdated)

export const getAllClubs = () => [...clubs()]
export const getAllPlayers = () => [...players()]
export const getAllSources = () => [...sources()]
export const getAllNews = () => [...news()].sort(byDateDesc)
export const getAllTransfers = () => [...transfers()].sort(byDateDesc)
export const getAllRumours = () => [...rumours()].sort(byDateDesc)

// ---------------------------------------------------------------------------
// Interfaz async (preparada para API/Supabase).
// Cuando migres, cambia el cuerpo por un fetch/consulta y conserva la firma.
// ---------------------------------------------------------------------------
export async function fetchCollection(name) {
  const map = {
    clubs: getAllClubs,
    players: getAllPlayers,
    transfers: getAllTransfers,
    rumours: getAllRumours,
    news: getAllNews,
    sources: getAllSources,
  }
  const loader = map[name]
  if (!loader) throw new Error(`Colección desconocida: ${name}`)
  return Promise.resolve(loader())
}

// ---------------------------------------------------------------------------
// Métricas derivadas para la portada (clubes más consultados / jugadores en
// tendencia). En el MVP se calculan a partir del volumen de noticias y rumores;
// en el futuro podrían venir de analítica real.
// ---------------------------------------------------------------------------
// Datos destacados de un club para mostrar en su tarjeta (antes de entrar):
// jugador estrella (mayor valor), fichaje récord (entrada más cara) y venta
// récord (salida más cara). Cualquiera puede ser null si no hay datos.
export function getClubHighlights(clubId) {
  const squad = getPlayersByClub(clubId)
  const starPlayer = squad.length
    ? squad.reduce((best, p) => ((p.marketValue || 0) > (best.marketValue || 0) ? p : best))
    : null

  const clubTransfers = getTransfersByClub(clubId)
  const incoming = clubTransfers.filter((t) => t.toClubId === clubId && t.transferFee != null)
  const outgoing = clubTransfers.filter((t) => t.fromClubId === clubId && t.transferFee != null)

  const maxBy = (list) =>
    list.length ? list.reduce((a, b) => (b.transferFee > a.transferFee ? b : a)) : null

  const recordSigningT = maxBy(incoming)
  const recordSaleT = maxBy(outgoing)

  return {
    starPlayer,
    recordSigning: recordSigningT
      ? { player: getPlayerById(recordSigningT.playerId), fee: recordSigningT.transferFee }
      : null,
    recordSale: recordSaleT
      ? { player: getPlayerById(recordSaleT.playerId), fee: recordSaleT.transferFee }
      : null,
  }
}

// Top fichajes (entrantes) y ventas (salientes) de un club, combinando los
// récords históricos curados (records.json) con los traspasos recientes
// registrados (transfers.json). Devuelve { signings, sales } ordenados por
// importe descendente, hasta `limit` cada uno.
export function getClubTopTransfers(clubId, limit = 10) {
  const rec = recordsData[clubId] || {}

  const fromTransfers = (dir) =>
    getTransfersByClub(clubId)
      .filter((t) =>
        dir === 'in'
          ? t.toClubId === clubId && t.transferFee != null
          : t.fromClubId === clubId && t.transferFee != null,
      )
      .map((t) => {
        const player = getPlayerById(t.playerId)
        const other = dir === 'in' ? t.fromClubId : t.toClubId
        const otherName = dir === 'in' ? t.fromClubName : t.toClubName
        return {
          name: player?.name || t.playerId,
          slug: player?.slug || null,
          fee: t.transferFee,
          year: new Date(t.transferDate).getFullYear(),
          club: getClubById(other)?.name || otherName || '—',
        }
      })

  const merge = (curated = [], live = []) => {
    const seen = new Set()
    return [...curated, ...live]
      .filter((x) => {
        const key = `${x.name}-${x.year}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => (b.fee || 0) - (a.fee || 0))
      .slice(0, limit)
  }

  return {
    signings: merge(rec.signings, fromTransfers('in')),
    sales: merge(rec.sales, fromTransfers('out')),
  }
}

// Posición del jugador por valor dentro de su club: { rank, total, topValue }.
export function getPlayerRankInClub(player) {
  if (!player || !player.currentClubId) {
    return { rank: 1, total: 1, topValue: player?.marketValue || 0 }
  }
  const squad = getPlayersByClub(player.currentClubId).sort(
    (a, b) => (b.marketValue || 0) - (a.marketValue || 0),
  )
  const rank = squad.findIndex((p) => p.id === player.id) + 1
  return { rank, total: squad.length, topValue: squad[0]?.marketValue || 0 }
}

// Jugadores similares: misma posición exacta, valor más cercano, de cualquier club.
export function getSimilarPlayers(player, limit = 4) {
  return players()
    .filter((p) => p.id !== player.id && p.position === player.position)
    .map((p) => ({ p, diff: Math.abs((p.marketValue || 0) - (player.marketValue || 0)) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, limit)
    .map((x) => x.p)
}

// Jugador más valioso de cada liga / global (para bloques de portada).
export function getMostValuablePlayers(limit = 8) {
  return [...players()]
    .sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0))
    .slice(0, limit)
}

// Resumen por liga: nº de equipos, valor total y club más valioso.
export function getLeagueSummary() {
  const map = {}
  clubs().forEach((c) => {
    if (!map[c.league]) {
      map[c.league] = { league: c.league, country: c.country, clubs: 0, value: 0, top: null }
    }
    const L = map[c.league]
    L.clubs += 1
    L.value += c.squadValue || 0
    if (!L.top || (c.squadValue || 0) > (L.top.squadValue || 0)) L.top = c
  })
  return Object.values(map)
    .map((l) => ({ ...l, value: Math.round(l.value) }))
    .sort((a, b) => b.value - a.value)
}

// Cifras globales del mercado (para el bloque "el mercado en cifras").
export function getMarketStats() {
  const allTransfers = transfers().filter((t) => t.transferFee != null)
  const totalSpend = allTransfers.reduce((s, t) => s + (t.transferFee || 0), 0)
  const priciest = allTransfers.reduce(
    (best, t) => (t.transferFee > (best?.transferFee ?? -1) ? t : best),
    null,
  )
  const totalSquadValue = clubs().reduce((s, c) => s + (c.squadValue || 0), 0)
  return {
    totalSpend: Math.round(totalSpend),
    priciest,
    totalSquadValue: Math.round(totalSquadValue),
    transferCount: allTransfers.length,
  }
}

// Resumen por club del mercado registrado: gasto, ingresos, balance y actividad.
// Se usa en dashboards para detectar clubes compradores, vendedores y plantillas
// que más se han movido sin duplicar cálculos en las páginas.
export function getClubMarketBalances() {
  return clubs()
    .map((club) => {
      const incoming = transfers().filter((t) => t.toClubId === club.id)
      const outgoing = transfers().filter((t) => t.fromClubId === club.id)
      const spent = incoming.reduce((sum, t) => sum + (t.transferFee || 0), 0)
      const income = outgoing.reduce((sum, t) => sum + (t.transferFee || 0), 0)
      const recordIn = incoming.reduce(
        (best, t) => ((t.transferFee || 0) > (best?.transferFee || -1) ? t : best),
        null,
      )
      const recordOut = outgoing.reduce(
        (best, t) => ((t.transferFee || 0) > (best?.transferFee || -1) ? t : best),
        null,
      )
      return {
        club,
        incoming,
        outgoing,
        spent,
        income,
        balance: income - spent,
        activity: incoming.length + outgoing.length,
        recordIn,
        recordOut,
      }
    })
    .sort((a, b) => b.activity - a.activity || b.spent - a.spent)
}

export function getMarketDashboard() {
  const confirmed = transfers().filter((t) => t.status === 'confirmado')
  const paid = confirmed.filter((t) => t.transferFee != null)
  const balances = getClubMarketBalances()
  const topSigning = paid.reduce(
    (best, t) => ((t.transferFee || 0) > (best?.transferFee || -1) ? t : best),
    null,
  )
  const topProfit = paid
    .filter((t) => t.previousPurchaseFee != null)
    .map((t) => ({ transfer: t, profit: (t.transferFee || 0) - t.previousPurchaseFee }))
    .sort((a, b) => b.profit - a.profit)[0] || null
  const freeDeals = paid.filter((t) => (t.transferFee || 0) === 0).length
  const avgFee = paid.length
    ? Math.round((paid.reduce((sum, t) => sum + (t.transferFee || 0), 0) / paid.length) * 10) / 10
    : 0

  return {
    balances,
    topSigning,
    topProfit,
    freeDeals,
    avgFee,
    busiestClub: balances[0] || null,
    topSpenders: [...balances].sort((a, b) => b.spent - a.spent).slice(0, 6),
    topSellers: [...balances].sort((a, b) => b.income - a.income).slice(0, 6),
    bestBalances: [...balances].sort((a, b) => b.balance - a.balance).slice(0, 6),
    worstBalances: [...balances].sort((a, b) => a.balance - b.balance).slice(0, 6),
    latest: [...confirmed]
      .sort((a, b) => new Date(b.transferDate) - new Date(a.transferDate))
      .slice(0, 8),
  }
}

// Auditoria agregada de plantillas: tamanos, edad, valor y actividad de mercado.
// Alimenta las paginas de clubes/jugadores para que el estado de las plantillas
// quede visible sin repetir logica en componentes.
export function getSquadDashboard() {
  const allPlayers = players()
  const allClubs = clubs()
  const ages = allPlayers.map((p) => p.age).filter((age) => age != null)
  const clubRows = allClubs.map((club) => {
    const squad = getPlayersByClub(club.id)
    const squadAges = squad.map((p) => p.age).filter((age) => age != null)
    const topPlayer = squad.reduce(
      (best, p) => ((p.marketValue || 0) > (best?.marketValue || -1) ? p : best),
      null,
    )
    const arrivals = transfers().filter((t) => t.toClubId === club.id).length
    const departures = transfers().filter((t) => t.fromClubId === club.id).length

    return {
      club,
      players: squad.length,
      value: club.squadValue || 0,
      averageAge: squadAges.length
        ? round1(squadAges.reduce((sum, age) => sum + age, 0) / squadAges.length)
        : null,
      u21: squad.filter((p) => (p.age || 99) <= 21).length,
      topPlayer,
      arrivals,
      departures,
      activity: arrivals + departures,
    }
  })

  const byValue = [...clubRows].sort((a, b) => b.value - a.value)
  const byYouth = [...clubRows].sort((a, b) => (a.averageAge || 99) - (b.averageAge || 99))
  const byDepth = [...clubRows].sort((a, b) => b.players - a.players || b.value - a.value)
  const byActivity = [...clubRows].sort((a, b) => b.activity - a.activity || b.value - a.value)

  return {
    updatedAt: '2026-06-27',
    totalPlayers: allPlayers.length,
    totalClubs: allClubs.length,
    totalValue: round1(allPlayers.reduce((sum, p) => sum + (p.marketValue || 0), 0)),
    averageAge: ages.length ? round1(ages.reduce((sum, age) => sum + age, 0) / ages.length) : null,
    u21: allPlayers.filter((p) => (p.age || 99) <= 21).length,
    mostValuableClub: byValue[0] || null,
    youngestClub: byYouth[0] || null,
    deepestSquad: byDepth[0] || null,
    mostActiveSquad: byActivity[0] || null,
    mostValuableSquads: byValue.slice(0, 5),
    youngestSquads: byYouth.slice(0, 5),
    deepestSquads: byDepth.slice(0, 5),
    activeSquads: byActivity.slice(0, 5),
  }
}

export function getTrendingClubs(limit = 4) {
  return [...clubs()]
    .map((club) => ({
      club,
      buzz: getNewsByClub(club.id).length + getRumoursByClub(club.id).length,
    }))
    .sort((a, b) => b.buzz - a.buzz || b.club.squadValue - a.club.squadValue)
    .slice(0, limit)
}

export function getTrendingPlayers(limit = 6) {
  return [...players()]
    .map((player) => ({
      player,
      buzz: getNewsByPlayer(player.id).length + getRumoursByPlayer(player.id).length,
    }))
    .sort((a, b) => b.buzz - a.buzz || b.player.marketValue - a.player.marketValue)
    .slice(0, limit)
}

// ---------------------------------------------------------------------------
// Búsqueda global simple (noticias, clubes, jugadores).
// Sin dependencias: filtra por coincidencia de texto normalizado.
// ---------------------------------------------------------------------------
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')
const normalize = (str = '') =>
  str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')

export function search(query) {
  const q = normalize(query).trim()
  if (!q) return { players: [], clubs: [], news: [] }

  return {
    players: players().filter(
      (p) => normalize(p.name).includes(q) || normalize(p.nationality).includes(q),
    ),
    clubs: clubs().filter(
      (c) => normalize(c.name).includes(q) || normalize(c.league).includes(q),
    ),
    news: news().filter(
      (n) => normalize(n.title).includes(q) || normalize(n.summary).includes(q),
    ),
  }
}

// Listas únicas para poblar los filtros (ligas, posiciones, nacionalidades).
export const getLeagues = () => [...new Set(clubs().map((c) => c.league))].sort()
export const getPositions = () =>
  [...new Set(players().map((p) => p.position))].sort()
export const getNationalities = () =>
  [...new Set(players().map((p) => p.nationality))].sort()
