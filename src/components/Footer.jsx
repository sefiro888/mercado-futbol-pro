import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { SITE } from '@/config/site.js'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">{SITE.name}</div>
          <p className="muted">{SITE.description}</p>
          <p className="demo-note"><Icon name="warning" size={15} /> {SITE.demoNotice}</p>
        </div>

        <div>
          <h4>Secciones</h4>
          <ul>
            {SITE.nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Compromiso editorial</h4>
          <ul className="muted">
            <li>No copiamos noticias completas.</li>
            <li>Solo resumen propio, fecha, fuente y enlace.</li>
            <li>Rumores clasificados por fiabilidad.</li>
            <li>Sin logos reales sin licencia.</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {year} {SITE.name}. Proyecto de demostración.</span>
        <span className="muted">Hecho con React + Vite.</span>
      </div>
    </footer>
  )
}
