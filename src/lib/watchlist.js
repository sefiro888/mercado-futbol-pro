const KEY = 'mfp_watchlist'

function getAll() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

function saveAll(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
}

export function isWatched(id) {
  return !!getAll()[id]
}

export function toggleWatchItem(id, type, name) {
  const all = getAll()
  let nowWatched
  if (all[id]) {
    delete all[id]
    nowWatched = false
  } else {
    all[id] = { type, name, addedAt: Date.now() }
    nowWatched = true
  }
  saveAll(all)
  window.dispatchEvent(new CustomEvent('mfp-watchlist', { detail: { id, watched: nowWatched } }))
  return nowWatched
}

export function getWatchlistItems() {
  return getAll()
}

export function removeFromWatchlist(id) {
  const all = getAll()
  delete all[id]
  saveAll(all)
  window.dispatchEvent(new CustomEvent('mfp-watchlist', { detail: { id, watched: false } }))
}
