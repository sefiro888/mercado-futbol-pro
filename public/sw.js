// Service Worker — Mercado Fútbol Pro
// Estrategia: cache-first para assets estáticos, network-first para navegación.

const CACHE_NAME = 'mfp-v1'
const SHELL = [
  '/mercado-futbol-pro/',
  '/mercado-futbol-pro/index.html',
]

// Instalar: precachear el shell mínimo
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  )
  self.skipWaiting()
})

// Activar: borrar cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Dominios de imágenes externas a cachear (escudos, banderas, fotos de jugadores)
const IMAGE_CDNS = [
  'media.api-sports.io',
  'flagcdn.com',
  'r2.thesportsdb.com',
  'a.espncdn.com',
  'crests.football-data.org',
]

// Fetch: lógica por tipo de recurso
self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // Cachear imágenes de CDNs externos (escudos, banderas, fotos)
  if (IMAGE_CDNS.some((cdn) => url.hostname.includes(cdn))) {
    if (request.method !== 'GET') return
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request, { mode: 'cors' }).then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          }).catch(() => cached)
        })
      )
    )
    return
  }

  // Solo interceptar el mismo origen para el resto
  if (url.origin !== location.origin) return

  // Navegación (HTML) → network-first, fallback a index.html cacheado
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() =>
        caches.match('/mercado-futbol-pro/index.html')
      )
    )
    return
  }

  // Assets estáticos (JS, CSS, fuentes, imágenes locales) → cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|svg|png|jpg|webp|ico)$/)
  ) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (!response.ok) return response
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
      })
    )
    return
  }

  // JSON de datos (src/data/**) → cache-first con revalidación en background
  if (url.pathname.includes('/src/') && url.pathname.endsWith('.json')) {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          return cached || network
        })
      )
    )
  }
})
