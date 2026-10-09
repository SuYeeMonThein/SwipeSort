import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  tone?: 'neutral' | 'good' | 'bad'
  children: ReactNode
  tip?: string
  /** key that re-triggers the pop animation */
  id: string | number
}

const ACCENT = { neutral: '#7EC8F2', good: '#3DDC84', bad: '#FF6B6B' }

export default function SpeechBubble({ tone = 'neutral', children, tip, id }: Props) {
  return (
    <div className="flex min-h-[4.25rem] items-start justify-center" aria-live="polite" role="status">
      <motion.div
        key={id}
        initial={{ scale: 0.7, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 16 }}
        className="clay relative max-w-full px-4 py-2 text-center"
        style={{ borderRadius: 22, border: `3px solid ${ACCENT[tone]}` }}
      >
        <span
          className="absolute -top-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-cream"
          style={{ borderTop: `3px solid ${ACCENT[tone]}`, borderLeft: `3px solid ${ACCENT[tone]}` }}
        />
        <p className="font-display text-lg font-semibold leading-tight text-ink">{children}</p>
        {tip && <p className="mt-0.5 text-xs font-bold leading-snug text-ink/80">💡 {tip}</p>}
      </motion.div>
    </div>
  )
}
