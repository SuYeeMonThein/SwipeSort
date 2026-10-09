import { useCallback, useRef, useState } from 'react'
import { LEVEL_IDS } from '../data/levels'
import type { LevelId } from '../data/levels'
import { compareBest } from '../logic/game'
import type { Best } from '../logic/game'

export type HighScores = Record<LevelId, Best>

const KEY = 'swipesort.highscores.v1'
const empty = (): HighScores => ({
  easy: { score: 0, streak: 0 },
  medium: { score: 0, streak: 0 },
  hard: { score: 0, streak: 0 },
})

function load(): HighScores {
  const base = empty()
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    for (const id of LEVEL_IDS) {
      const e = raw?.[id]
      if (e) base[id] = { score: Number(e.score) || 0, streak: Number(e.streak) || 0 }
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return base
}

export function useHighScores() {
  const [scores, setScores] = useState<HighScores>(load)
  const ref = useRef(scores)
  ref.current = scores

  /** Saves the round if it beats a record; returns which records were broken. */
  const record = useCallback((level: LevelId, score: number, streak: number) => {
    const prev = ref.current[level]
    const flags = compareBest(prev, score, streak)
    if (flags.score || flags.streak) {
      const next = {
        ...ref.current,
        [level]: { score: Math.max(prev.score, score), streak: Math.max(prev.streak, streak) },
      }
      ref.current = next
      setScores(next)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
    }
    return flags
  }, [])

  return { scores, record }
}
