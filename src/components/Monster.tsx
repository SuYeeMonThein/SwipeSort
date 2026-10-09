import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useMemo } from 'react'
import { MONSTERS } from '../data/monsters'
import type { BinId } from '../data/levels'

export type Mood = 'idle' | 'hungry' | 'chomp' | 'bleh' | 'dance'

interface Props {
  bin: BinId
  mood?: Mood
  /** Direction of the dragged card; the monster leans and looks that way. */
  lean?: { x: number; y: number }
  /** Waves an arm (used to point at the right bin). */
  waving?: boolean
  /** Round belly after a full meal (Game Over). */
  full?: boolean
}

const DARK = '#4a1f2e'
const INK = '#2b1b17'

// Per-character face layout (SVG units in a 120x120 box)
const FACE = {
  recycle: { eyeY: 62, dx: 14, r: 9, mouthY: 82 },
  trash: { eyeY: 68, dx: 14, r: 8, mouthY: 90 },
  sprout: { eyeY: 72, dx: 15, r: 8, mouthY: 90 },
  volt: { eyeY: 64, dx: 15, r: 10, mouthY: 86 },
} as const
const FACE_OF: Record<BinId, (typeof FACE)[keyof typeof FACE]> = {
  recycle: FACE.recycle,
  trash: FACE.trash,
  compost: FACE.sprout,
  ewaste: FACE.volt,
}

/** Spiky outline for Volt. */
const SPIKES = (() => {
  const pts: string[] = []
  const n = 12
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * 2 * i) / (n * 2) - Math.PI / 2
    const r = i % 2 === 0 ? 50 : 38
    pts.push(`${(60 + Math.cos(a) * r).toFixed(1)},${(68 + Math.sin(a) * r * 0.95).toFixed(1)}`)
  }
  return pts.join(' ')
})()

