import { useState, useEffect } from 'react'

const KEY = 'mfp_theme'

function getStored() {
  return localStorage.getItem(KEY) ?? 'dark'
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [theme, setTheme] = useState(getStored)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(KEY, theme)
  }, [theme])

  // Aplicar en la carga inicial antes de que React hidrate
  useEffect(() => {
    applyTheme(getStored())
  }, [])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle, isDark: theme === 'dark' }
}
