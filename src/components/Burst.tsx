import { motion } from 'framer-motion'

/** Particle burst in the monster's color + a floating "+10" bubble. */
export default function Burst({ color, text, good }: { color: string; text: string; good: boolean }) {
  const n = 12
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden>
      {good &&
        Array.from({ length: n }, (_, i) => {
          const a = (Math.PI * 2 * i) / n + (i % 2) * 0.2
          const d = 46 + (i % 3) * 14
          return (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{ width: 10 + (i % 3) * 3, height: 10 + (i % 3) * 3, background: i % 3 === 0 ? '#fff' : color, border: '2px solid rgba(0,0,0,.12)' }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, scale: 0, opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            />
          )
        })}
      <motion.div
        className="absolute left-1/2 top-0 whitespace-nowrap rounded-full border-[3px] px-3 py-0.5 font-display text-lg font-bold text-ink"
        style={{ background: '#FFF6E5', borderColor: good ? color : '#FF6B6B', x: '-50%' }}
        initial={{ y: 10, scale: 0.4, opacity: 0 }}
        animate={{ y: -34, scale: [0.4, 1.25, 1], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.95, times: [0, 0.2, 0.7, 1] }}
      >
        {text}
      </motion.div>
    </div>
  )
}
