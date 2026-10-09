import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Burst from '../components/Burst'
import ComboSplash from '../components/ComboSplash'
import type { ComboInfo } from '../components/ComboSplash'
import { comboConfetti } from '../components/confetti'
import ConveyorBelt from '../components/ConveyorBelt'
import Countdown from '../components/Countdown'
import HUD from '../components/HUD'
import ItemCard from '../components/ItemCard'
import type { CardStatus } from '../components/ItemCard'
import Monster from '../components/Monster'
import type { Mood } from '../components/Monster'
import SkyBackground from '../components/SkyBackground'
import SoundToggles from '../components/SoundToggles'
import SpeechBubble from '../components/SpeechBubble'
import { ITEMS } from '../data/items'
import type { Item } from '../data/items'
import { BINS, GAME_CONFIG, LEVELS } from '../data/levels'
import type { BinId, LevelId } from '../data/levels'
import { MONSTERS } from '../data/monsters'
import { useGameTimer } from '../hooks/useGameTimer'
import type { SoundApi } from '../hooks/useSound'
import { applyAnswer, draw, emptyDeck, initialStats, isCorrect, itemsForLevel } from '../logic/game'
import type { Stats } from '../logic/game'
import type { RoundResult } from './GameOverScreen'

interface Props {
  level: LevelId
  sound: SoundApi
  onFinish: (result: Omit<RoundResult, 'newBestScore' | 'newBestStreak'>) => void
  onQuit: () => void
}

type Overlay = null | 'pause' | 'quit'
interface Feedback {
  id: number
  text: string
  tip?: string
  tone: 'neutral' | 'good' | 'bad'
}
interface Pop {
  id: number
  bin: BinId
  text: string
  good: boolean
}

const dirWord = (b: BinId) => (BINS[b].dir.x < 0 ? 'left' : BINS[b].dir.x > 0 ? 'right' : BINS[b].dir.y > 0 ? 'down' : 'up')

