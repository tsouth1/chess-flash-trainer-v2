import { PIECE_COLORS, PIECE_SHAPES } from './config.js'

/**
 * Random piece placement, position comparison, and boundary validation
 * utilities shared by every exercise engine.
 */

export const isWithinBoard = (position, boardSize) =>
  position.row >= 0 && position.row < boardSize && position.col >= 0 && position.col < boardSize

const positionKey = (pos) => `${pos.row}-${pos.col}`

/** Generate `count` unique random positions on a boardSize x boardSize board. */
export function randomPositions(boardSize, count) {
  const all = []
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      all.push({ row, col })
    }
  }
  for (let i = all.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, count)
}

/** Build a fresh set of memory-game pieces at random, non-overlapping positions. */
export function generatePieces(boardSize, count, colors = PIECE_COLORS) {
  const positions = randomPositions(boardSize, count)
  return positions.map((position, idx) => ({
    id: `piece-${idx + 1}`,
    color: colors[idx % colors.length],
    type: PIECE_SHAPES[idx % PIECE_SHAPES.length],
    position,
  }))
}

/** Re-shuffle an existing set of pieces onto a new set of unique positions (used by Transposition/Flashes). */
export function shufflePieces(pieces, boardSize) {
  const positions = randomPositions(boardSize, pieces.length)
  return pieces.map((piece, idx) => ({ ...piece, position: positions[idx] }))
}

/** Compare a player's placement against the target placement. Returns per-piece correctness + overall stats. */
export function comparePlacements(targetPieces, playerPieces) {
  const targetById = new Map(targetPieces.map((p) => [p.id, p]))
  let correctCount = 0
  const perPiece = playerPieces.map((piece) => {
    const target = targetById.get(piece.id)
    const placed = Boolean(piece.position)
    const correct = placed && target && positionKey(target.position) === positionKey(piece.position)
    if (correct) correctCount += 1
    return { id: piece.id, correct: Boolean(correct), placed }
  })
  const total = targetPieces.length
  return {
    perPiece,
    correctCount,
    total,
    mistakes: total - correctCount,
    isPerfect: correctCount === total,
  }
}

/** Check whether a candidate position collides with any already-placed piece (except one being moved). */
export function isSquareOccupied(pieces, position, ignorePieceId = null) {
  return pieces.some(
    (p) => p.id !== ignorePieceId && p.position && positionKey(p.position) === positionKey(position),
  )
}

export function squareToCoordinate(position, boardSize) {
  const letter = String.fromCharCode(65 + position.col)
  const number = boardSize - position.row
  return `${letter}${number}`
}

export function coordinateToSquare(coord, boardSize) {
  const letter = coord[0].toUpperCase()
  const number = parseInt(coord.slice(1), 10)
  const col = letter.charCodeAt(0) - 65
  const row = boardSize - number
  return { row, col }
}
