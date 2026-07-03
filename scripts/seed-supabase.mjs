// ============================================================================
// Carga (seed) de los datos demo en Supabase.
//
// Lee los JSON de src/data/*.json y hace upsert en las tablas. Como las claves
// de los JSON ya coinciden con los nombres de columna, no hace falta mapear.
//
// USO:
//   1. Crea el esquema antes (supabase/schema.sql en el SQL Editor).
//   2. Pon estas variables en .env.local (o en el entorno):
//        SUPABASE_URL=https://TU-PROYECTO.supabase.co
//        SUPABASE_SERVICE_ROLE_KEY=eyJ...   (clave SECRETA, solo local)
//   3. Ejecuta:  npm run seed
//
// ⚠️ La service_role IGNORA las reglas RLS y permite escribir. NUNCA la pongas
//    en el frontend ni la subas a git (.env.local ya está en .gitignore).
// ============================================================================

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, 'src', 'data')

// --- Carga manual de .env.local (sin dependencias) --------------------------
async function loadEnvLocal() {
  try {
    const raw = await readFile(join(ROOT, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // No hay .env.local: se usarán las variables del entorno si existen.
  }
}

const readJson = async (name) =>
  JSON.parse(await readFile(join(DATA_DIR, `${name}.json`), 'utf8'))

// Orden de carga: respeta las claves foráneas (clubs antes que players, etc.).
const ORDER = ['sources', 'clubs', 'players', 'transfers', 'rumours', 'news']

async function main() {
  await loadEnvLocal()

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error(
      '\n✗ Faltan credenciales. Define en .env.local:\n' +
        '    SUPABASE_URL=https://TU-PROYECTO.supabase.co\n' +
        '    SUPABASE_SERVICE_ROLE_KEY=eyJ...  (Project Settings → API → service_role)\n',
    )
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  console.log('→ Cargando datos en Supabase:', url)

  for (const table of ORDER) {
    const rows = await readJson(table)
    const { error } = await supabase
      .from(table)
      .upsert(rows, { onConflict: 'id' })
    if (error) {
      console.error(`✗ ${table}: ${error.message}`)
      process.exit(1)
    }
    console.log(`✓ ${table}: ${rows.length} filas`)
  }

  console.log('\n✔ Seed completado. Ya puedes poner VITE_DATA_SOURCE=supabase.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
