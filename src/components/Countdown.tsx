import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GAME_CONFIG } from '../data/levels'

interface Props {
  paused: boolean
  onTick: (n: number) => void
  onDone: () => void
}

/** 3 – 2 – 1 – GO! with big bouncing numbers. Calls onDone after GO. */
export default function Countdown({ paused, onTick, onDone }: Props) {
  const [n, setN] = useState<number>(GAME_CONFIG.countdownFrom)

  useEffect(() => {
    if (paused) return
    onTick(n)
    const t = setTimeout(() => (n === 0 ? onDone() : setN(n - 1)), n === 0 ? 450 : 800)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, paused])

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/25" aria-live="assertive">
      <AnimatePresence mode="wait">
        <motion.div
          key={n}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.5, 0.9, 1], rotate: [-20, 6, -3, 0] }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="font-display text-[10rem] font-bold leading-none text-sun text-pop"
          style={{ filter: 'drop-shadow(0 12px 0 rgba(200,70,30,.55))' }}
        >
          {n === 0 ? 'GO!' : n}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
