import { EXERCISES } from './config.js'

// Level definitions per the spec. Each level controls board size, piece
// count, memorization duration, flash behaviour, and which exercises /
// advanced modes are unlocked.
export const LEVELS = [
  {
    id: 1,
    name: 'Level 1',
    boardSize: 4,
    pieceCount: 3,
    memorizationSeconds: 5,
    flashCount: 3,
    flashIntervalMs: 1100,
    movementComplexity: 1,
    advancedUnlocked: false,
  },
  {
    id: 2,
    name: 'Level 2',
    boardSize: 5,
    pieceCount: 4,
    memorizationSeconds: 6,
    flashCount: 4,
    flashIntervalMs: 1000,
    movementComplexity: 1,
    advancedUnlocked: false,
  },
  {
    id: 3,
    name: 'Level 3',
    boardSize: 6,
    pieceCount: 5,
    memorizationSeconds: 7,
    flashCount: 5,
    flashIntervalMs: 900,
    movementComplexity: 2,
    advancedUnlocked: true,
  },
  {
    id: 4,
    name: 'Level 4',
    boardSize: 8,
    pieceCount: 6,
    memorizationSeconds: 8,
    flashCount: 6,
    flashIntervalMs: 800,
    movementComplexity: 2,
    advancedUnlocked: true,
  },
  {
    id: 5,
    name: 'Level 5',
    boardSize: 8,
    pieceCount: 8,
    memorizationSeconds: 10,
    flashCount: 7,
    flashIntervalMs: 700,
    movementComplexity: 3,
    advancedUnlocked: true,
  },
]

export const getLevel = (id) => LEVELS.find((lvl) => lvl.id === id) || LEVELS[0]

export const isLevelUnlocked = (levelId, completedLevels) => {
  if (levelId === LEVELS[0].id) return true
  const idx = LEVELS.findIndex((lvl) => lvl.id === levelId)
  if (idx <= 0) return true
  const previous = LEVELS[idx - 1]
  return completedLevels.includes(previous.id)
}

export const DEFAULT_EXERCISE_ORDER = [
  EXERCISES.STATICS,
  EXERCISES.TRANSPOSITION,
  EXERCISES.FLASHES,
  EXERCISES.MOVES,
  EXERCISES.SUPER_MOVES,
]
