import { useState, useEffect } from 'react'
import './DeadlineCountdown.css'

export default function DeadlineCountdown() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const deadline = new Date('2026-08-31T23:59:59').getTime()
    const now = new Date().getTime()
    const diff = deadline - now

    if (diff <= 0) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00', expired: true }
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24))
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const m = Math.floor((diff / (1000 * 60)) % 60)
    const s = Math.floor((diff / 1000) % 60)

    const pad = (num) => String(num).padStart(2, '0')

    return {
      days: pad(d),
      hours: pad(h),
      minutes: pad(m),
      seconds: pad(s),
      expired: false,
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const marketStart = new Date('2026-06-01T00:00:00').getTime()
  const marketEnd = new Date('2026-08-31T23:59:59').getTime()
  const totalDuration = marketEnd - marketStart
  const elapsed = Date.now() - marketStart
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

  return (
    <div className="deadline-countdown-container">
      <div className="dc-meta">
        <span className="dc-live-indicator">
          <span className="dc-live-dot"></span>
          TIEMPO REAL
        </span>
        <span className="dc-label">CUENTA ATRÁS · CIERRE DE MERCADO</span>
      </div>

      <div className="dc-timer">
        <div className="dc-slot">
          <span className="dc-num num">{timeLeft.days}</span>
          <span className="dc-unit">DÍAS</span>
        </div>
        <span className="dc-divider">:</span>
        <div className="dc-slot">
          <span className="dc-num num">{timeLeft.hours}</span>
          <span className="dc-unit">HORAS</span>
        </div>
        <span className="dc-divider">:</span>
        <div className="dc-slot">
          <span className="dc-num num">{timeLeft.minutes}</span>
          <span className="dc-unit">MINS</span>
        </div>
        <span className="dc-divider">:</span>
        <div className="dc-slot">
          <span className="dc-num num">{timeLeft.seconds}</span>
          <span className="dc-unit">SEGS</span>
        </div>
      </div>

      {/* Barra de progreso del mercado */}
      <div className="dc-progress-container">
        <div className="dc-progress-bar" style={{ '--progress-val': `${progressPct}%` }}>
          <div className="dc-progress-glow" />
        </div>
        <div className="dc-progress-labels">
          <span>Apertura (1 Jun)</span>
          <span className="num">{progressPct.toFixed(1)}% completado</span>
          <span>Cierre (31 Ago)</span>
        </div>
      </div>

      <div className="dc-target-label">Límite oficial: 31 de Agosto de 2026, 23:59 CET</div>
    </div>
  )
}
