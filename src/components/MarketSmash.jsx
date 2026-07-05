import { useEffect, useRef } from 'react'
import './MarketSmash.css'

// ── Helpers ─────────────────────────────────────────────────────────────────
const PI2 = Math.PI * 2
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const rand = (a, b) => a + Math.random() * (b - a)

const BILL_COLORS = ['#15803d', '#16a34a', '#22c55e', '#14532d', '#166534', '#4ade80']
const BILL_VALUES = ['€50', '€100', '€200', '€20', '€500', '€50']
const NUM_BILLS = 14

// ── Ball drawing ─────────────────────────────────────────────────────────────
function drawBall(ctx, x, y, r, angle, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.rotate(angle)

  // Shadow
  ctx.save()
  ctx.shadowColor = 'rgba(34,197,94,0.5)'
  ctx.shadowBlur = 22

  // Body
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.65, '#e8e8e8')
  g.addColorStop(1, '#b0b0b0')
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, PI2)
  ctx.fillStyle = g
  ctx.fill()
  ctx.restore()

  // Pentagon patches
  for (let p = 0; p < 5; p++) {
    const a0 = (p / 5) * PI2 - Math.PI / 2
    ctx.save()
    ctx.translate(Math.cos(a0) * r * 0.42, Math.sin(a0) * r * 0.42)
    ctx.beginPath()
    for (let v = 0; v < 5; v++) {
      const va = (v / 5) * PI2 - Math.PI / 2
      const px = Math.cos(va) * r * 0.2
      const py = Math.sin(va) * r * 0.2
      v === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fillStyle = '#111'
    ctx.fill()
    ctx.restore()
  }

  // Center patch
  ctx.beginPath()
  for (let v = 0; v < 5; v++) {
    const va = (v / 5) * PI2 - Math.PI / 2
    const px = Math.cos(va) * r * 0.2
    const py = Math.sin(va) * r * 0.2
    v === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = '#0a0a0a'
  ctx.fill()

  // Shine
  ctx.beginPath()
  ctx.ellipse(-r * 0.28, -r * 0.28, r * 0.22, r * 0.14, -Math.PI / 4, 0, PI2)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fill()

  ctx.restore()
}

// ── Bill drawing ─────────────────────────────────────────────────────────────
function drawBill(ctx, x, y, w, h, angle, color, label, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.rotate(angle)

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 8

  // Body
  ctx.beginPath()
  ctx.roundRect(-w / 2, -h / 2, w, h, 5)
  ctx.fillStyle = color
  ctx.fill()

  ctx.shadowBlur = 0

  // Inner border
  ctx.beginPath()
  ctx.roundRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 3)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Value text
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `bold ${h * 0.44}px "Anton", Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 0, 0)

  // Corner labels
  ctx.font = `${h * 0.22}px Arial`
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.textAlign = 'left'
  ctx.fillText(label, -w / 2 + 5, -h / 2 + 7)
  ctx.textAlign = 'right'
  ctx.fillText(label, w / 2 - 5, h / 2 - 7)

  ctx.restore()
}

// ── Spark drawing ─────────────────────────────────────────────────────────────
function drawSpark(ctx, x, y, r, color) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, PI2)
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = r * 3
  ctx.fill()
  ctx.restore()
}

// ── Main component ───────────────────────────────────────────────────────────
export default function MarketSmash() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf

    // Responsive sizing
    function resize() {
      const parent = canvas.parentElement
      canvas.width  = parent.clientWidth
      canvas.height = parent.clientHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)

    // ── State ─────────────────────────────────────────────────────────────────
    const state = { t: 0, phase: 'idle', impactX: 0, impactY: 0, flash: 0 }

    // Ball
    const ball = { x: 0, y: 0, vx: 0, vy: 0, angle: 0, r: 0, trail: [] }

    // Bills
    let bills = []
    let sparks = []

    function buildBills() {
      const cw = canvas.width, ch = canvas.height
      const cx = cw * 0.64, cy = ch * 0.56
      bills = Array.from({ length: NUM_BILLS }, (_, i) => ({
        homeX: cx + rand(-18, 18),
        homeY: cy - i * 5 + rand(-3, 3),
        homeAngle: rand(-0.15, 0.15),
        x: cx + rand(-18, 18),
        y: cy - i * 5,
        vx: 0, vy: 0,
        angle: rand(-0.15, 0.15),
        va: 0,
        w: rand(68, 90),
        h: rand(38, 46),
        color: BILL_COLORS[i % BILL_COLORS.length],
        label: BILL_VALUES[i % BILL_VALUES.length],
        alpha: 1,
      }))
    }

    function resetBall() {
      const cw = canvas.width, ch = canvas.height
      ball.r = clamp(cw * 0.055, 22, 44)
      ball.x = -ball.r * 2
      ball.y = ch * 0.56
      ball.vx = cw * 0.012
      ball.vy = 0
      ball.angle = 0
      ball.trail = []
    }

    function launchCycle() {
      buildBills()
      resetBall()
      state.phase = 'approach'
      state.t = 0
      state.flash = 0
    }

    function spawnSparks(x, y, count) {
      for (let i = 0; i < count; i++) {
        const ang = rand(0, PI2)
        const spd = rand(2, 9)
        sparks.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - rand(1, 4),
          r: rand(2, 5),
          life: 1,
          decay: rand(0.03, 0.07),
          color: rand(0, 1) > 0.5 ? '#22c55e' : '#f59e0b',
        })
      }
    }

    // ── Draw ──────────────────────────────────────────────────────────────────
    function draw(ts) {
      const cw = canvas.width, ch = canvas.height
      state.t += 0.016

      // Background
      ctx.clearRect(0, 0, cw, ch)
      const bg = ctx.createLinearGradient(0, 0, cw, ch)
      bg.addColorStop(0, '#070b14')
      bg.addColorStop(1, '#0a1020')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, cw, ch)

      // Glow behind bill pile
      if (state.phase !== 'idle') {
        const gx = bills[0]?.homeX ?? cw * 0.64
        const gy = bills[0]?.homeY ?? ch * 0.56
        const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, cw * 0.25)
        gr.addColorStop(0, 'rgba(34,197,94,0.08)')
        gr.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gr
        ctx.fillRect(0, 0, cw, ch)
      }

      // ── Ball trail ──
      ball.trail.unshift({ x: ball.x, y: ball.y })
      if (ball.trail.length > 10) ball.trail.pop()
      ball.trail.forEach((p, i) => {
        const a = (1 - i / ball.trail.length) * 0.18
        ctx.beginPath()
        ctx.arc(p.x, p.y, ball.r * (1 - i * 0.06), 0, PI2)
        ctx.fillStyle = `rgba(34,197,94,${a})`
        ctx.fill()
      })

      // ── Phase logic ──
      if (state.phase === 'approach') {
        ball.x += ball.vx
        ball.angle -= ball.vx / ball.r

        const impactX = bills[0]?.homeX ?? cw * 0.64
        if (ball.x >= impactX - ball.r * 0.5) {
          // IMPACT
          state.phase = 'scatter'
          state.flash = 1
          state.impactX = ball.x
          state.impactY = ball.y
          spawnSparks(ball.x, ball.y, 28)

          // Scatter bills
          bills.forEach((b, i) => {
            const ang = rand(-Math.PI * 0.9, Math.PI * 0.15) - Math.PI / 2 + rand(-0.8, 0.8)
            const spd = rand(5, 14)
            b.vx = Math.cos(ang) * spd + rand(1, 4)
            b.vy = Math.sin(ang) * spd - rand(2, 6)
            b.va = rand(-0.18, 0.18)
          })

          // Ball recoil
          ball.vx = -ball.vx * 0.4
          ball.vy = -3
        }
      }

      if (state.phase === 'scatter') {
        // Move ball
        ball.x += ball.vx
        ball.y += ball.vy
        ball.vy += 0.18
        ball.vx *= 0.97
        ball.angle -= ball.vx / ball.r

        // Move bills with gravity
        let allStopped = true
        bills.forEach(b => {
          b.x += b.vx
          b.y += b.vy
          b.vy += 0.28
          b.angle += b.va
          b.vx *= 0.97
          b.va *= 0.96

          // Floor
          if (b.y > ch + 80) {
            b.vy = 0; b.vx = 0; b.va = 0
          } else {
            allStopped = false
          }
        })

        state.t += 0.016
        if (state.t > 2.2) {
          state.phase = 'reset'
          state.t = 0
        }
      }

      if (state.phase === 'reset') {
        state.t += 0.016
        const progress = clamp(state.t / 1.2, 0, 1)
        const eased = 1 - Math.pow(1 - progress, 3)

        // Return bills home
        bills.forEach(b => {
          b.x = lerp(b.x, b.homeX, eased * 0.06)
          b.y = lerp(b.y, b.homeY, eased * 0.06)
          b.angle = lerp(b.angle, b.homeAngle, eased * 0.06)
        })

        // Reset ball off-screen
        ball.x = lerp(ball.x, -ball.r * 3, eased * 0.08)

        if (state.t > 1.8) launchCycle()
      }

      // ── Draw bills (bottom to top = pile) ──
      if (state.phase !== 'idle') {
        bills.forEach(b => {
          drawBill(ctx, b.x, b.y, b.w, b.h, b.angle, b.color, b.label)
        })
      }

      // ── Draw ball ──
      if (state.phase !== 'idle' && ball.x > -ball.r * 3) {
        drawBall(ctx, ball.x, ball.y, ball.r, ball.angle)
      }

      // ── Sparks ──
      sparks = sparks.filter(s => s.life > 0)
      sparks.forEach(s => {
        s.x += s.vx; s.y += s.vy
        s.vy += 0.15
        s.vx *= 0.96
        s.life -= s.decay
        drawSpark(ctx, s.x, s.y, s.r * s.life, s.color)
      })

      // ── Impact flash ──
      if (state.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${state.flash * 0.35})`
        ctx.fillRect(0, 0, cw, ch)
        state.flash -= 0.08
      }

      raf = requestAnimationFrame(draw)
    }

    // Pause when off-screen
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) launchCycle()
      else state.phase = 'idle'
    }, { threshold: 0.1 })
    observer.observe(canvas)

    launchCycle()
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      observer.disconnect()
    }
  }, [])

  return (
    <div className="msh-wrap">
      <canvas ref={canvasRef} className="msh-canvas" />
      <div className="msh-overlay">
        <span className="msh-tag">MERCADO VERANO 2026</span>
        <h2 className="msh-title">El mercado<br /><em>revienta.</em></h2>
        <p className="msh-sub">53 fichajes · 2.131 M€ movidos · Rumores en tiempo real</p>
      </div>
    </div>
  )
}
