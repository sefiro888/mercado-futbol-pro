import Icon from './Icon.jsx'
import ReliabilityBadge from './ReliabilityBadge.jsx'
import { getSourceAccuracyRanking } from '@/lib/data.js'
import './SourceRanking.css'

// Ranking de fiabilidad REAL de las fuentes: cruza cada rumor publicado con lo
// que acabó pasando en el mercado (traspasos confirmados) y calcula el % de
// acierto de cada medio. Nadie mantiene esto a mano: sale solo de los datos.
export default function SourceRanking() {
  const rows = getSourceAccuracyRanking()

  return (
    <div className="card source-ranking">
      <div className="sr-head">
        <h3><Icon name="trophy" size={18} /> ¿Quién acierta más?</h3>
        <p className="muted">
          Cruzamos cada rumor con los fichajes que se confirmaron después.
          El porcentaje solo cuenta rumores ya resueltos (cumplidos o fallidos).
        </p>
      </div>

      <ul className="sr-list">
        {rows.map((row, i) => (
          <li key={row.source.id}>
            <span className={`sr-rank ${i < 3 && row.accuracy != null ? 'top3' : ''}`}>{i + 1}</span>
            <span className="sr-main">
              <span className="sr-name">
                {row.source.name}
                <ReliabilityBadge level={row.source.reliabilityLevel} />
              </span>
              <span className="sr-meta">
                {row.hits} acierto{row.hits === 1 ? '' : 's'} · {row.misses} fallo{row.misses === 1 ? '' : 's'} · {row.pending} pendiente{row.pending === 1 ? '' : 's'}
              </span>
              <span className="sr-bar" aria-hidden="true">
                <span
                  className="sr-bar-fill"
                  style={{ width: row.accuracy != null ? `${Math.round(row.accuracy * 100)}%` : '0%' }}
                />
              </span>
            </span>
            <span className="sr-score">
              {row.accuracy != null ? `${Math.round(row.accuracy * 100)}%` : '—'}
            </span>
          </li>
        ))}
      </ul>

      <p className="sr-foot dim">
        «—» significa que la fuente aún no tiene rumores resueltos. El ranking mejora
        con cada ventana de mercado.
      </p>
    </div>
  )
}
