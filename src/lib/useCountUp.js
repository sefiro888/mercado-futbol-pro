import { useEffect, useRef, useState } from 'react'

// Anima un número desde 0 hasta `end` cuando el elemento entra en pantalla.
// Sin librerías: usa requestAnimationFrame + IntersectionObserver.
// Respeta "prefers-reduced-motion" (muestra el valor final al instante).
//
// Devuelve [ref, value]: pon el ref en el elemento y muestra `value`.
export function useCountUp(end, { duration = 1100, decimals = 0 } = {}) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) {
      setValue(end)
      return
    }

    let raf = 0
    let start = 0

    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // easeOutCubic para un frenado suave y satisfactorio.
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(end * eased)
      if (progress < 1) raf = requestAnimationFrame(animate)
      else setValue(end)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(animate)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [end, duration])

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value)
  return [ref, display]
}
