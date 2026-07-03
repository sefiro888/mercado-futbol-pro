// =============================================================================
// Posiciones, líneas y construcción del once ideal (formación 4-3-3).
// =============================================================================

// Línea (demarcación general) de cada posición concreta.
const LINE = {
  Portero: 'POR',
  'Defensa central': 'DEF',
  'Lateral derecho': 'DEF',
  'Lateral izquierdo': 'DEF',
  'Mediocentro defensivo': 'MED',
  Mediocentro: 'MED',
  Mediapunta: 'MED',
  'Extremo derecho': 'DEL',
  'Extremo izquierdo': 'DEL',
  'Delantero centro': 'DEL',
  Delantero: 'DEL',
}

export function lineOf(position) {
  return LINE[position] || 'MED'
}

// Color por línea (para badges de posición). Resuelve a tonos del tema.
export const LINE_COLOR = {
  POR: '#f5c518', // amarillo
  DEF: '#3b82f6', // azul
  MED: '#22c55e', // verde
  DEL: '#ef4444', // rojo
}

// Abreviatura corta de la posición (para badges compactos).
const SHORT = {
  Portero: 'POR',
  'Defensa central': 'DFC',
  'Lateral derecho': 'LD',
  'Lateral izquierdo': 'LI',
  'Mediocentro defensivo': 'MCD',
  Mediocentro: 'MC',
  Mediapunta: 'MP',
  'Extremo derecho': 'ED',
  'Extremo izquierdo': 'EI',
  'Delantero centro': 'DC',
  Delantero: 'DC',
}

export function shortPosition(position) {
  return SHORT[position] || position
}

// Formación 4-3-3. x/y en % del campo (y: 0 arriba/ataque, 100 abajo/portería).
// `pos` = posiciones preferidas para ese hueco (en orden de prioridad).
export const FORMATION_433 = [
  { id: 'gk', label: 'POR', x: 50, y: 90, line: 'POR', pos: ['Portero'] },
  { id: 'lb', label: 'LI', x: 14, y: 68, line: 'DEF', pos: ['Lateral izquierdo'] },
  { id: 'cb1', label: 'DFC', x: 37, y: 73, line: 'DEF', pos: ['Defensa central'] },
  { id: 'cb2', label: 'DFC', x: 63, y: 73, line: 'DEF', pos: ['Defensa central'] },
  { id: 'rb', label: 'LD', x: 86, y: 68, line: 'DEF', pos: ['Lateral derecho'] },
  { id: 'mc1', label: 'MC', x: 28, y: 47, line: 'MED', pos: ['Mediocentro', 'Mediocentro defensivo'] },
  { id: 'mcd', label: 'MCD', x: 50, y: 53, line: 'MED', pos: ['Mediocentro defensivo', 'Mediocentro'] },
  { id: 'mp', label: 'MP', x: 72, y: 47, line: 'MED', pos: ['Mediapunta', 'Mediocentro'] },
  { id: 'lw', label: 'EI', x: 20, y: 22, line: 'DEL', pos: ['Extremo izquierdo'] },
  { id: 'st', label: 'DC', x: 50, y: 16, line: 'DEL', pos: ['Delantero centro', 'Delantero'] },
  { id: 'rw', label: 'ED', x: 80, y: 22, line: 'DEL', pos: ['Extremo derecho'] },
]

// Candidatos válidos para un hueco: primero la posición exacta, luego la línea.
export function candidatesForSlot(slot, squad) {
  const exact = squad.filter((p) => slot.pos.includes(p.position))
  const sameLine = squad.filter((p) => lineOf(p.position) === slot.line)
  // Únicos, exactos primero.
  const seen = new Set()
  return [...exact, ...sameLine].filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

// Construye un XI a partir de la plantilla. Prioriza la posición EXACTA del
// hueco, luego la misma línea, y dentro de cada grupo por `score(player)` desc
// (por defecto, mayor valor de mercado). Devuelve { slotId: player }.
export function buildEleven(squad, score = (p) => p.marketValue || 0) {
  const used = new Set()
  const result = {}
  for (const slot of FORMATION_433) {
    const pool = squad
      .filter((p) => !used.has(p.id))
      .map((p) => ({
        p,
        exact: slot.pos.includes(p.position) ? 0 : 1,
        sameLine: lineOf(p.position) === slot.line ? 0 : 1,
        s: score(p),
      }))
      .sort((a, b) => a.exact - b.exact || a.sameLine - b.sameLine || b.s - a.s)
    const pick = pool[0]?.p || null
    if (pick) {
      used.add(pick.id)
      result[slot.id] = pick
    }
  }
  return result
}
