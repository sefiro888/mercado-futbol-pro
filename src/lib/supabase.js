// =============================================================================
// CLIENTE DE SUPABASE (solo lectura pública desde el frontend).
//
// Usa únicamente la ANON KEY (clave pública) protegida por Row Level Security.
// NUNCA pongas aquí la service_role ni claves de APIs de pago: ver
// ROADMAP_AUTOMATIZACION.md y SUPABASE_SETUP.md.
//
// La librería @supabase/supabase-js se importa de forma PEREZOSA (dynamic import)
// y solo cuando hay credenciales configuradas. Así, en modo "local" (datos demo)
// la app no necesita la librería ni las claves para funcionar.
// =============================================================================

let clientPromise = null

// ¿Hay credenciales públicas en el entorno? (.env.local)
export function isSupabaseConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  )
}

// Devuelve el cliente de Supabase, o null si no está configurado.
// Carga la librería bajo demanda para no penalizar el modo local.
export async function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
          { auth: { persistSession: false } },
        ),
      )
      .catch((error) => {
        console.warn(
          '[supabase] No se pudo cargar @supabase/supabase-js. ' +
            '¿Has ejecutado "npm install"?',
          error,
        )
        clientPromise = null
        return null
      })
  }
  return clientPromise
}
