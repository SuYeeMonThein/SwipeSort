import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Monster from '../components/Monster'
import SkyBackground from '../components/SkyBackground'
import SoundToggles from '../components/SoundToggles'
import { GAME_CONFIG, LEVELS, LEVEL_IDS } from '../data/levels'
import type { BinId, LevelId } from '../data/levels'
import { MONSTERS } from '../data/monsters'
import type { HighScores } from '../hooks/useHighScores'
import type { SoundApi } from '../hooks/useSound'

interface Props {
  scores: HighScores
  sound: SoundApi
  onStart: (level: LevelId) => void
}

const DESC: Record<LevelId, string> = {
  easy: '2 monsters · Remy + Grumbo',
  medium: '3 monsters · + Sprout',
  hard: '4 monsters · + Volt',
}
const LETTER_COLORS = ['#FF6B6B', '#FFC93C', '#3DDC84', '#4FB3F0', '#9B5CFF', '#FF6B6B', '#FFC93C', '#3DDC84', '#4FB3F0']
const ALL_BINS: BinId[] = ['recycle', 'trash', 'compost', 'ewaste']
const NOTCH = 'radial-gradient(circle 11px at 0 50%, transparent 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 50%, transparent 98%, #000) right / 51% 100% no-repeat'

function Trophy({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 72" width="56" height="63" aria-hidden>
      <path d="M12 10 H4 q0 18 14 20 M52 10 h8 q0 18 -14 20" fill="none" stroke="#B98A00" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 6 H52 V24 Q52 42 32 44 Q12 42 12 24 Z" fill={color} stroke="#B98A00" strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="28" y="43" width="8" height="10" fill="#FFC93C" stroke="#B98A00" strokeWidth="3" />
      <rect x="16" y="53" width="32" height="12" rx="4" fill="#FFC93C" stroke="#B98A00" strokeWidth="3.5" />
      <ellipse cx="22" cy="18" rx="3.5" ry="8" fill="#fff" opacity=".55" />
    </svg>
  )
}

