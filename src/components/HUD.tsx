import { animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GAME_CONFIG } from '../data/levels'

function useCountUp(value: number) {
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    const c = animate(display, value, { duration: 0.4, ease: 'easeOut', onUpdate: (v) => setDisplay(Math.round(v)) })
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return display
}

const Coin = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
    <circle cx="13" cy="13" r="11" fill="#FFC93C" stroke="#D99A00" strokeWidth="2.5" />
    <circle cx="13" cy="13" r="6.5" fill="none" stroke="#D99A00" strokeWidth="2" />
    <ellipse cx="9" cy="8.5" rx="2.5" ry="1.6" fill="#fff" opacity=".7" />
  </svg>
)

/** The flame grows and changes color with the streak. */
function Flame({ streak }: { streak: number }) {
  const scale = 0.8 + Math.min(streak, 20) * 0.05
  const [outer, inner] = streak >= 15 ? ['#B07CFF', '#F3E6FF'] : streak >= 10 ? ['#3FA9F5', '#D6F0FF'] : streak >= 5 ? ['#FF4D4D', '#FFC93C'] : ['#FF9F1C', '#FFE066']
  return (
    <svg
      width="30"
      height="34"
      viewBox="0 0 30 34"
      aria-hidden
      style={{ transform: `scale(${scale})`, transformOrigin: '50% 100%', transition: 'transform .25s cubic-bezier(.34,1.9,.64,1)', opacity: streak === 0 ? 0.4 : 1, marginTop: -4 }}
    >
      <path d="M15 1 C17 9 27 12 27 23 C27 29 22 33 15 33 C8 33 3 29 3 23 C3 17 8 15 9 8 C12 11 12 13 13 14 C14 9 14 5 15 1Z" fill={outer} stroke="rgba(0,0,0,.2)" strokeWidth="1.5" />
      <path d="M15 17 C16 21 21 22 21 26.500 C21 29.500 18.500 31 15 31 C11.500 31 9 29.500 9 26.500 C9 23 13 22 15 17Z" fill={inner} />
    </svg>
  )
}

interface Props {
  score: number
  streak: number
  remainingMs: number
}

export default function HUD({ score, streak, remainingMs }: Props) {
  const shown = useCountUp(score)
  const seconds = Math.ceil(remainingMs / 1000)
  const urgent = seconds <= GAME_CONFIG.urgentSeconds
  const pct = Math.max(0, Math.min(100, (remainingMs / (GAME_CONFIG.roundSeconds * 1000)) * 100))
  const pill = 'clay flex h-14 items-center justify-center gap-2 px-3 font-display text-2xl font-bold text-ink'

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className={`${pill} justify-self-start`} style={{ borderRadius: 24 }} aria-label={`Score ${score}`}>
          <Coin />
          <span className="tabular-nums">{shown}</span>
        </div>
        <div className={pill} style={{ borderRadius: 24, minWidth: 84 }} aria-label={`Streak ${streak}`}>
          <Flame streak={streak} />
          <span className="tabular-nums">{streak}</span>
        </div>
        <div
          className={`${pill} justify-self-end tabular-nums`}
          style={{ borderRadius: 24, background: urgent ? '#FFD9D4' : undefined, color: urgent ? '#B3261E' : undefined }}
          role="timer"
          aria-label={`${seconds} seconds left`}
        >
          <span aria-hidden>⏱</span>
          {seconds}
        </div>
      </div>
      {/* rope-style progress bar */}
      <div className="h-3.5 w-full overflow-hidden rounded-full border-2 border-white/80 bg-black/20" aria-hidden>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundImage: `repeating-linear-gradient(60deg, ${urgent ? '#FF6B6B' : '#E9C589'} 0 7px, ${urgent ? '#C23B3B' : '#B98A52'} 7px 14px)`,
            boxShadow: 'inset 0 3px 0 rgba(255,255,255,.4)',
          }}
        />
      </div>
    </div>
  )
}
