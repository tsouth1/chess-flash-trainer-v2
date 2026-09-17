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

// Standard chess piece types, rendered as real king/queen/rook/bishop/knight/
// pawn glyphs (see Piece.jsx) rather than abstract shapes.
export const PIECE_TYPES = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']

export const PIECE_TYPE_LABELS = {
  king: 'King',
  queen: 'Queen',
  rook: 'Rook',
  bishop: 'Bishop',
  knight: 'Knight',
  pawn: 'Pawn',
}

// A chess piece only ever has two sides. `PIECE_SIDE_MODES` is the player-
// facing setting (Custom Properties / Custom Mode) controlling which side(s)
// generatePieces() draws from for a given game.
export const PIECE_SIDES = ['white', 'black']

export const PIECE_SIDE_MODES = ['mixed', 'white', 'black']

export const PIECE_SIDE_MODE_LABELS = {
  mixed: 'Mixed (random white & black)',
  white: 'White pieces only',
  black: 'Black pieces only',
}

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
  defaultPieceSideMode: 'mixed',
  defaultExercise: EXERCISES.STATICS,
  memorizationSeconds: 6,
  flashIntervalMs: 900,
  soundEnabled: true,
  animationSpeed: 'normal', // 'slow' | 'normal' | 'fast'
  showCoordinates: true,
  advancedEdition: true,
}
