const KEY = 'mfp_predictions'

function getAll() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

function saveAll(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
}

export function getPrediction(rumourId) {
  return getAll()[rumourId] ?? null
}

export function setPrediction(rumourId, vote) {
  const all = getAll()
  if (all[rumourId]?.vote === vote) {
    delete all[rumourId]
  } else {
    all[rumourId] = { vote, timestamp: Date.now() }
  }
  saveAll(all)
  window.dispatchEvent(new CustomEvent('mfp-prediction', { detail: { rumourId } }))
  return all[rumourId] ?? null
}

export function getAllPredictions() {
  return getAll()
}

export function calcStats(rumours) {
  const preds = getAll()
  const total = Object.keys(preds).length
  if (total === 0) return { total: 0, correct: 0, pending: 0, pct: null }

  let correct = 0
  let pending = 0

  for (const [id, pred] of Object.entries(preds)) {
    const rumour = rumours.find((r) => r.id === id)
    if (!rumour) continue
    const status = rumour.status
    if (status === 'confirmado') {
      if (pred.vote === 'si') correct++
    } else if (status === 'descartado') {
      if (pred.vote === 'no') correct++
    } else {
      pending++
    }
  }

  const resolved = total - pending
  const pct = resolved > 0 ? Math.round((correct / resolved) * 100) : null

  return { total, correct, pending, pct }
}