function Ticket({ id, dancing, onPick }: { id: LevelId; dancing: boolean; onPick: () => void }) {
  const l = LEVELS[id]
  const shake = useAnimationControls()
  useEffect(() => {
    if (dancing) void shake.start({ x: [0, -9, 9, -7, 7, -3, 0], rotate: [0, -2, 2, -1, 1, 0], transition: { duration: 0.55 } })
  }, [dancing, shake])
  return (
    <motion.button
      type="button"
      onClick={onPick}
      animate={shake}
      whileTap={{ y: 5, scale: 0.98 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 14 }}
      className="w-full text-left"
      style={{ filter: 'drop-shadow(0 6px 0 rgba(90,55,20,.45)) drop-shadow(0 12px 12px rgba(30,20,60,.25))' }}
      aria-label={`${l.label} level, ${l.bins.length} monsters`}
    >
      <div
        className="flex min-h-[84px] items-center gap-3 px-5 py-3"
        style={{ background: l.color, borderRadius: 22, WebkitMask: NOTCH, mask: NOTCH, boxShadow: 'inset 0 5px 0 rgba(255,255,255,.5), inset 0 -6px 0 rgba(0,0,0,.12)' }}
      >
        <span className="text-4xl" aria-hidden>{l.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-2xl font-bold leading-none text-ink">{l.label}</span>
          <span className="mt-1 block text-xs font-extrabold text-ink/85">{DESC[id]}</span>
        </span>
        <span className="h-14 border-l-[3px] border-dashed border-ink/40" aria-hidden />
        <span className="flex shrink-0 items-end -space-x-2" aria-hidden>
          {l.bins.map((b) => (
            <span key={b} className="block h-10 w-10">
              <Monster bin={b} mood={dancing ? 'dance' : 'idle'} />
            </span>
          ))}
        </span>
      </div>
    </motion.button>
  )
}

export default function HomeScreen({ scores, sound, onStart }: Props) {
  const [picked, setPicked] = useState<LevelId | null>(null)
  const timer = useRef<number>()
  useEffect(() => () => clearTimeout(timer.current), [])

  const pick = (id: LevelId) => {
    if (picked) return
    setPicked(id)
    sound.play('combo')
    timer.current = window.setTimeout(() => onStart(id), 700)
  }
  const cheering = picked ? LEVELS[picked].bins : []

  return (
    <>
      <SkyBackground progress={0.05} />
      <div className="relative z-10 h-full overflow-y-auto">
        <main className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 pb-36 pt-4 sm:max-w-lg">
          <div className="flex w-full justify-end">
            <SoundToggles sound={sound} />
          </div>

          <header className="flex flex-col items-center">
            <h1 className="flex font-display text-[3.4rem] font-bold leading-none sm:text-6xl" aria-label="SwipeSort">
              {'SwipeSort'.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  initial={{ y: -140, scale: 0, rotate: -40 }}
                  animate={{ y: 0, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 11, delay: 0.15 + i * 0.07 }}
                  className="inline-block"
                >
                  <motion.span
                    className="inline-block text-pop"
                    style={{ color: LETTER_COLORS[i] }}
                    animate={{ y: [0, -5, 0], rotate: [-2, 2, -2] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                  >
                    {ch}
                  </motion.span>
                </motion.span>
              ))}
            </h1>
            {/* ribbon banner */}
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 16 }} className="relative mt-3">
              <span className="absolute -left-5 top-2 h-full w-8 bg-[#E8A91C]" style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%,35% 50%)' }} />
              <span className="absolute -right-5 top-2 h-full w-8 bg-[#E8A91C]" style={{ clipPath: 'polygon(0 0,100% 0,65% 50%,100% 100%,0 100%)' }} />
              <div className="relative bg-sun px-7 py-1.5 font-display text-lg font-bold tracking-[0.25em] text-ink shadow-[0_5px_0_#C98B00,0_10px_14px_rgba(0,0,0,.2)]">BEAT THE CLOCK</div>
            </motion.div>
          </header>

          {/* wooden signpost */}
          <div className="flex flex-col items-center">
            <div
              className="relative rounded-2xl border-[3px] border-[#5e3a18] px-5 py-3 text-center text-cream shadow-[0_6px_0_#4a2d10,0_12px_14px_rgba(0,0,0,.25)]"
              style={{ background: 'repeating-linear-gradient(90deg,#8F5A2A 0 38px,#85521f 38px 40px)' }}
            >
              <p className="font-display text-lg font-semibold leading-snug">
                {GAME_CONFIG.roundSeconds} seconds · swipe or tap
                <br />
                {GAME_CONFIG.pointsPerCard} points a card · {GAME_CONFIG.comboSize} in a row = COMBO bonus
              </p>
              <p className="mt-1 text-xs font-bold opacity-90">Feed each monster only its own kind of waste!</p>
              <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-[#4a2d10]" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#4a2d10]" />
            </div>
            <div className="h-5 w-4 bg-[#6b4220]" />
          </div>

          <nav className="flex w-full flex-col gap-4" aria-label="Choose difficulty">
            {LEVEL_IDS.map((id) => (
              <Ticket key={id} id={id} dancing={picked === id} onPick={() => pick(id)} />
            ))}
          </nav>

          {/* trophy shelf */}
          <section className="w-full" aria-label="High scores">
            <h2 className="mb-1 text-center font-display text-lg font-bold text-ink">🏆 Trophy Shelf</h2>
            <div className="grid grid-cols-3 items-end gap-2 px-1">
              {LEVEL_IDS.map((id) => (
                <div key={id} className="flex flex-col items-center">
                  <Trophy color={LEVELS[id].color} />
                  <div className="clay mt-1 w-full px-1 py-1.5 text-center" style={{ borderRadius: 16 }}>
                    <div className="font-display text-xs font-bold text-ink">{LEVELS[id].label}</div>
                    <div className="text-[11px] font-extrabold leading-tight text-ink/80">Best Score</div>
                    <div className="font-display text-xl font-bold leading-none text-ink tabular-nums">{scores[id].score}</div>
                    <div className="mt-1 text-[11px] font-extrabold leading-tight text-ink/80">Best Streak</div>
                    <div className="font-display text-lg font-bold leading-none text-ink tabular-nums">🔥 {scores[id].streak}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 h-4 rounded-full bg-[#8F5A2A] shadow-[0_5px_0_#4a2d10] [background-image:repeating-linear-gradient(90deg,transparent_0_38px,rgba(0,0,0,.12)_38px_40px)]" />
          </section>
        </main>
      </div>

      {/* monsters peek up from the bottom and wave */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center gap-1 sm:gap-4" aria-hidden>
        {ALL_BINS.map((b, i) => (
          <motion.div
            key={b}
            className="w-[22vw] max-w-[110px]"
            initial={{ y: '110%' }}
            animate={{ y: '38%' }}
            transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 1.1 + i * 0.12 }}
          >
            <Monster bin={b} mood={cheering.includes(b) ? 'dance' : 'idle'} waving={!picked} />
            <span className="sr-only">{MONSTERS[b].name}</span>
          </motion.div>
        ))}
      </div>
    </>
  )
}
