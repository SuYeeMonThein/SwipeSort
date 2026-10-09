import { memo, useMemo } from 'react'

/** progress: 0 = bright morning … 1 = purple dusk. */
interface Props {
  progress: number
}

const STOPS = [
  { t: 0, top: '#4FB3F0', bot: '#C4EBFF' }, // morning blue
  { t: 0.4, top: '#7EC8F2', bot: '#FFE08A' }, // golden afternoon
  { t: 0.7, top: '#F4768F', bot: '#FFB36B' }, // orange-pink sunset
  { t: 1, top: '#2B1F5C', bot: '#7A4BA0' }, // purple dusk
]

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a: string, b: string, k: number) => {
  const A = hex(a)
  const B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`
}

export function skyColors(p: number) {
  const t = Math.max(0, Math.min(1, p))
  let i = 0
  while (i < STOPS.length - 2 && t > STOPS[i + 1].t) i++
  const a = STOPS[i]
  const b = STOPS[i + 1]
  const k = (t - a.t) / (b.t - a.t)
  return { top: mix(a.top, b.top, k), bot: mix(a.bot, b.bot, k) }
}

const Cloud = ({ w }: { w: number }) => (
  <svg width={w} viewBox="0 0 120 50" aria-hidden>
    <g fill="#fff" opacity="0.92">
      <ellipse cx="60" cy="34" rx="50" ry="14" />
      <circle cx="40" cy="26" r="16" />
      <circle cx="68" cy="20" r="20" />
      <circle cx="88" cy="30" r="13" />
    </g>
  </svg>
)

const Clouds = memo(function Clouds() {
  return (
    <>
      <div className="cloud" style={{ top: '9%', animationDuration: '110s', animationDelay: '-30s' }}><Cloud w={120} /></div>
      <div className="cloud" style={{ top: '20%', animationDuration: '75s', animationDelay: '-55s', opacity: 0.8 }}><Cloud w={80} /></div>
      <div className="cloud" style={{ top: '5%', animationDuration: '150s', animationDelay: '-100s', opacity: 0.7 }}><Cloud w={160} /></div>
      <div className="cloud" style={{ top: '30%', animationDuration: '55s', animationDelay: '-10s', opacity: 0.6 }}><Cloud w={56} /></div>
    </>
  )
})

const Yard = memo(function Yard() {
  return (
    <svg className="absolute bottom-0 left-0 h-full w-full" viewBox="0 0 400 220" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <path d="M0 120 Q80 70 170 110 T400 90 V220 H0Z" fill="#9BDB9F" />
      {/* little factory */}
      <g transform="translate(262 62)">
        <rect x="0" y="22" width="62" height="40" rx="4" fill="#E8836B" stroke="#B8523C" strokeWidth="2" />
        <rect x="8" y="2" width="10" height="24" fill="#D96D55" stroke="#B8523C" strokeWidth="2" />
        <rect x="30" y="8" width="10" height="18" fill="#D96D55" stroke="#B8523C" strokeWidth="2" />
        <rect x="8" y="34" width="12" height="10" rx="2" fill="#FFE9A8" />
        <rect x="26" y="34" width="12" height="10" rx="2" fill="#FFE9A8" />
        <rect x="44" y="34" width="12" height="10" rx="2" fill="#FFE9A8" />
        <circle className="smoke" cx="13" cy="-4" r="7" fill="#fff" opacity=".85" />
        <circle className="smoke" cx="35" cy="2" r="6" fill="#fff" opacity=".85" style={{ animationDelay: '-1.6s' }} />
        <circle className="smoke" cx="14" cy="-4" r="6" fill="#fff" opacity=".85" style={{ animationDelay: '-2.4s' }} />
      </g>
      <path d="M0 150 Q100 105 210 145 T400 130 V220 H0Z" fill="#6CCB7B" />
      <path d="M0 185 Q120 140 240 180 T400 168 V220 H0Z" fill="#4DB561" />
    </svg>
  )
})

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        x: (i * 53.7 + 11) % 100,
        y: (i * 31.3 + 7) % 55,
        s: 2 + (i % 3),
        d: (i % 7) * 0.35,
      })),
    [],
  )
  return (
    <>
      {stars.map((s, i) => (
        <span
          key={i}
          className="star absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
        />
      ))}
    </>
  )
}

export default function SkyBackground({ progress }: Props) {
  const p = Math.max(0, Math.min(1, progress))
  const { top, bot } = skyColors(p)
  const starOpacity = Math.max(0, Math.min(1, (p - 0.7) / 0.2))
  // the sun climbs slightly, then sinks behind the hills
  const sunTop = 12 + 62 * Math.pow(p, 1.6)
  const sunLeft = 18 + 40 * p
  const sunColor = mix('#FFE45C', '#FF8A4C', Math.min(1, p / 0.85))
  const dim = Math.max(0, (p - 0.55) / 0.45)

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${top}, ${bot})` }} aria-hidden>
      <div style={{ opacity: starOpacity }} className="absolute inset-0">
        <Stars />
      </div>
      <div
        className="absolute rounded-full"
        style={{
          left: `${sunLeft}%`,
          top: `${sunTop}%`,
          width: 76,
          height: 76,
          background: sunColor,
          boxShadow: `0 0 60px 24px ${sunColor}88`,
          transform: 'translate(-50%,-50%)',
        }}
      />
      {p > 0.8 && (
        <div className="absolute rounded-full" style={{ right: '12%', top: '10%', width: 44, height: 44, background: '#FFF6D6', boxShadow: `0 0 30px 8px rgba(255,246,214,${(p - 0.8) * 3})`, opacity: Math.min(1, (p - 0.8) * 5) }} />
      )}
      <div className="absolute inset-0" style={{ opacity: 1 - dim * 0.55 }}>
        <Clouds />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[48%]" style={{ filter: `brightness(${1 - dim * 0.55}) saturate(${1 - dim * 0.25})` }}>
        <Yard />
      </div>
    </div>
  )
}
