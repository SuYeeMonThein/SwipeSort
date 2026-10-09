// Pure game logic: no React, no DOM, no side effects (RNG is injectable).
import { BINS, GAME_CONFIG, LEVELS } from '../data/levels'
import type { BinId, LevelId } from '../data/levels'
import type { Item } from '../data/items'

export type Rng = () => number

export interface Config {
  pointsPerCard: number
  comboSize: number
  comboBonus: number
}

export const binsForLevel = (level: LevelId): BinId[] => LEVELS[level].bins

/** Only items whose correct bin exists on the level. */
export const itemsForLevel = (items: Item[], level: LevelId): Item[] => {
  const bins = binsForLevel(level)
  return items.filter((i) => bins.includes(i.bin))
}

export const isCorrect = (item: Item, bin: BinId): boolean => item.bin === bin

export const binLabel = (bin: BinId): string => BINS[bin].label

export function shuffle<T>(arr: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---- Deck: shuffled, no repeats until the pool is used up -------------------

export interface Deck {
  queue: Item[]
  lastId: string | null
}

export const emptyDeck: Deck = { queue: [], lastId: null }

export function draw(deck: Deck, pool: Item[], rng: Rng = Math.random): { item: Item; deck: Deck } {
  if (pool.length === 0) throw new Error('Item pool is empty')
  let queue = deck.queue
  if (queue.length === 0) {
    queue = shuffle(pool, rng)
    // avoid showing the same card twice across a reshuffle boundary
    if (queue.length > 1 && queue[0].id === deck.lastId) {
      ;[queue[0], queue[queue.length - 1]] = [queue[queue.length - 1], queue[0]]
    }
  }
  const [item, ...rest] = queue
  return { item, deck: { queue: rest, lastId: item.id } }
}

// ---- Scoring & combo ----------------------------------------------------------

export interface Stats {
  score: number
  streak: number
  bestStreak: number
  correct: number
  wrong: number
}

export const initialStats: Stats = { score: 0, streak: 0, bestStreak: 0, correct: 0, wrong: 0 }

export interface AnswerResult {
  stats: Stats
  gained: number
  /** Combo multiplier label (2 for the first combo, 3 for the next…), or null. */
  combo: number | null
}

export function applyAnswer(stats: Stats, correct: boolean, cfg: Config = GAME_CONFIG): AnswerResult {
  if (!correct) {
    return { stats: { ...stats, streak: 0, wrong: stats.wrong + 1 }, gained: 0, combo: null }
  }
  const streak = stats.streak + 1
  const isCombo = streak % cfg.comboSize === 0
  const gained = cfg.pointsPerCard + (isCombo ? cfg.comboBonus : 0)
  return {
    stats: {
      score: stats.score + gained,
      streak,
      bestStreak: Math.max(stats.bestStreak, streak),
      correct: stats.correct + 1,
      wrong: stats.wrong,
    },
    gained,
    combo: isCombo ? streak / cfg.comboSize + 1 : null,
  }
}

export interface Best {
  score: number
  streak: number
}

export function compareBest(prev: Best, score: number, streak: number): { score: boolean; streak: boolean } {
  return { score: score > 0 && score > prev.score, streak: streak > 0 && streak > prev.streak }
}
