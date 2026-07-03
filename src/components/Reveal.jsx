import { useEffect, useRef, useState } from 'react'

// Anima la entrada de un bloque cuando aparece en pantalla (scroll reveal).
// Sin librerías: usa IntersectionObserver. Respeta "prefers-reduced-motion"
// porque la animación está definida con transiciones que el CSS puede anular.
//
// props:
//  - delay: retardo en ms antes de animar (para escalonar bloques)
//  - stagger: si true, también escalona la entrada de los hijos directos
export default function Reveal({ children, delay = 0, stagger = false, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Si ya está en pantalla al montar, anímalo igualmente.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${stagger ? 'stagger' : ''} ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
