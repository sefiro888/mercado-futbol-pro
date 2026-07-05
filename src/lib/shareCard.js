// Genera un "cromo" PNG de un jugador con Canvas API y lo comparte / descarga.
// Sin dependencias externas: solo Canvas 2D nativo.

const W = 320
const H = 460

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function hexToRgb(hex) {
  const clean = hex?.replace('#', '') ?? '22c55e'
  const n = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export async function generatePlayerCard({ player, club, photoUrl, logoUrl }) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const primaryColor = club?.primaryColor ?? '#22c55e'
  const rgb = hexToRgb(primaryColor)
  const isLight = luminance(rgb) > 0.55
  const textColor = isLight ? '#111' : '#fff'

  // Fondo con gradiente del color del club
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, `rgba(${rgb},1)`)
  grad.addColorStop(0.6, `rgba(${rgb.join(',')},0.85)`)
  grad.addColorStop(1, '#0a0a0a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Capa oscura sutil en la parte inferior para legibilidad
  const overlay = ctx.createLinearGradient(0, H * 0.55, 0, H)
  overlay.addColorStop(0, 'rgba(0,0,0,0)')
  overlay.addColorStop(1, 'rgba(0,0,0,0.72)')
  ctx.fillStyle = overlay
  ctx.fillRect(0, 0, W, H)

  // Borde redondeado (clip)
  const r = 18
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(W - r, 0)
  ctx.quadraticCurveTo(W, 0, W, r)
  ctx.lineTo(W, H - r)
  ctx.quadraticCurveTo(W, H, W - r, H)
  ctx.lineTo(r, H)
  ctx.quadraticCurveTo(0, H, 0, H - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.clip()

  // Foto del jugador (fondo de la tarjeta, grande)
  const photo = photoUrl ? await loadImage(photoUrl) : null
  if (photo) {
    const imgH = H * 0.72
    const imgW = (photo.width / photo.height) * imgH
    const x = (W - imgW) / 2
    ctx.drawImage(photo, x, H * 0.05, imgW, imgH)

    // Gradiente para fundir la foto con el fondo abajo
    const photoGrad = ctx.createLinearGradient(0, H * 0.45, 0, H * 0.78)
    photoGrad.addColorStop(0, 'rgba(0,0,0,0)')
    photoGrad.addColorStop(1, 'rgba(0,0,0,0.88)')
    ctx.fillStyle = photoGrad
    ctx.fillRect(0, H * 0.45, W, H * 0.33)
  }

  // Logo del club (esquina superior derecha)
  const logo = logoUrl ? await loadImage(logoUrl) : null
  const logoSize = 48
  const logoPad = 14
  if (logo) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(W - logoPad - logoSize / 2, logoPad + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fill()
    ctx.drawImage(logo, W - logoPad - logoSize, logoPad, logoSize, logoSize)
    ctx.restore()
  }

  // Banda inferior: nombre, posición, valor
  const bandy = H * 0.78
  const bandH = H - bandy

  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(0, bandy, W, bandH)

  // Nombre del jugador
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px system-ui, Arial, sans-serif'
  ctx.textAlign = 'center'
  const name = player?.name ?? 'Jugador'
  ctx.fillText(name.length > 22 ? name.slice(0, 21) + '…' : name, W / 2, bandy + 30)

  // Posición y club
  ctx.font = '13px system-ui, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  const meta = [player?.position, club?.name].filter(Boolean).join(' · ')
  ctx.fillText(meta, W / 2, bandy + 50)

  // Valor de mercado
  const val = player?.marketValue
  if (val) {
    ctx.font = 'bold 16px system-ui, Arial, sans-serif'
    ctx.fillStyle = '#4ade80'
    ctx.fillText(`${val} M€`, W / 2, bandy + 72)
  }

  // Marca de agua
  ctx.font = '10px system-ui, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillText('mercadofutbol.pro', W / 2, H - 10)

  ctx.restore()
  return canvas
}

export async function sharePlayerCard(cardData) {
  const canvas = await generatePlayerCard(cardData)

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { resolve({ ok: false, reason: 'canvas_failed' }); return }

      const playerName = cardData.player?.name ?? 'jugador'
      const fileName = `${playerName.toLowerCase().replace(/\s+/g, '-')}-mfp.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `${playerName} — Mercado Fútbol Pro`,
            text: `Echa un vistazo a ${playerName} en Mercado Fútbol Pro 🔥`,
          })
          resolve({ ok: true, method: 'share' })
        } catch {
          resolve({ ok: false, reason: 'share_cancelled' })
        }
      } else {
        // Fallback: descargar
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 5000)
        resolve({ ok: true, method: 'download' })
      }
    }, 'image/png')
  })
}
