import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { initData } from '@/lib/data'
import './styles/index.css'
import './styles/football-theme.css'

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
}

// Carga el origen de datos (demo o Supabase) antes de pintar. initData() nunca
// lanza: ante cualquier problema conserva los datos demo, así que la app siempre
// arranca.
initData()
  .then((info) => {
    if (info?.source === 'supabase') {
      console.info('[data] Datos cargados desde Supabase.')
    }
  })
  .finally(renderApp)
