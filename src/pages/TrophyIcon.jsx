// Trofeos SVG ilustrados para cada competición
// Champions = Big Ears (UEFA), Eurocopa = Henri Delaunay, Libertadores = Copa Libertadores

export function TrophyChampions({ size = 120, accent = '#00b4d8' }) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg" style={{ filter: `drop-shadow(0 0 18px ${accent}80)` }}>
      {/* Base escalonada */}
      <rect x="28" y="118" width="44" height="8" rx="2" fill={accent} opacity="0.9"/>
      <rect x="32" y="112" width="36" height="7" rx="1.5" fill={accent} opacity="0.8"/>
      {/* Pie */}
      <rect x="40" y="100" width="20" height="13" rx="1" fill={accent} opacity="0.7"/>
      {/* Cuerpo de la copa */}
      <path d="M35 55 Q33 80 40 100 L60 100 Q67 80 65 55 Z" fill={accent} opacity="0.85"/>
      {/* Copa superior */}
      <path d="M30 30 Q28 45 35 55 L65 55 Q72 45 70 30 Z" fill={accent}/>
      {/* Borde superior de la copa */}
      <ellipse cx="50" cy="30" rx="20" ry="5" fill={accent}/>
      <ellipse cx="50" cy="30" rx="16" ry="3.5" fill="#0e141f"/>
      {/* Asa izquierda — "Big Ears" */}
      <path d="M30 35 Q10 30 12 55 Q13 70 30 65" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round"/>
      {/* Asa derecha — "Big Ears" */}
      <path d="M70 35 Q90 30 88 55 Q87 70 70 65" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round"/>
      {/* Estrellas decorativas */}
      <text x="50" y="48" textAnchor="middle" fontSize="10" fill="#fff" opacity="0.9">★★★</text>
      {/* Brillo */}
      <path d="M38 35 Q42 28 46 34" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function TrophyEurocopa({ size = 120, accent = '#4f8ef7' }) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg" style={{ filter: `drop-shadow(0 0 18px ${accent}80)` }}>
      {/* Base escalonada */}
      <rect x="25" y="118" width="50" height="8" rx="3" fill={accent} opacity="0.9"/>
      <rect x="30" y="111" width="40" height="8" rx="2" fill={accent} opacity="0.8"/>
      {/* Pie cilíndrico */}
      <rect x="38" y="98" width="24" height="14" rx="2" fill={accent} opacity="0.75"/>
      {/* Cuerpo rectangular de la copa */}
      <path d="M32 55 Q30 75 38 98 L62 98 Q70 75 68 55 Z" fill={accent} opacity="0.85"/>
      {/* Copa superior */}
      <path d="M28 28 Q26 42 32 55 L68 55 Q74 42 72 28 Z" fill={accent}/>
      {/* Borde superior */}
      <rect x="26" y="23" width="48" height="6" rx="3" fill={accent}/>
      {/* Asas laterales pequeñas — estilo Delaunay */}
      <path d="M32 38 Q20 38 20 50 Q20 62 32 62" fill="none" stroke={accent} strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M68 38 Q80 38 80 50 Q80 62 68 62" fill="none" stroke={accent} strokeWidth="4.5" strokeLinecap="round"/>
      {/* Detalle central: escudo estrellas */}
      <circle cx="50" cy="42" r="10" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <text x="50" y="46" textAnchor="middle" fontSize="9" fill="#fff" opacity="0.95">★★</text>
      {/* Brillo */}
      <path d="M35 32 Q38 26 42 31" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function TrophyLibertadores({ size = 120, accent = '#f59e0b' }) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg" style={{ filter: `drop-shadow(0 0 18px ${accent}80)` }}>
      {/* Base cuadrada ornamentada */}
      <rect x="22" y="118" width="56" height="8" rx="2" fill={accent} opacity="0.9"/>
      <rect x="27" y="111" width="46" height="8" rx="1.5" fill={accent} opacity="0.8"/>
      <rect x="33" y="104" width="34" height="8" rx="1" fill={accent} opacity="0.75"/>
      {/* Pie */}
      <rect x="39" y="94" width="22" height="11" rx="1" fill={accent} opacity="0.7"/>
      {/* Cuerpo de la copa — más estrecho en el medio */}
      <path d="M36 60 Q33 76 39 94 L61 94 Q67 76 64 60 Z" fill={accent} opacity="0.85"/>
      {/* Copa — esfera superior */}
      <ellipse cx="50" cy="48" rx="18" ry="14" fill={accent}/>
      {/* Cintura */}
      <rect x="44" y="60" width="12" height="6" rx="1" fill={accent} opacity="0.9"/>
      {/* Asas curvas ornamentadas */}
      <path d="M32 52 Q18 44 20 56 Q22 68 36 64" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round"/>
      <path d="M68 52 Q82 44 80 56 Q78 68 64 64" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round"/>
      {/* Detalle central */}
      <circle cx="50" cy="48" r="9" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
      <text x="50" y="52" textAnchor="middle" fontSize="8" fill="#fff" opacity="0.95">★</text>
      {/* Ornamentos asas */}
      <circle cx="20" cy="56" r="2.5" fill={accent}/>
      <circle cx="80" cy="56" r="2.5" fill={accent}/>
      {/* Brillo */}
      <path d="M38 40 Q42 34 46 40" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
