// =============================================================================
// Iconos SVG de línea (heredan el color del texto vía currentColor).
//
// Sustituyen a los emojis, que en Windows se ven en blanco y negro o rotos
// (ver memoria del proyecto). Al ser SVG, se ven idénticos en Windows, Mac,
// Android e iOS, y escalan sin perder nitidez.
//
// Uso: <Icon name="search" />  ·  <Icon name="ball" size={22} />
// Por defecto son decorativos (aria-hidden). Pasa `title` para darles etiqueta.
// =============================================================================

const PATHS = {
  // Balón de fútbol (marca).
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.3l4.3 3.1-1.6 5.1H9.3L7.7 10.4z" />
      <path d="M12 3.2v4.1M4 9.6l3.7 1M20 9.6l-3.7 1M7 18.7l2.3-3.2M17 18.7l-2.3-3.2" />
    </>
  ),
  // Menú hamburguesa.
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  // Cerrar.
  close: <path d="M6 6l12 12M18 6L6 18" />,
  // Lupa de búsqueda.
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-3.6-3.6" />
    </>
  ),
  // Controles de filtro (sliders).
  sliders: (
    <>
      <path d="M4 7h9M18.5 7H20" />
      <circle cx="15.5" cy="7" r="2.2" />
      <path d="M4 17h2.5M11.5 17H20" />
      <circle cx="8.5" cy="17" r="2.2" />
    </>
  ),
  // Estadio / recinto.
  stadium: (
    <>
      <path d="M3 8.6C3 6.6 7 5 12 5s9 1.6 9 3.6v6.8C21 17.4 17 19 12 19s-9-1.6-9-3.6z" />
      <ellipse cx="12" cy="8.6" rx="9" ry="3.6" />
      <ellipse cx="12" cy="8.6" rx="3.6" ry="1.4" />
    </>
  ),
  // Entrenador (persona).
  coach: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  // Periódico / noticia.
  newspaper: (
    <>
      <path d="M4 5.5h12.5a1 1 0 0 1 1 1V18a1.5 1.5 0 0 1-1.5 1.5H6A2 2 0 0 1 4 17.5z" />
      <path d="M17.5 9H20a1 1 0 0 1 1 1v7.5A1.5 1.5 0 0 1 19.5 19" />
      <path d="M7 9h7M7 12.5h7M7 16h4" />
    </>
  ),
  // Aviso (triángulo).
  warning: (
    <>
      <path d="M12 4.2l9 15.6H3z" />
      <path d="M12 10v4.2" />
      <path d="M12 17.4h.01" />
    </>
  ),
  // Globo terráqueo (fallback de bandera).
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" />
    </>
  ),
  // Llama (rumor caliente). Relleno para destacar.
  flame: (
    <path
      d="M12 2.5c.4 2.7 2 4 3.3 5.6C16.4 9.4 17 10.9 17 12.6a5 5 0 0 1-10 0c0-1.6.6-2.9 1.6-4 .1 1.2.8 2 1.7 2.2C9.6 8.9 10 6 12 2.5z"
      fill="currentColor"
      stroke="none"
    />
  ),
  // Estrella (jugador estrella). Rellena.
  star: (
    <path
      d="M12 3.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.6 9.3l5.8-.8z"
      fill="currentColor"
      stroke="none"
    />
  ),
  // Entrada (fichaje que llega).
  'arrow-in': <path d="M12 4v12M6 12l6 6 6-6M5 20h14" />,
  // Salida (venta).
  'arrow-out': <path d="M12 20V8M6 12l6-6 6 6M5 4h14" />,
  // Camiseta (jugador).
  jersey: (
    <path d="M8.5 4l-4 2.5 2 3.5 1.5-1V20h8V9l1.5 1 2-3.5L15.5 4a3.5 3.5 0 0 1-7 0z" />
  ),
  // Billete con símbolo € (valor / dinero).
  money: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M14.6 9.6a3 3 0 1 0 0 4.8M8.2 11h4.2M8.2 13h4.2" />
    </>
  ),
  // Calendario (edad / contrato / fecha).
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.2v3.6M16 3.2v3.6" />
    </>
  ),
  // Reloj (tiempo / edad).
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.4V12l3 1.8" />
    </>
  ),
  // Trofeo (ranking / palmarés).
  trophy: (
    <>
      <path d="M7 4.5h10v3.5a5 5 0 0 1-10 0z" />
      <path d="M7 5.5H4.4a2.4 2.4 0 0 0 2.6 4M17 5.5h2.6a2.4 2.4 0 0 1-2.6 4" />
      <path d="M12 13v3M9.5 20h5M10.2 20l.4-2.3h2.8l.4 2.3" />
    </>
  ),
  // Silbato (árbitro).
  whistle: (
    <>
      <path d="M3 11.5a4 4 0 0 1 4-4h8.5l5-2v5.5a4.5 4.5 0 0 1-4.5 4.5H7a4 4 0 0 1-4-4z" />
      <circle cx="8" cy="11.5" r="2.1" />
    </>
  ),
  // Portería con red (gol).
  goal: (
    <>
      <path d="M3.5 20V7.5h17V20" />
      <path d="M3.5 7.5h17" />
      <path d="M7.8 7.5V20M12 7.5V20M16.2 7.5V20M3.5 11.7h17M3.5 15.8h17" strokeOpacity="0.55" />
    </>
  ),
  // Tarjeta (amonestación).
  card: <rect x="8.5" y="3.5" width="8.5" height="13" rx="1.4" transform="rotate(14 12 10)" />,
  // Bota de fútbol.
  boot: (
    <>
      <path d="M3.5 7h6.5l1 4.5 7 1.8a2.8 2.8 0 0 1 2 2.7V18H5a1.5 1.5 0 0 1-1.5-1.5z" />
      <path d="M6.5 18v1.6M10 18v1.6M13.5 18v1.6M17 18v1.6" />
    </>
  ),
  // Escudo (club / defensa).
  shield: <path d="M12 3.2l7 2.4v5.2c0 4.3-2.9 7.4-7 9-4.1-1.6-7-4.7-7-9V5.6z" />,
  // Persona (jugador / plantilla).
  person: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  // Apretón de manos (fichaje / acuerdo).
  handshake: (
    <>
      <path d="M2.5 8.5l4-1.2 3.5 2 2-1 5.5 1.2" />
      <path d="M6.5 7.3v6.2a1.8 1.8 0 0 0 2.7 1.6l2.8-1.6 2.6 1.6a1.8 1.8 0 0 0 2.9-1.5V8.5" />
    </>
  ),
  // Silueta de futbolista (rellena) — marca de agua del cromo.
  footballer: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 1.6a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM9.4 7.7c-.66 0-1.24.43-1.45 1.05L6.2 13.6l1.86.74 1.3-3.34.5 3.46-1.1 7.34a.95.95 0 0 0 1.88.28l1.0-5.9h.72l1.0 5.9a.95.95 0 0 0 1.88-.28l-1.1-7.34.5-3.46 1.3 3.34 1.86-.74-1.75-4.85a1.54 1.54 0 0 0-1.45-1.05z"
    />
  ),
}

export default function Icon({ name, size = 20, title, className = '', ...rest }) {
  const path = PATHS[name]
  if (!path) return null

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {path}
    </svg>
  )
}
