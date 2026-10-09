import { describe, expect, it } from 'vitest'
import { ITEMS } from '../data/items'
import { GAME_CONFIG } from '../data/levels'
import { applyAnswer, binsForLevel, compareBest, draw, emptyDeck, initialStats, itemsForLevel, isCorrect } from './game'
import type { Deck, Stats } from './game'

const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

describe('level filtering', () => {
  it('easy only has recycle + trash items', () => {
    const bins = new Set(itemsForLevel(ITEMS, 'easy').map((i) => i.bin))
    expect([...bins].sort()).toEqual(['recycle', 'trash'])
  })
  it('medium adds compost, hard adds e-waste', () => {
    expect(binsForLevel('medium')).toContain('compost')
    expect(binsForLevel('medium')).not.toContain('ewaste')
    expect(new Set(itemsForLevel(ITEMS, 'hard').map((i) => i.bin)).size).toBe(4)
  })
  it('has the required amount of item data', () => {
    const n = (b: string) => ITEMS.filter((i) => i.bin === b).length
    expect(n('recycle')).toBeGreaterThanOrEqual(15)
    expect(n('trash')).toBeGreaterThanOrEqual(12)
    expect(n('compost')).toBeGreaterThanOrEqual(12)
    expect(n('ewaste')).toBeGreaterThanOrEqual(10)
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length)
  })
})

describe('scoring', () => {
  it('correct = +10 and streak +1', () => {
    const r = applyAnswer(initialStats, true)
    expect(r.stats.score).toBe(GAME_CONFIG.pointsPerCard)
    expect(r.stats.streak).toBe(1)
    expect(r.combo).toBeNull()
  })
  it('wrong resets the streak without losing points', () => {
    const s: Stats = { score: 70, streak: 4, bestStreak: 4, correct: 7, wrong: 0 }
    const r = applyAnswer(s, false)
    expect(r.stats).toMatchObject({ score: 70, streak: 0, bestStreak: 4, wrong: 1 })
  })
  it('isCorrect compares the item bin', () => {
    expect(isCorrect(ITEMS[0], ITEMS[0].bin)).toBe(true)
    expect(isCorrect(ITEMS[0], 'ewaste')).toBe(false)
  })
})

describe('combo', () => {
  it('awards +25 on every 5th correct in a row', () => {
    let s = initialStats
    const combos: (number | null)[] = []
    for (let i = 0; i < 10; i++) {
      const r = applyAnswer(s, true)
      s = r.stats
      combos.push(r.combo)
    }
    expect(combos).toEqual([null, null, null, null, 2, null, null, null, null, 3])
    expect(s.score).toBe(10 * 10 + 2 * 25)
  })
  it('a wrong answer restarts the combo count', () => {
    let s = initialStats
    for (let i = 0; i < 4; i++) s = applyAnswer(s, true).stats
    s = applyAnswer(s, false).stats
    const r = applyAnswer(s, true)
    expect(r.combo).toBeNull()
    expect(r.stats.streak).toBe(1)
  })
  it('respects a custom config', () => {
    const r = applyAnswer({ ...initialStats, streak: 2 }, true, { pointsPerCard: 1, comboSize: 3, comboBonus: 100 })
    expect(r.gained).toBe(101)
  })
})

describe('item picking', () => {
  it('does not repeat until the pool is used up', () => {
    const pool = itemsForLevel(ITEMS, 'hard')
    const rng = seeded(7)
    let deck: Deck = emptyDeck
    const seen: string[] = []
    for (let i = 0; i < pool.length; i++) {
      const d = draw(deck, pool, rng)
      deck = d.deck
      seen.push(d.item.id)
    }
    expect(new Set(seen).size).toBe(pool.length)
  })
  it('never repeats back-to-back across a reshuffle', () => {
    const pool = itemsForLevel(ITEMS, 'easy')
    let deck: Deck = emptyDeck
    let last = ''
    for (let i = 0; i < pool.length * 5; i++) {
      const d = draw(deck, pool, seeded(i + 3))
      expect(d.item.id).not.toBe(last)
      last = d.item.id
      deck = d.deck
    }
  })
})

describe('records', () => {
  it('flags only strictly better, non-zero results', () => {
    expect(compareBest({ score: 100, streak: 5 }, 120, 5)).toEqual({ score: true, streak: false })
    expect(compareBest({ score: 0, streak: 0 }, 0, 0)).toEqual({ score: false, streak: false })
  })
})
