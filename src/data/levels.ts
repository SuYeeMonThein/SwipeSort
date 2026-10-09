// All tunable game settings live here.

export type BinId = 'recycle' | 'trash' | 'compost' | 'ewaste'
export type LevelId = 'easy' | 'medium' | 'hard'

export const GAME_CONFIG = {
  roundSeconds: 45,
  countdownFrom: 3,
  pointsPerCard: 10,
  comboSize: 5, // every N correct in a row triggers a combo
  comboBonus: 25,
  urgentSeconds: 10, // timer turns red + pulses
  wrongRevealMs: 700, // how long the correct monster waves after a wrong answer
  danceMs: 1000, // all monsters dance after a combo
  moodMs: 650, // chomp / bleh reaction length
  correctFlyMs: 260,
  dragThreshold: 90, // px the card must travel to drop into a bin
} as const

export interface BinMeta {
  id: BinId
  label: string
  emoji: string
  color: string
  /** Direction from the card to the bin (screen coordinates, y grows downward). */
  dir: { x: number; y: number }
  arrow: string
  key: string
}

export const BINS: Record<BinId, BinMeta> = {
  recycle: { id: 'recycle', label: 'Recycle', emoji: '♻️', color: '#3DDC84', dir: { x: -1, y: 0 }, arrow: '←', key: 'ArrowLeft' },
  trash: { id: 'trash', label: 'Trash', emoji: '🗑️', color: '#6B7280', dir: { x: 1, y: 0 }, arrow: '→', key: 'ArrowRight' },
  compost: { id: 'compost', label: 'Compost', emoji: '🌱', color: '#B5651D', dir: { x: 0, y: 1 }, arrow: '↓', key: 'ArrowDown' },
  ewaste: { id: 'ewaste', label: 'E-waste', emoji: '🔌', color: '#9B5CFF', dir: { x: 0, y: -1 }, arrow: '↑', key: 'ArrowUp' },
}

export interface LevelMeta {
  id: LevelId
  label: string
  emoji: string
  color: string
  bins: BinId[]
}

export const LEVELS: Record<LevelId, LevelMeta> = {
  easy: { id: 'easy', label: 'EASY', emoji: '🙂', color: '#3DDC84', bins: ['recycle', 'trash'] },
  medium: { id: 'medium', label: 'MEDIUM', emoji: '😃', color: '#FFC93C', bins: ['recycle', 'trash', 'compost'] },
  hard: { id: 'hard', label: 'HARD', emoji: '🔥', color: '#FF6B6B', bins: ['recycle', 'trash', 'compost', 'ewaste'] },
}

export const LEVEL_IDS: LevelId[] = ['easy', 'medium', 'hard']
