import { useCountUp } from '@/lib/useCountUp.js'

// Tarjeta de cifra del hero con número que cuenta hacia arriba al verse.
export default function CountStat({ value, label, suffix = '', delay = 0 }) {
  const [ref, display] = useCountUp(value)
  return (
    <div className="hs" ref={ref} style={{ animationDelay: `${delay}s` }}>
      <div className="v num">{display}{suffix}</div>
      <div className="l">{label}</div>
    </div>
  )
}
