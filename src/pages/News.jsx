import { useEffect, useMemo, useState } from 'react'
import NewsCard from '@/components/NewsCard.jsx'
import FilterPanel from '@/components/FilterPanel.jsx'
import Icon from '@/components/Icon.jsx'
import { setPageSeo } from '@/lib/seo.js'
import { NEWS_CATEGORY, RELIABILITY } from '@/lib/taxonomy.js'
import { getAllNews } from '@/lib/data.js'
import './Pages.css'

const CATEGORY_OPTIONS = Object.entries(NEWS_CATEGORY).map(([value, v]) => ({ value, label: v.label }))
const RELIABILITY_OPTIONS = Object.entries(RELIABILITY).map(([value, v]) => ({ value, label: v.label }))

const EMPTY = { q: '', category: '', reliability: '' }

export default function News() {
  const [filters, setFilters] = useState(EMPTY)

  useEffect(() => {
    setPageSeo({
      title: 'Noticias de fútbol',
      description: 'Resúmenes propios de noticias de fútbol con su fuente, fecha y enlace original. Sin copiar el contenido completo de los medios.',
    })
  }, [])

  const allNews = useMemo(() => getAllNews(), [])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return allNews.filter((n) => {
      if (filters.category && n.category !== filters.category) return false
      if (filters.reliability && n.reliability !== filters.reliability) return false
      if (q && !(`${n.title} ${n.summary}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [allNews, filters])

  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const fields = [
    { type: 'text', name: 'q', label: 'Buscar', placeholder: 'Título o resumen…' },
    { type: 'select', name: 'category', label: 'Categoría', options: CATEGORY_OPTIONS },
    { type: 'select', name: 'reliability', label: 'Fiabilidad', options: RELIABILITY_OPTIONS },
  ]

  return (
    <>
      <div className="container page-header">
        <Icon name="newspaper" size={150} className="page-watermark" />
        <h1>Noticias</h1>
        <p>
          Mostramos un <strong>resumen propio</strong> de cada noticia con su medio, fecha y
          enlace a la fuente original. No reproducimos el contenido completo de los medios.
        </p>
        <p className="demo-banner"><Icon name="warning" size={16} /> Resúmenes propios sobre hechos reales; algunas noticias son ejemplos ilustrativos de mercado.</p>
      </div>

      <div className="container section">
        <div className="list-layout">
          <FilterPanel
            fields={fields}
            values={filters}
            onChange={set}
            onReset={() => setFilters(EMPTY)}
            resultCount={filtered.length}
          />

          <div>
            {filtered.length > 0 ? (
              <div className="grid grid-auto">
                {filtered.map((n) => <NewsCard key={n.id} item={n} />)}
              </div>
            ) : (
              <div className="empty-state">No hay noticias que coincidan con los filtros.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
