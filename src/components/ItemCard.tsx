import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { BINS, GAME_CONFIG } from '../data/levels'
import type { BinId } from '../data/levels'
import type { Item } from '../data/items'

export type CardStatus = 'idle' | 'correct' | 'wrong'

interface Props {
  item: Item
  bins: BinId[]
  status: CardStatus
  flyBin: BinId | null
  disabled: boolean
  onHover: (bin: BinId | null, glow: number) => void
  onDrop: (bin: BinId) => void
}

const FLY = 230

/** Which bin the drag offset points at most, and how far (px) along it. */
function target(bins: BinId[], dx: number, dy: number) {
  let best: BinId | null = null
  let bestP = 0
  for (const id of bins) {
    const d = BINS[id].dir
    const p = dx * d.x + dy * d.y
    if (p > bestP) {
      best = id
      bestP = p
    }
  }
  return { best, distance: bestP }
}

const tiltFor = (id: string) => {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997
  return ((h % 9) - 4) * 0.9 // slight random rotation, -3.6..3.6deg
}

/** Sticker / trading-card style item, draggable towards the monsters. */
export default function ItemCard({ item, bins, status, flyBin, disabled, onHover, onDrop }: Props) {
  const reduced = useReducedMotion()
  const base = useMemo(() => tiltFor(item.id), [item.id])
  const x = useMotionValue(-260) // slides in from the conveyor's left
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const opacity = useMotionValue(1)
  const wobble = useMotionValue(0)
  const rotate = useTransform([x, wobble] as const, ([vx, w]: number[]) => (reduced ? 0 : base + (Math.max(-260, Math.min(260, vx)) / 200) * 14 + w))

  useEffect(() => {
    const c = animate(x, 0, { type: 'spring', stiffness: 180, damping: 18 })
    return () => c.stop()
  }, [x])

  useEffect(() => {
    let cancelled = false
    if (status === 'correct' && flyBin) {
      const d = BINS[flyBin].dir
      const t = { duration: GAME_CONFIG.correctFlyMs / 1000, ease: 'easeIn' as const }
      animate(x, d.x * FLY, t)
      animate(y, d.y * FLY, t)
      animate(scale, 0.25, t)
      animate(opacity, 0, t)
    } else if (status === 'wrong' && flyBin) {
      // the monster spits it back out
      const d = BINS[flyBin].dir
      void (async () => {
        await Promise.all([animate(x, d.x * 110, { duration: 0.12 }), animate(y, d.y * 110, { duration: 0.12 }), animate(scale, 0.6, { duration: 0.12 })])
        if (cancelled) return
        const spring = { type: 'spring' as const, stiffness: 260, damping: 12 }
        animate(x, 0, spring)
        animate(y, 0, spring)
        animate(scale, 1, spring)
        if (!reduced) animate(wobble, [0, -14, 14, -9, 9, 0], { duration: 0.6 })
      })()
    }
    return () => {
      cancelled = true
    }
  }, [status, flyBin, reduced, x, y, scale, opacity, wobble])

  const wrong = status === 'wrong'

  return (
    <motion.div
      drag={!disabled && status === 'idle'}
      dragMomentum={false}
      dragElastic={0.9}
      style={{ x, y, rotate, scale, opacity, touchAction: 'none', zIndex: 10 }}
      onDrag={(_, info) => {
        const { best, distance } = target(bins, info.offset.x, info.offset.y)
        const glow = Math.min(1, distance / GAME_CONFIG.dragThreshold)
        onHover(glow > 0.15 ? best : null, glow > 0.15 ? glow : 0)
      }}
      onDragStart={() => animate(scale, 1.08, { type: 'spring', stiffness: 400, damping: 15 })}
      onDragEnd={(_, info) => {
        const { best, distance } = target(bins, info.offset.x, info.offset.y)
        onHover(null, 0)
        if (best && distance >= GAME_CONFIG.dragThreshold) {
          onDrop(best)
        } else {
          const spring = { type: 'spring' as const, stiffness: 420, damping: 16 }
          animate(x, 0, spring)
          animate(y, 0, spring)
          animate(scale, 1, spring)
        }
      }}
      className="relative flex h-full min-h-[150px] w-full cursor-grab select-none flex-col items-center justify-center gap-2 px-2 text-center active:cursor-grabbing"
    >
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[28px] border-[7px] bg-cream px-2"
        style={{
          borderColor: wrong ? '#FFB3B3' : '#fff',
          background: wrong ? '#FFE4E1' : 'linear-gradient(160deg,#FFFFFF 0%,#FFF6E5 70%)',
          boxShadow: '0 4px 0 rgba(0,0,0,.08), 0 14px 22px rgba(40,30,60,.3), inset 0 -6px 0 rgba(0,0,0,.06)',
        }}
      >
        <span className="text-[clamp(3.5rem,11vh,5.5rem)] leading-none" aria-hidden>
          {item.emoji}
        </span>
        <span className="font-display text-[clamp(1rem,2.6vh,1.5rem)] font-semibold leading-tight text-ink">{item.name}</span>
      </div>
    </motion.div>
  )
}
