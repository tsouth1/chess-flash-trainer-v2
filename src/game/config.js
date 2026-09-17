// Central configuration constants for KGB's Secrets.

// Application mode: 'personal' (max 1 user) or 'multiuser' (max 10 users).
// This is the single switch mentioned in the spec - change it to 'personal'
// to ship a single-user edition.
export const APP_MODE = 'multiuser' // 'personal' | 'multiuser'

export const MAX_USERS = {
  personal: 1,
  multiuser: 10,
}

export const isMultiuser = () => APP_MODE === 'multiuser'
export const getMaxUsers = () => MAX_USERS[APP_MODE] ?? MAX_USERS.multiuser

// Exercise identifiers used throughout the app.
export const EXERCISES = {
  STATICS: 'statics',
  TRANSPOSITION: 'transposition',
  FLASHES: 'flashes',
  MOVES: 'moves',
  SUPER_MOVES: 'superMoves',
  CUSTOM: 'custom',
}

export const EXERCISE_LABELS = {
  [EXERCISES.STATICS]: 'Statics',
  [EXERCISES.TRANSPOSITION]: 'Transposition',
  [EXERCISES.FLASHES]: 'Flashes',
  [EXERCISES.MOVES]: 'Moves',
  [EXERCISES.SUPER_MOVES]: 'Super Moves',
  [EXERCISES.CUSTOM]: 'Custom',
}

// Exercises only available when "advanced edition" is enabled in Custom Properties.
export const ADVANCED_ONLY_EXERCISES = [EXERCISES.MOVES, EXERCISES.SUPER_MOVES, EXERCISES.CUSTOM]

// Game finite-state machine phases.
export const PHASES = {
  IDLE: 'idle',
  MEMORIZING: 'memorizing',
  WAITING_FIRST_CONFIRMATION: 'waitingForFirstConfirmation',
  TRANSFORMATION: 'transformation',
  SOLVING: 'solving',
  SUBMITTING: 'submitting',
  RESULTS: 'results',
}

export const PHASE_LABELS = {
  [PHASES.IDLE]: 'Idle',
  [PHASES.MEMORIZING]: 'Memorizing',
  [PHASES.WAITING_FIRST_CONFIRMATION]: 'Waiting for confirmation',
  [PHASES.TRANSFORMATION]: 'Transformation',
  [PHASES.SOLVING]: 'Solving',
  [PHASES.SUBMITTING]: 'Submitting',
  [PHASES.RESULTS]: 'Results',
}

export const PIECE_COLORS = [
  '#d94f4f', // red
  '#4c8fd9', // blue
  '#4caf7d', // green
  '#e0a52c', // amber
  '#a463d9', // violet
  '#3fb8c4', // teal
  '#e0729a', // pink
  '#c7c04a', // olive
]

export const PIECE_SHAPES = ['circle', 'triangle', 'square', 'diamond', 'star', 'hex', 'cross', 'pentagon']

export const DIRECTIONS = [
  'up',
  'down',
  'left',
  'right',
  'up-left',
  'up-right',
  'down-left',
  'down-right',
]

export const DIRECTION_LABELS = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  'up-left': 'Up-Left',
  'up-right': 'Up-Right',
  'down-left': 'Down-Left',
  'down-right': 'Down-Right',
}

export const DEFAULT_CUSTOM_PROPERTIES = {
  boardSize: 8,
  defaultPieceCount: 6,
  defaultPieceColors: PIECE_COLORS.slice(0, 6),
  defaultExercise: EXERCISES.STATICS,
  memorizationSeconds: 6,
  flashIntervalMs: 900,
  soundEnabled: true,
  animationSpeed: 'normal', // 'slow' | 'normal' | 'fast'
  showCoordinates: true,
  advancedEdition: true,
}