const variants: Variants = {
  idle: (_l) => ({
    x: 0,
    rotate: 0,
    scale: 1,
    y: [0, -3, 0],
    scaleX: [1, 1.02, 1],
    scaleY: [1, 1.035, 1],
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
  }),
  hungry: (l: { x: number; y: number }) => ({
    x: l.x * 8,
    y: l.y * 8,
    rotate: l.x * 7,
    scale: 1.14,
    scaleX: 1,
    scaleY: 1,
    transition: { type: 'spring', stiffness: 320, damping: 14 },
  }),
  chomp: {
    x: 0,
    y: [0, 0, -10, 0],
    scale: 1,
    scaleX: [1.15, 0.85, 1.1, 1],
    scaleY: [0.8, 1.2, 0.95, 1],
    rotate: [0, -9, 9, -5, 0],
    transition: { duration: 0.6 },
  },
  bleh: {
    x: [0, -7, 7, -5, 5, 0],
    y: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotate: [0, -4, 4, -2, 0],
    transition: { duration: 0.5 },
  },
  dance: {
    x: 0,
    scale: 1,
    scaleX: 1,
    scaleY: [1, 0.92, 1.06, 1],
    y: [0, -14, 0],
    rotate: [-10, 10],
    transition: { duration: 0.46, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
  },
}

export default function Monster({ bin, mood = 'idle', lean = { x: 0, y: 0 }, waving = false, full = false }: Props) {
  const reduced = useReducedMotion()
  const m = MONSTERS[bin]
  const f = FACE_OF[bin]
  const blinkDelay = useMemo(() => `${(Math.random() * 4).toFixed(2)}s`, [])
  const cx = 60
  const ex1 = cx - f.dx
  const ex2 = cx + f.dx
  const px = lean.x * 2.6
  const py = lean.y * 2.6

  const happy = mood === 'chomp' || mood === 'dance'
  const squint = mood === 'bleh'
  const sleepy = bin === 'compost' && mood === 'idle'
  const angry = bin === 'trash' && mood === 'idle'
  const wide = mood === 'hungry'
  const r = f.r + (wide ? 3 : 0)

  const eye = (x: number) => {
    if (happy) return <path d={`M${x - 7} ${f.eyeY + 3} Q${x} ${f.eyeY - 8} ${x + 7} ${f.eyeY + 3}`} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
    if (squint)
      return (
        <path
          d={x < cx ? `M${x - 6} ${f.eyeY - 6} L${x + 5} ${f.eyeY} L${x - 6} ${f.eyeY + 6}` : `M${x + 6} ${f.eyeY - 6} L${x - 5} ${f.eyeY} L${x + 6} ${f.eyeY + 6}`}
          stroke={INK}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    if (sleepy) return <path d={`M${x - 7} ${f.eyeY} Q${x} ${f.eyeY + 8} ${x + 7} ${f.eyeY}`} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
    return (
      <g className={bin === 'ewaste' ? 'twitch' : undefined}>
        <g className="blink" style={{ animationDelay: blinkDelay }}>
          <circle cx={x} cy={f.eyeY} r={r} fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx={x + px} cy={f.eyeY + py} r={r * 0.5} fill={INK} />
          <circle cx={x + px + 1.5} cy={f.eyeY + py - 1.5} r={r * 0.17} fill="#fff" />
        </g>
      </g>
    )
  }

  const my = f.mouthY
  const mouth = (() => {
    if (mood === 'hungry')
      return (
        <g>
          <ellipse cx={cx} cy={my + 2} rx="17" ry="15" fill={DARK} stroke={INK} strokeWidth="2.5" />
          <ellipse cx={cx} cy={my + 10} rx="10" ry="5.5" fill="#ff8aa0" />
        </g>
      )
    if (mood === 'chomp' || mood === 'dance')
      return <path d={`M${cx - 18} ${my - 4} Q${cx} ${my + 22} ${cx + 18} ${my - 4} Z`} fill={DARK} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    if (mood === 'bleh')
      return (
        <g>
          <path d={`M${cx - 15} ${my} q5 -5 10 0 t10 0 t10 0`} stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d={`M${cx - 4} ${my + 1} v10 a6 6 0 0 0 12 0 v-10 z`} fill="#ff8aa0" stroke={INK} strokeWidth="2" />
        </g>
      )
    if (bin === 'trash') return <path d={`M${cx - 14} ${my + 5} Q${cx} ${my - 8} ${cx + 14} ${my + 5}`} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
    if (bin === 'compost') return <ellipse cx={cx} cy={my} rx="5" ry="4" fill={DARK} />
    if (bin === 'ewaste') return <path d={`M${cx - 16} ${my} l8 -7 l8 7 l8 -7 l8 7`} stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    return <path d={`M${cx - 15} ${my - 3} Q${cx} ${my + 12} ${cx + 15} ${my - 3}`} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
  })()

  const body = (() => {
    switch (bin) {
      case 'recycle':
        return (
          <g>
            <line x1="60" y1="22" x2="60" y2="9" stroke={m.shade} strokeWidth="4" strokeLinecap="round" />
            <circle cx="60" cy="7" r="6" fill="#FFC93C" stroke={m.shade} strokeWidth="2.5" />
            <rect x="22" y="26" width="76" height="82" rx="30" fill={m.color} stroke={m.shade} strokeWidth="4" />
            <ellipse cx="60" cy="31" rx="30" ry="7" fill="#9af0bd" stroke={m.shade} strokeWidth="2.5" />
            <path d="M28 100 Q60 108 92 100" stroke={m.shade} strokeWidth="3" fill="none" opacity=".45" />
            <path d="M28 94 Q60 102 92 94" stroke={m.shade} strokeWidth="3" fill="none" opacity=".3" />
            <ellipse cx="38" cy="50" rx="6" ry="12" fill="#fff" opacity=".4" transform="rotate(12 38 50)" />
            <text x="60" y="108" fontSize="0">.</text>
          </g>
        )
      case 'trash':
        return (
          <g>
            <path d="M26 36 L94 36 L88 104 Q87.5 110 82 110 L38 110 Q32.5 110 32 104 Z" fill={m.color} stroke={m.shade} strokeWidth="4" strokeLinejoin="round" />
            <path d="M44 42 L45 104 M60 42 V106 M76 42 L75 104" stroke={m.shade} strokeWidth="3" opacity=".35" strokeLinecap="round" />
            <g transform="rotate(-8 60 28)">
              <rect x="48" y="9" width="24" height="10" rx="5" fill="#4B5260" stroke={m.shade} strokeWidth="3" />
              <rect x="18" y="18" width="84" height="18" rx="9" fill="#8a919e" stroke={m.shade} strokeWidth="4" />
            </g>
            {angry && (
              <g stroke={INK} strokeWidth="4.5" strokeLinecap="round">
                <line x1="36" y1="52" x2="55" y2="60" />
                <line x1="84" y1="52" x2="65" y2="60" />
              </g>
            )}
          </g>
        )
      case 'compost':
        return (
          <g>
            <path d="M60 44 V24" stroke="#3a8f3a" strokeWidth="4" strokeLinecap="round" />
            <path d="M60 28 Q38 6 24 22 Q42 38 60 28 Z" fill="#5BD16B" stroke="#2e8b3d" strokeWidth="3" strokeLinejoin="round" />
            <path d="M60 28 Q82 4 98 16 Q82 36 60 28 Z" fill="#7BE38A" stroke="#2e8b3d" strokeWidth="3" strokeLinejoin="round" />
            <path d="M20 94 Q12 58 38 44 Q60 33 82 44 Q108 58 100 94 Q98 111 60 111 Q22 111 20 94 Z" fill={m.color} stroke={m.shade} strokeWidth="4" strokeLinejoin="round" />
            <circle cx="34" cy="86" r="3.5" fill={m.shade} opacity=".5" />
            <circle cx="88" cy="96" r="3" fill={m.shade} opacity=".5" />
            <circle cx="76" cy="52" r="2.5" fill={m.shade} opacity=".5" />
            <ellipse cx="40" cy="56" rx="7" ry="10" fill="#fff" opacity=".25" transform="rotate(20 40 56)" />
          </g>
        )
      case 'ewaste':
        return (
          <g>
            <path d="M96 98 Q118 100 112 80" stroke={m.shade} strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <g transform="rotate(-8 112 74)">
              <rect x="105" y="62" width="14" height="14" rx="3" fill="#ddd" stroke={INK} strokeWidth="2.5" />
              <rect x="108" y="54" width="3" height="9" fill={INK} />
              <rect x="114" y="54" width="3" height="9" fill={INK} />
            </g>
            <polygon points={SPIKES} fill={m.color} stroke={m.shade} strokeWidth="4" strokeLinejoin="round" />
            <polygon points="82,16 90,30 83,30 88,42 74,26 81,26" fill="#FFE14D" stroke="#C99700" strokeWidth="2" strokeLinejoin="round" />
            <ellipse cx="40" cy="54" rx="7" ry="10" fill="#fff" opacity=".3" transform="rotate(20 40 54)" />
          </g>
        )
    }
  })()

  const showArm = waving || mood === 'dance'
  const armSwing = reduced ? 0 : 1

  return (
    <svg viewBox="-4 0 128 124" width="100%" height="100%" role="presentation" aria-hidden="true" style={{ overflow: 'visible' }}>
      <ellipse cx="60" cy="114" rx="38" ry="6" fill="#000" opacity=".16" />
      <motion.g
        variants={variants}
        animate={mood}
        custom={lean}
        initial={false}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
      >
        <g style={full ? { transform: 'scale(1.08, 1.04)', transformBox: 'fill-box', transformOrigin: '50% 100%' } : undefined}>
          {body}
          {/* cheeks */}
          <circle cx={ex1 - 8} cy={f.eyeY + 12} r="5" fill="#ff7b9c" opacity=".45" />
          <circle cx={ex2 + 8} cy={f.eyeY + 12} r="5" fill="#ff7b9c" opacity=".45" />
          {eye(ex1)}
          {eye(ex2)}
          {mouth}
          {full && <ellipse cx="60" cy="96" rx="20" ry="9" fill="#fff" opacity=".22" />}
          {/* arms */}
          <g transform="rotate(28 24 80)">
            <line x1="24" y1="80" x2="12" y2="94" stroke={m.shade} strokeWidth="6" strokeLinecap="round" />
            <circle cx="11" cy="95" r="5" fill={m.color} stroke={m.shade} strokeWidth="2.5" />
          </g>
          <motion.g
            style={{ transformBox: 'view-box', transformOrigin: '96px 80px' }}
            initial={false}
            animate={showArm ? { rotate: armSwing ? [-25, -85, -25] : -60 } : { rotate: -28 }}
            transition={showArm ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          >
            <line x1="96" y1="80" x2="108" y2="94" stroke={m.shade} strokeWidth="6" strokeLinecap="round" />
            <circle cx="109" cy="95" r="5" fill={m.color} stroke={m.shade} strokeWidth="2.5" />
          </motion.g>
        </g>
      </motion.g>
    </svg>
  )
}
