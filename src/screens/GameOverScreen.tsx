import { animate, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { recordConfetti } from '../components/confetti'
import Monster from '../components/Monster'
import SkyBackground from '../components/SkyBackground'
import { BINS, LEVELS } from '../data/levels'
import type { LevelId } from '../data/levels'
import type { Item } from '../data/items'
import { MONSTERS } from '../data/monsters'
import type { SoundApi } from '../hooks/useSound'

export interface RoundResult {
  level: LevelId
  score: number
  bestStreak: number
  correct: number
  wrong: number
  missed: Item[]
  newBestScore: boolean
  newBestStreak: boolean
}

interface Props {
  result: RoundResult
  sound: SoundApi
  onPlayAgain: () => void
  onChangeLevel: () => void
  onHome: () => void
}

export default function GameOverScreen({ result, sound, onPlayAgain, onChangeLevel, onHome }: Props) {
  const level = LEVELS[result.level]
  const record = result.newBestScore || result.newBestStreak
  const [shown, setShown] = useState(0)
  const lastCoin = useRef(0)
  const soundRef = useRef(sound)
  soundRef.current = sound

  useEffect(() => {
    const c = animate(0, result.score, {
      duration: Math.min(1.8, 0.4 + result.score / 200),
      ease: 'easeOut',
      onUpdate: (v) => {
        const r = Math.round(v)
        setShown(r)
        if (r - lastCoin.current >= 20) {
          lastCoin.current = r
          soundRef.current.play('coin')
        }
      },
    })
    const t = record ? window.setTimeout(recordConfetti, 1300) : undefined
    return () => {
      c.stop()
      clearTimeout(t)
    }
  }, [result.score, record])

  const stat = 'clay flex flex-col items-center px-1 py-2'
  const btn = 'clay clay-btn min-h-[56px] font-display text-lg font-bold text-ink'

  return (
    <>
      <SkyBackground progress={1} />
      <div className="relative z-10 h-full overflow-y-auto">
        <main className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 pb-10 pt-6 sm:max-w-lg">
          <motion.h1
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-display text-4xl font-bold text-white drop-shadow-[0_3px_0_rgba(0,0,0,.35)]"
          >
            Time's up! 🌙
          </motion.h1>

          {/* full-bellied monsters sitting together */}
          <div className="flex w-full items-end justify-center gap-1" aria-hidden>
            {level.bins.map((b, i) => (
              <motion.div
                key={b}
                className="w-[21%] max-w-[96px]"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 200, damping: 14 }}
              >
                <Monster bin={b} mood="idle" full />
              </motion.div>
            ))}
          </div>

          <motion.section
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            className="clay relative w-full p-5 text-center"
            aria-label="Results"
          >
            <p className="font-display text-sm font-bold tracking-widest text-ink/80">
              LEVEL {level.label} · {level.bins.length} BINS
            </p>
            <div className="text-xs font-extrabold tracking-widest text-ink/70">FINAL SCORE</div>
            <div className="font-display text-7xl font-bold leading-none text-ink tabular-nums">{shown}</div>
            {record && (
              <motion.div
                initial={{ scale: 3.5, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: -8, opacity: 1 }}
                transition={{ delay: 1.1, type: 'spring', stiffness: 500, damping: 14 }}
                className="mx-auto mt-3 w-fit rounded-xl border-4 border-dashed border-coral bg-white/70 px-4 py-1 font-display text-2xl font-bold text-coral"
                style={{ color: '#C23B3B' }}
              >
                🏆 NEW BEST!
                <span className="block text-xs tracking-widest">
                  {result.newBestScore && result.newBestStreak ? 'SCORE & STREAK' : result.newBestStreak ? 'STREAK' : 'SCORE'}
                </span>
              </motion.div>
            )}
            <dl className="mt-4 grid grid-cols-3 gap-2">
              <div className={stat} style={{ borderRadius: 18 }}>
                <dt className="text-[11px] font-extrabold tracking-wider text-ink/75">BEST STREAK</dt>
                <dd className="font-display text-2xl font-bold">🔥 {result.bestStreak}</dd>
              </div>
              <div className={stat} style={{ borderRadius: 18 }}>
                <dt className="text-[11px] font-extrabold tracking-wider text-ink/75">CORRECT</dt>
                <dd className="font-display text-2xl font-bold text-[#17803f]">✓ {result.correct}</dd>
              </div>
              <div className={stat} style={{ borderRadius: 18 }}>
                <dt className="text-[11px] font-extrabold tracking-wider text-ink/75">WRONG</dt>
                <dd className="font-display text-2xl font-bold text-[#C23B3B]">✗ {result.wrong}</dd>
              </div>
            </dl>
          </motion.section>

          <div className="grid w-full grid-cols-2 gap-3">
            <button type="button" className={`${btn} col-span-2`} style={{ ['--c' as string]: '#FFC93C', ['--shade' as string]: '#C98B00', borderRadius: 22 }} onClick={onPlayAgain}>
              ▶ Play Again
            </button>
            <button type="button" className={btn} style={{ borderRadius: 22 }} onClick={onChangeLevel}>
              Change Level
            </button>
            <button type="button" className={btn} style={{ borderRadius: 22 }} onClick={onHome}>
              Home
            </button>
          </div>

          {result.missed.length > 0 && (
            <section className="clay w-full p-4" aria-label="Monster's Lesson">
              <h2 className="font-display text-xl font-bold">📚 Monster's Lesson</h2>
              <p className="mb-3 text-xs font-bold text-ink/75">Items you got wrong, and who really eats them:</p>
              <ul className="flex flex-col gap-2">
                {result.missed.map((item, i) => {
                  const m = MONSTERS[item.bin]
                  return (
                    <li key={`${item.id}-${i}`} className="flex items-center gap-3 rounded-2xl bg-white/70 p-2.5">
                      <span className="text-3xl" aria-hidden>{item.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-base font-semibold leading-tight">{item.name}</div>
                        <div className="text-xs font-bold leading-snug text-ink/80">{item.tip}</div>
                      </div>
                      <div className="flex w-16 shrink-0 flex-col items-center">
                        <div className="h-11 w-11" aria-hidden>
                          <Monster bin={item.bin} mood="idle" />
                        </div>
                        <span className="rounded-full px-2 text-[11px] font-extrabold text-ink" style={{ background: m.color + '55' }}>
                          {m.name} {BINS[item.bin].emoji}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
