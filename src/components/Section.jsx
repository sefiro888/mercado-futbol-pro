import Reveal from './Reveal.jsx'

// Bloque de sección reutilizable con título y contenido.
// Se revela con animación al entrar en pantalla (scroll reveal).
// Si no hay hijos relevantes, muestra un estado vacío discreto.
export default function Section({ title, action, children, empty }) {
  return (
    <Reveal>
      <section className="profile-section">
        <div className="section-head">
          <h2>{title}</h2>
          {action}
        </div>
        {empty ? <p className="muted">{empty}</p> : children}
      </section>
    </Reveal>
  )
}
