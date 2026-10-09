import { AnimatePresence, motion } from 'framer-motion'
import { GAME_CONFIG } from '../data/levels'

export interface ComboInfo {
  id: number
  multiplier: number
}

const STAR = Array.from({ length: 32 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 32 - Math.PI / 2
  const r = i % 2 === 0 ? 50 : 38
  return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`
}).join(' ')

export default function ComboSplash({ combo }: { combo: ComboInfo | null }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" aria-hidden>
      <AnimatePresence>
        {combo && (
          <motion.div
            key={combo.id}
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: [0, 1.3, 1], rotate: -6 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex h-64 w-64 items-center justify-center"
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 drop-shadow-xl">
              <polygon points={STAR} fill="#FFC93C" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
            </svg>
            <div className="relative text-center">
              <div className="font-display text-5xl font-bold text-coral text-pop">COMBO!</div>
              <div className="font-display text-3xl font-bold text-ink">x{combo.multiplier} · +{GAME_CONFIG.comboBonus}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
