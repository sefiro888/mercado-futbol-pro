import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import './PremiumHeader.css'

export default function PremiumHeader({ title, description, banner, tag, icon = 'ball', theme = 'market' }) {
  return (
    <div className={`container premium-header theme-${theme}`}>
      {/* Elemento decorativo a la izquierda (HUD Telemetry de editor profesional) */}
      <div className="header-deco-wrap">
        {icon === 'ball' && (
          <svg viewBox="0 0 200 200" className="header-deco-svg radar-hud-svg">
            <defs>
              <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="url(#radar-glow)" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" />
            <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
            <line x1="36" y1="36" x2="164" y2="164" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="36" y1="164" x2="164" y2="36" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
            <polygon points="100,30 148,68 152,120 100,150 55,130 52,70" fill="rgba(16, 185, 129, 0.18)" stroke="#10b981" strokeWidth="2.5" />
            <circle cx="100" cy="30" r="4" fill="#34d399" filter="drop-shadow(0 0 4px #10b981)" />
            <circle cx="148" cy="68" r="4" fill="#34d399" filter="drop-shadow(0 0 4px #10b981)" />
            <circle cx="152" cy="120" r="4" fill="#34d399" filter="drop-shadow(0 0 4px #10b981)" />
            <circle cx="100" cy="150" r="4" fill="#34d399" filter="drop-shadow(0 0 4px #10b981)" />
            <circle cx="55" cy="130" r="4" fill="#34d399" filter="drop-shadow(0 0 4px #10b981)" />
            <circle cx="52" cy="70" r="4" fill="#34d399" filter="drop-shadow(0 0 4px #10b981)" />
            <text x="100" y="22" fontFamily="var(--font-mono)" fontSize="8" fill="rgba(255, 255, 255, 0.45)" textAnchor="middle">PAC</text>
            <text x="162" y="66" fontFamily="var(--font-mono)" fontSize="8" fill="rgba(255, 255, 255, 0.45)" textAnchor="start">SHO</text>
            <text x="162" y="128" fontFamily="var(--font-mono)" fontSize="8" fill="rgba(255, 255, 255, 0.45)" textAnchor="start">PAS</text>
            <text x="100" y="165" fontFamily="var(--font-mono)" fontSize="8" fill="rgba(255, 255, 255, 0.45)" textAnchor="middle">DRI</text>
            <text x="38" y="128" fontFamily="var(--font-mono)" fontSize="8" fill="rgba(255, 255, 255, 0.45)" textAnchor="end">DEF</text>
            <text x="38" y="66" fontFamily="var(--font-mono)" fontSize="8" fill="rgba(255, 255, 255, 0.45)" textAnchor="end">PHY</text>
          </svg>
        )}

        {icon === 'flame' && (
          <svg viewBox="0 0 200 200" className="header-deco-svg rumours-hud-svg">
            <defs>
              <linearGradient id="vol-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ea580c" stopOpacity="0" />
                <stop offset="50%" stopColor="#fb923c" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#fb923c" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <line x1="20" y1="40" x2="180" y2="40" stroke="rgba(251, 146, 60, 0.1)" strokeWidth="1" />
            <line x1="20" y1="80" x2="180" y2="80" stroke="rgba(251, 146, 60, 0.1)" strokeWidth="1" />
            <line x1="20" y1="120" x2="180" y2="120" stroke="rgba(251, 146, 60, 0.1)" strokeWidth="1" />
            <line x1="20" y1="160" x2="180" y2="160" stroke="rgba(251, 146, 60, 0.1)" strokeWidth="1" />
            <line x1="50" y1="20" x2="50" y2="180" stroke="rgba(251, 146, 60, 0.1)" strokeWidth="1" />
            <line x1="90" y1="20" x2="90" y2="180" stroke="rgba(251, 146, 60, 0.1)" strokeWidth="1" />
            <line x1="130" y1="20" x2="130" y2="180" stroke="rgba(251, 146, 60, 0.1)" strokeWidth="1" />
            <line x1="170" y1="20" x2="170" y2="180" stroke="rgba(251, 146, 60, 0.1)" strokeWidth="1" />
            <line x1="40" y1="110" x2="40" y2="160" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="34" y="120" width="12" height="30" fill="#ea580c" rx="1" />
            <line x1="75" y1="80" x2="75" y2="140" stroke="#fb923c" strokeWidth="1.5" />
            <rect x="69" y="90" width="12" height="35" fill="#fb923c" rx="1" />
            <line x1="110" y1="50" x2="110" y2="110" stroke="#fb923c" strokeWidth="1.5" />
            <rect x="104" y="60" width="12" height="30" fill="#fb923c" rx="1" />
            <line x1="145" y1="20" x2="145" y2="90" stroke="#fff" strokeWidth="2" filter="drop-shadow(0 0 4px #fb923c)" />
            <rect x="138" y="30" width="14" height="45" fill="#fff" rx="1.5" filter="drop-shadow(0 0 6px rgba(255,255,255,0.8))" />
            <path d="M20,150 Q55,140 75,100 T110,80 T145,45 T180,70" fill="none" stroke="#ea580c" strokeWidth="2.5" />
            <path d="M20,150 Q55,140 75,100 T110,80 T145,45 T180,70 L180,180 L20,180 Z" fill="url(#vol-grad)" />
            <circle cx="145" cy="45" r="5" fill="#fff" filter="drop-shadow(0 0 8px #fff)" />
            <text x="154" y="42" fontFamily="var(--font-mono)" fontSize="7" fontWeight="bold" fill="#fff">VOLATILITY PEAK</text>
            <text x="22" y="32" fontFamily="var(--font-mono)" fontSize="6" fill="rgba(255,255,255,0.3)">INDEX: 99.4</text>
          </svg>
        )}

        {icon === 'shield' && (
          <svg viewBox="0 0 200 200" className="header-deco-svg clubs-hud-svg">
            <defs>
              <linearGradient id="pitch-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="100,30 180,75 180,145 100,185 20,145 20,75" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
            <polygon points="100,60 160,90 100,120 40,90" fill="url(#pitch-grad)" stroke="#38bdf8" strokeWidth="2" />
            <line x1="70" y1="75" x2="130" y2="105" stroke="#38bdf8" strokeWidth="1.5" />
            <ellipse cx="100" cy="90" rx="16" ry="8" fill="none" stroke="rgba(56, 189, 248, 0.7)" strokeWidth="1.5" />
            <polygon points="100,60 115,67.5 100,75 85,67.5" fill="none" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1.5" />
            <polygon points="100,120 115,112.5 100,105 85,112.5" fill="none" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1.5" />
            <circle cx="85" cy="78" r="3" fill="#06b6d4" filter="drop-shadow(0 0 4px #38bdf8)" />
            <circle cx="115" cy="102" r="3" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)" />
            <circle cx="100" cy="90" r="3" fill="#fff" filter="drop-shadow(0 0 6px #fff)" />
            <circle cx="140" cy="95" r="3" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)" />
            <text x="26" y="70" fontFamily="var(--font-mono)" fontSize="6" fill="rgba(255, 255, 255, 0.3)">SYS.4-3-3</text>
            <text x="144" y="152" fontFamily="var(--font-mono)" fontSize="6" fill="rgba(255, 255, 255, 0.3)">GRID: L-74</text>
          </svg>
        )}

        {icon === 'jersey' && (
          <svg viewBox="0 0 200 200" className="header-deco-svg players-hud-svg">
            <defs>
              <radialGradient id="players-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="url(#players-glow)" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(167, 139, 250, 0.15)" strokeWidth="8" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#a78bfa" strokeWidth="8" strokeDasharray="440" strokeDashoffset="70" strokeLinecap="round" filter="drop-shadow(0 0 6px #a78bfa)" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(167, 139, 250, 0.1)" strokeWidth="6" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="#c084fc" strokeWidth="6" strokeDasharray="314" strokeDashoffset="110" strokeLinecap="round" />
            <text x="100" y="108" fontFamily="var(--font-display)" fontSize="28" fontWeight="900" fill="#fff" textAnchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))">92</text>
            <text x="100" y="122" fontFamily="var(--font-mono)" fontSize="8" fill="rgba(255, 255, 255, 0.45)" textAnchor="middle">OVERALL</text>
            <line x1="100" y1="18" x2="100" y2="28" stroke="#a78bfa" strokeWidth="2" />
            <line x1="100" y1="172" x2="100" y2="182" stroke="#a78bfa" strokeWidth="2" />
            <line x1="18" y1="100" x2="28" y2="100" stroke="#a78bfa" strokeWidth="2" />
            <line x1="172" y1="100" x2="182" y2="100" stroke="#a78bfa" strokeWidth="2" />
            <text x="135" y="44" fontFamily="var(--font-mono)" fontSize="6" fill="#a78bfa">PHY 95</text>
            <text x="35" y="160" fontFamily="var(--font-mono)" fontSize="6" fill="#c084fc">PAC 98</text>
          </svg>
        )}

        {icon === 'newspaper' && (
          <svg viewBox="0 0 200 200" className="header-deco-svg news-hud-svg">
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(45, 212, 191, 0.15)" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="80" ry="25" fill="none" stroke="rgba(45, 212, 191, 0.15)" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="25" ry="80" fill="none" stroke="rgba(45, 212, 191, 0.15)" strokeWidth="1" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(45, 212, 191, 0.1)" strokeWidth="1" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(45, 212, 191, 0.1)" strokeWidth="1" />
            <circle cx="50" cy="70" r="3" fill="#2dd4bf" filter="drop-shadow(0 0 4px #2dd4bf)" />
            <circle cx="140" cy="80" r="3.5" fill="#2dd4bf" filter="drop-shadow(0 0 4px #2dd4bf)" />
            <circle cx="105" cy="135" r="3.5" fill="#fff" filter="drop-shadow(0 0 6px #fff)" />
            <circle cx="70" cy="120" r="3" fill="#2dd4bf" filter="drop-shadow(0 0 4px #2dd4bf)" />
            <circle cx="150" cy="130" r="2.5" fill="#2dd4bf" filter="drop-shadow(0 0 4px #2dd4bf)" />
            <path d="M50,70 Q95,50 140,80" fill="none" stroke="rgba(45, 212, 191, 0.6)" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M70,120 Q90,130 105,135" fill="none" stroke="#2dd4bf" strokeWidth="1.5" />
            <path d="M140,80 Q122,110 105,135" fill="none" stroke="#fff" strokeWidth="1.8" filter="drop-shadow(0 0 4px #2dd4bf)" />
            <path d="M50,70 Q60,95 70,120" fill="none" stroke="rgba(45, 212, 191, 0.4)" strokeWidth="1" />
            <text x="146" y="76" fontFamily="var(--font-mono)" fontSize="6" fill="#fff">LDN-HUB</text>
            <text x="36" y="66" fontFamily="var(--font-mono)" fontSize="6" fill="rgba(255, 255, 255, 0.3)">MAD-SRC</text>
            <text x="108" y="146" fontFamily="var(--font-mono)" fontSize="6" fill="#2dd4bf">LIVE CONNECT</text>
          </svg>
        )}
      </div>

      {/* Bloque de texto descriptivo */}
      <div className="premium-header-text">
        <h1>{title}</h1>
        <p>{description}</p>
        {banner && (
          <div className="premium-header-banner">
            <Icon name="warning" size={16} />
            <span>{banner}</span>
          </div>
        )}
      </div>

      {/* Componente decorativo derecho específico para cada sección (nada de plantillas genéricas) */}
      <div className="header-right-visual">
        {theme === 'market' && (
          <svg viewBox="0 0 200 160" className="right-deco-hud briefcase-hud">
            <defs>
              <linearGradient id="case-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="case-trim" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <path d="M75,30 C75,15 125,15 125,30" fill="none" stroke="url(#case-trim)" strokeWidth="6" strokeLinecap="round" />
            <rect x="25" y="30" width="150" height="100" rx="10" fill="url(#case-body)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" filter="drop-shadow(0 15px 30px rgba(0, 0, 0, 0.6))" />
            <path d="M25,50 L45,30 M175,50 L155,30 M25,110 L45,130 M175,110 L155,130" stroke="url(#case-trim)" strokeWidth="4" />
            <rect x="85" y="70" width="30" height="20" rx="3" fill="url(#case-trim)" />
            <circle cx="92" cy="80" r="3" fill="#1e293b" />
            <circle cx="108" cy="80" r="3" fill="#1e293b" />
            <line x1="80" y1="30" x2="120" y2="30" stroke="url(#case-trim)" strokeWidth="3" />
            <circle cx="100" cy="110" r="4" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)" />
            <text x="100" y="125" fontFamily="var(--font-mono)" fontSize="6" fill="#10b981" textAnchor="middle">NEGOTIATION ACTIVE</text>
          </svg>
        )}

        {theme === 'rumours' && (
          <svg viewBox="0 0 200 200" className="right-deco-hud dial-hud">
            <defs>
              <linearGradient id="dial-grad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="70%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(251, 146, 60, 0.1)" strokeWidth="8" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="url(#dial-grad)" strokeWidth="8" strokeDasharray="471" strokeDashoffset="140" strokeLinecap="round" />
            <g transform="rotate(45 100 100)" className="dial-needle">
              <polygon points="97,100 103,100 100,35" fill="#fff" filter="drop-shadow(0 0 5px #fb923c)" />
              <circle cx="100" cy="100" r="8" fill="#fff" />
            </g>
            <line x1="100" y1="15" x2="100" y2="23" stroke="#fff" strokeWidth="2" />
            <line x1="185" y1="100" x2="177" y2="100" stroke="#fb923c" strokeWidth="2" />
            <line x1="15" y1="100" x2="23" y2="100" stroke="#ea580c" strokeWidth="2" />
            <text x="100" y="132" fontFamily="var(--font-mono)" fontSize="18" fontWeight="bold" fill="#fff" textAnchor="middle">92%</text>
            <text x="100" y="148" fontFamily="var(--font-mono)" fontSize="7" fill="var(--text-dim)" textAnchor="middle">RUMOUR HEAT INDEX</text>
          </svg>
        )}

        {theme === 'clubs' && (
          <svg viewBox="0 0 200 200" className="right-deco-hud trophy-hud">
            <defs>
              <linearGradient id="gold-metal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="pedestal-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0b0f19" />
              </linearGradient>
            </defs>
            <polygon points="40,160 160,160 140,180 60,180" fill="url(#pedestal-grad)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
            <rect x="50" y="120" width="100" height="40" fill="url(#pedestal-grad)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />
            <path d="M70,50 L130,50 L125,90 C125,110 75,110 75,90 Z" fill="url(#gold-metal)" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))" />
            <path d="M100,100 L100,120 M85,120 L115,120" stroke="url(#gold-metal)" strokeWidth="4" strokeLinecap="round" />
            <path d="M70,60 C55,60 55,80 72,85" fill="none" stroke="url(#gold-metal)" strokeWidth="3.5" />
            <path d="M130,60 C145,60 145,80 128,85" fill="none" stroke="url(#gold-metal)" strokeWidth="3.5" />
            <circle cx="100" cy="75" r="40" fill="rgba(56, 189, 248, 0.15)" filter="blur(15px)" />
            <polygon points="100,20 103,26 109,26 104,30 106,36 100,32 94,36 96,30 91,26 97,26" fill="#fff" />
            <polygon points="65,30 67,34 71,34 68,37 69,41 65,39 61,41 62,37 59,34 63,34" fill="#fbbf24" />
            <polygon points="135,30 137,34 141,34 138,37 139,41 135,39 131,41 132,37 129,34 133,34" fill="#fbbf24" />
            <text x="100" y="145" fontFamily="var(--font-mono)" fontSize="8" fontWeight="bold" fill="#fff" textAnchor="middle">CHAMPIONS</text>
          </svg>
        )}

        {theme === 'players' && (
          <svg viewBox="0 0 200 200" className="right-deco-hud hologram-hud">
            <defs>
              <linearGradient id="holo-glow" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
              </linearGradient>
            </defs>
            <ellipse cx="100" cy="165" rx="55" ry="12" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" />
            <ellipse cx="100" cy="165" rx="35" ry="6" fill="#4c1d95" />
            <polygon points="70,90 130,90 145,160 55,160" fill="url(#holo-glow)" opacity="0.6" />
            <g transform="translate(65, 40)" className="holo-card">
              <rect x="0" y="0" width="70" height="95" rx="6" fill="rgba(139, 92, 246, 0.15)" stroke="#c084fc" strokeWidth="1.8" filter="drop-shadow(0 0 10px rgba(139,92,246,0.6))" />
              <text x="35" y="30" fontFamily="var(--font-display)" fontSize="20" fontWeight="900" fill="#fff" textAnchor="middle">92</text>
              <text x="35" y="44" fontFamily="var(--font-mono)" fontSize="6" fill="#a78bfa" textAnchor="middle">FW / CF</text>
              <line x1="15" y1="56" x2="55" y2="56" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="35" y="70" fontFamily="var(--font-mono)" fontSize="6" fill="#fff" textAnchor="middle">GOLD LEVEL</text>
              <circle cx="35" cy="82" r="3" fill="#a78bfa" />
            </g>
            <line x1="60" y1="165" x2="70" y2="40" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.4" />
            <line x1="140" y1="165" x2="130" y2="40" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.4" />
          </svg>
        )}

        {theme === 'news' && (
          <svg viewBox="0 0 200 200" className="right-deco-hud news-console-hud">
            <defs>
              <linearGradient id="wave-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path d="M50,170 L150,170 L130,150 L70,150 Z" fill="#0f172a" stroke="#2dd4bf" strokeWidth="1.5" />
            <path d="M100,150 L100,100" stroke="#2dd4bf" strokeWidth="3" />
            <path d="M60,80 C60,110 140,110 140,80" fill="none" stroke="#2dd4bf" strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="95" x2="100" y2="60" stroke="#2dd4bf" strokeWidth="2" />
            <circle cx="100" cy="55" r="5" fill="#fff" filter="drop-shadow(0 0 6px #2dd4bf)" />
            <path d="M80,35 A30,30 0 0,1 120,35" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" className="news-wave-1" />
            <path d="M70,22 A45,45 0 0,1 130,22" fill="none" stroke="rgba(45, 212, 191, 0.6)" strokeWidth="1.8" strokeLinecap="round" className="news-wave-2" />
            <path d="M60,10 A60,60 0 0,1 140,10" fill="none" stroke="rgba(45, 212, 191, 0.3)" strokeWidth="2" strokeLinecap="round" className="news-wave-3" />
            <circle cx="78" cy="160" r="3" fill="#f43f5e" filter="drop-shadow(0 0 4px #f43f5e)" className="led-blink" />
            <text x="120" y="163" fontFamily="var(--font-mono)" fontSize="6" fill="#2dd4bf" textAnchor="end">LIVE BROADCASTING</text>
          </svg>
        )}
      </div>
    </div>
  )
}
