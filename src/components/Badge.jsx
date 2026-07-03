// Badge genérico. Los badges específicos (estado, fiabilidad, fuente) lo reutilizan.
// El "tone" mapea a las clases .tone-* definidas en el sistema de diseño.

export default function Badge({ tone = 'neutral', children, title, dot = true }) {
  return (
    <span className={`badge tone-${tone}`} title={title}>
      {dot && <span className="dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
