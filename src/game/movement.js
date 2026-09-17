import { DIRECTIONS } from './config.js'
import { isWithinBoard, isSquareOccupied } from './placement.js'

const DELTA = {
  up: { dRow: -1, dCol: 0 },
  down: { dRow: 1, dCol: 0 },
  left: { dRow: 0, dCol: -1 },
  right: { dRow: 0, dCol: 1 },
  'up-left': { dRow: -1, dCol: -1 },
  'up-right': { dRow: -1, dCol: 1 },
  'down-left': { dRow: 1, dCol: -1 },
  'down-right': { dRow: 1, dCol: 1 },
}

export function applyDirection(position, direction, squares) {
  const delta = DELTA[direction]
  return {
    row: position.row + delta.dRow * squares,
    col: position.col + delta.dCol * squares,
  }
}

/**
 * Generate a legal move (direction + squares) for a piece that keeps it
 * inside the board and off any occupied square. Falls back gracefully by
 * trying every direction/distance combination before giving up.
 */
function findLegalMove(piece, allPieces, boardSize, maxSquares) {
  const directions = [...DIRECTIONS].sort(() => Math.random() - 0.5)
  const distances = Array.from({ length: maxSquares }, (_, i) => i + 1).sort(() => Math.random() - 0.5)

  for (const direction of directions) {
    for (const squares of distances) {
      const next = applyDirection(piece.position, direction, squares)
      if (!isWithinBoard(next, boardSize)) continue
      if (isSquareOccupied(allPieces, next, piece.id)) continue
      return { direction, squares, from: piece.position, to: next }
    }
  }
  return null
}

/**
 * Generate a move list for the Moves / Super Moves exercises. `complexity`
 * (1-3) controls the maximum number of squares any single move may cover.
 * Returns { moves, resultingPieces } where moves is a description list and
 * resultingPieces are the pieces at their new, validated positions.
 */
export function generateMoveSet(pieces, boardSize, complexity = 1) {
  const maxSquares = Math.min(boardSize - 1, complexity + 1)
  const moves = []
  const resultingPieces = pieces.map((p) => ({ ...p, position: { ...p.position } }))

  // Process in random order so earlier moves don't always block later ones.
  const order = [...resultingPieces].sort(() => Math.random() - 0.5)

  order.forEach((piece) => {
    const current = resultingPieces.find((p) => p.id === piece.id)
    const move = findLegalMove(current, resultingPieces, boardSize, Math.max(1, maxSquares))
    if (move) {
      current.position = move.to
      moves.push({
        pieceId: piece.id,
        direction: move.direction,
        squares: move.squares,
      })
    } else {
      // No legal move available (board too crowded) - piece stays put.
      moves.push({ pieceId: piece.id, direction: null, squares: 0 })
    }
  })

  return { moves, resultingPieces }
}

export function moveListDescription(move, pieceLabel, directionLabels) {
  if (!move.direction) return `${pieceLabel}: stays in place`
  return `${pieceLabel}: move ${move.squares} square${move.squares > 1 ? 's' : ''} ${directionLabels[move.direction]}`
}