export default function GameScreen({ level, sound, onFinish, onQuit }: Props) {
  const meta = LEVELS[level]
  const reduced = useReducedMotion()
  const pool = useMemo(() => itemsForLevel(ITEMS, level), [level])

  const [started, setStarted] = useState(false)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [current, setCurrent] = useState(() => draw(emptyDeck, pool))
  const [stats, setStats] = useState<Stats>(initialStats)
  const [status, setStatus] = useState<CardStatus>('idle')
  const [flyBin, setFlyBin] = useState<BinId | null>(null)
  const [reveal, setReveal] = useState<BinId | null>(null)
  const [reaction, setReaction] = useState<{ bin: BinId; mood: 'chomp' | 'bleh' } | null>(null)
  const [dancing, setDancing] = useState(false)
  const [hover, setHover] = useState<{ bin: BinId | null; glow: number }>({ bin: null, glow: 0 })
  const [feedback, setFeedback] = useState<Feedback>({ id: 0, text: 'Feed the monsters! Swipe or tap 👆', tone: 'neutral' })
  const [combo, setCombo] = useState<ComboInfo | null>(null)
  const [pops, setPops] = useState<Pop[]>([])
  const shake = useAnimationControls()

  const statsRef = useRef(stats)
  statsRef.current = stats
  const missedRef = useRef<Item[]>([])
  const lockedRef = useRef(false)
  const timeouts = useRef<number[]>([])
  const uid = useRef(1)
  const finishedRef = useRef(false)

  const later = (fn: () => void, ms: number) => {
    timeouts.current.push(window.setTimeout(fn, ms))
  }
  useEffect(() => () => timeouts.current.forEach(clearTimeout), [])

  const doShake = useCallback(
    (px: number) => {
      if (reduced) return
      void shake.start({ x: [0, -px, px, -px * 0.6, px * 0.6, 0], y: [0, px * 0.4, -px * 0.4, 0, 0, 0], transition: { duration: 0.4 } })
    },
    [shake, reduced],
  )

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    sound.play('end')
    const s = statsRef.current
    onFinish({ level, score: s.score, bestStreak: s.bestStreak, correct: s.correct, wrong: s.wrong, missed: missedRef.current })
  }, [level, onFinish, sound])

  const playing = started && overlay === null
  const { remaining } = useGameTimer(GAME_CONFIG.roundSeconds * 1000, playing, finish)
  const progress = started ? 1 - remaining / (GAME_CONFIG.roundSeconds * 1000) : 0

  // ticking in the last 10 seconds
  const secondsLeft = Math.ceil(remaining / 1000)
  const lastTick = useRef(secondsLeft)
  useEffect(() => {
    if (playing && secondsLeft !== lastTick.current && secondsLeft <= GAME_CONFIG.urgentSeconds && secondsLeft > 0) sound.play('tick')
    lastTick.current = secondsLeft
  }, [secondsLeft, playing, sound])

  // Hidden tab: the timer hook pauses; also open the pause menu so the player returns to it.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setOverlay((o) => o ?? 'pause')
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const advance = useCallback(() => {
    setCurrent((c) => draw(c.deck, pool))
    setStatus('idle')
    setFlyBin(null)
    setReveal(null)
    lockedRef.current = false
  }, [pool])

  const answer = useCallback(
    (bin: BinId) => {
      if (!playing || lockedRef.current || status !== 'idle') return
      lockedRef.current = true
      setHover({ bin: null, glow: 0 })
      const item = current.item
      const ok = isCorrect(item, bin)
      const res = applyAnswer(stats, ok)
      setStats(res.stats)
      statsRef.current = res.stats
      setFlyBin(bin)
      const popId = uid.current++
      const clearLater = (ms: number) => later(() => setPops((p) => p.filter((x) => x.id !== popId)), ms)

      if (ok) {
        setStatus('correct')
        setReaction({ bin, mood: 'chomp' })
        setFeedback({ id: popId, text: `${MONSTERS[bin].cheer} +${res.gained}`, tone: 'good' })
        setPops((p) => [...p, { id: popId, bin, text: `+${res.gained}`, good: true }])
        clearLater(1000)
        if (res.combo) {
          setCombo({ id: popId, multiplier: res.combo })
          setDancing(true)
          sound.play('combo')
          comboConfetti()
          doShake(10)
          later(() => setCombo(null), 1100)
          later(() => setDancing(false), GAME_CONFIG.danceMs)
        } else {
          sound.play('chomp')
        }
        later(() => setReaction(null), GAME_CONFIG.moodMs)
        later(advance, GAME_CONFIG.correctFlyMs)
      } else {
        const right = item.bin
        missedRef.current.push(item)
        setStatus('wrong')
        setReaction({ bin, mood: 'bleh' })
        setReveal(right)
        setFeedback({ id: popId, text: `Bleh! That's for ${MONSTERS[right].name} ${BINS[right].emoji}`, tip: item.tip, tone: 'bad' })
        setPops((p) => [...p, { id: popId, bin, text: 'Bleh!', good: false }])
        clearLater(1000)
        sound.play('bleh')
        doShake(6)
        later(() => setReaction(null), GAME_CONFIG.moodMs)
        later(advance, GAME_CONFIG.wrongRevealMs)
      }
    },
    [playing, status, current.item, stats, advance, sound, doShake],
  )

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOverlay((o) => (o ? null : 'pause'))
        return
      }
      const bin = meta.bins.find((b) => BINS[b].key === e.key)
      if (bin) {
        e.preventDefault()
        answer(bin)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer, meta.bins])

  const has = (b: BinId) => meta.bins.includes(b)
  const moodOf = (b: BinId): Mood => (dancing ? 'dance' : reaction?.bin === b ? reaction.mood : hover.bin === b ? 'hungry' : 'idle')

  const slot = (b: BinId) => {
    const m = MONSTERS[b]
    const glow = hover.bin === b ? hover.glow : 0
    const strength = reveal === b ? 1 : glow
    return (
      <button
        type="button"
        aria-label={`${BINS[b].label} bin. Swipe ${dirWord(b)}, tap, or press ${BINS[b].arrow}`}
        disabled={!playing || status !== 'idle'}
        onClick={() => answer(b)}
        className="relative mx-auto flex min-h-[48px] min-w-[48px] flex-col items-center justify-end disabled:cursor-default"
      >
        <div className="relative aspect-square h-[clamp(64px,13vh,124px)]">
          <div
            className="absolute -inset-3 rounded-full"
            style={{ background: `radial-gradient(circle, ${m.color}cc 0%, transparent 70%)`, opacity: strength, transform: `scale(${0.8 + strength * 0.5})`, transition: 'opacity .12s' }}
          />
          <Monster bin={b} mood={moodOf(b)} lean={{ x: -BINS[b].dir.x, y: -BINS[b].dir.y }} waving={reveal === b} />
          {pops.filter((p) => p.bin === b).map((p) => (
            <Burst key={p.id} color={m.color} text={p.text} good={p.good} />
          ))}
        </div>
        <span
          className="clay -mt-1 rounded-full px-2.5 py-0.5 font-display text-xs font-semibold leading-tight text-ink"
          style={{ borderRadius: 999, border: reveal === b ? `3px solid ${m.color}` : undefined, ['--shade' as string]: m.shade }}
        >
          {BINS[b].label} <span aria-hidden>{BINS[b].arrow}</span>
        </span>
      </button>
    )
  }

  const midRow = has('ewaste') ? 'row-start-2' : 'row-start-1'
  const rows = has('ewaste') ? 'grid-rows-[auto_minmax(150px,1fr)_auto]' : has('compost') ? 'grid-rows-[minmax(150px,1fr)_auto]' : 'grid-rows-[minmax(150px,1fr)]'

  return (
    <>
      <SkyBackground progress={progress} />
      <motion.main animate={shake} className="relative z-10 mx-auto flex h-full min-h-[600px] w-full max-w-md flex-col gap-2 px-4 pb-3 pt-3 sm:max-w-xl">
        <HUD score={stats.score} streak={stats.streak} remainingMs={remaining} />

        <div className={`grid min-h-0 flex-1 grid-cols-[minmax(72px,1fr)_minmax(0,2.3fr)_minmax(72px,1fr)] items-center gap-x-1 gap-y-2 ${rows}`}>
          {has('ewaste') && <div className="col-start-2 row-start-1">{slot('ewaste')}</div>}
          <div className={`col-start-1 ${midRow}`}>{slot('recycle')}</div>
          <div className={`col-start-2 ${midRow} flex h-full flex-col`}>
            <div className="relative min-h-0 flex-1">
              <ItemCard
                key={current.item.id}
                item={current.item}
                bins={meta.bins}
                status={status}
                flyBin={flyBin}
                disabled={!playing}
                onHover={(bin, glow) => setHover({ bin, glow })}
                onDrop={answer}
              />
            </div>
            <ConveyorBelt running={playing} />
          </div>
          <div className={`col-start-3 ${midRow}`}>{slot('trash')}</div>
          {has('compost') && <div className={`col-start-2 ${has('ewaste') ? 'row-start-3' : 'row-start-2'}`}>{slot('compost')}</div>}
        </div>

        <SpeechBubble id={feedback.id} tone={feedback.tone} tip={feedback.tip}>
          {feedback.text}
        </SpeechBubble>

        <div className="flex items-center justify-between gap-2">
          <span
            className="clay whitespace-nowrap px-3 py-2 font-display text-xs font-bold leading-tight text-ink sm:text-sm"
            style={{ borderRadius: 999, background: meta.color, ['--c' as string]: meta.color }}
          >
            LEVEL {meta.label} · {meta.bins.length} BINS
          </span>
          <SoundToggles sound={sound} />
          <button
            type="button"
            onClick={() => setOverlay('quit')}
            className="clay clay-btn h-12 min-w-[84px] px-4 font-display text-base font-bold text-ink"
            style={{ borderRadius: 999 }}
          >
            ✕ Quit
          </button>
        </div>

        <ComboSplash combo={combo} />
        {!started && <Countdown paused={overlay !== null} onTick={(n) => sound.play(n === 0 ? 'go' : 'tick')} onDone={() => setStarted(true)} />}

        {overlay && (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center bg-ink/45 p-6"
            role="dialog"
            aria-modal="true"
            aria-label={overlay === 'quit' ? 'Leaving already?' : 'Paused'}
          >
            <div className="clay w-full max-w-xs p-5 text-center">
              <div className="mx-auto h-28 w-28">
                <Monster bin={overlay === 'quit' ? 'compost' : 'recycle'} mood="idle" />
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink">{overlay === 'quit' ? 'Leaving already? 🥺' : '⏸ Paused'}</h2>
              <p className="text-sm font-bold text-ink/75">{overlay === 'quit' ? 'The monsters are still hungry. Your progress will be lost.' : 'The sky is holding still.'}</p>
              <div className="mt-4 flex flex-col gap-3">
                <button type="button" autoFocus onClick={() => setOverlay(null)} className="clay clay-btn min-h-[52px] font-display text-lg font-bold text-ink" style={{ ['--c' as string]: '#3DDC84', ['--shade' as string]: '#1FA85C', borderRadius: 20 }}>
                  ▶ Keep playing
                </button>
                <button type="button" onClick={onQuit} className="clay clay-btn min-h-[52px] font-display text-lg font-bold text-ink" style={{ ['--c' as string]: '#FFB3B3', ['--shade' as string]: '#D96868', borderRadius: 20 }}>
                  {overlay === 'quit' ? 'Yes, quit to Home' : 'Quit to Home'}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.main>
    </>
  )
}
