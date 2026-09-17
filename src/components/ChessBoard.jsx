import React, { useCallback } from 'react'
import Piece from './Piece.jsx'
import { squareToCoordinate } from '../game/placement.js'
import './ChessBoard.css'

/**
 * Reusable, accessible chessboard grid.
 *
 * Supports both drag-and-drop and click-to-select / click-to-place so the
 * whole game is playable with mouse, touch, or keyboard alone.
 */
function ChessBoard({
  boardSize = 8,
  pieces = [],
  showCoordinates = true,
  selectedPieceId = null,
  onSelectPiece,
  onPlaceSelected,
  onDropPiece,
  squareStateMap = {},
  pieceStateMap = {},
  interactive = true,
  label = 'Chessboard',
}) {
  const pieceByKey = new Map(pieces.map((p) => [`${p.position.row}-${p.position.col}`, p]))

  const handleSquareActivate = useCallback(
    (position) => {
      if (!interactive) return
      const key = `${position.row}-${position.col}`
      const occupant = pieceByKey.get(key)
      if (selectedPieceId) {
        onPlaceSelected?.(position)
      } else if (occupant) {
        onSelectPiece?.(occupant.id)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interactive, selectedPieceId, onPlaceSelected, onSelectPiece, pieces],
  )

  const handlePieceClick = useCallback(
    (pieceId) => {
      if (!interactive) return
      if (selectedPieceId === pieceId) {
        onSelectPiece?.(null)
      } else {
        onSelectPiece?.(pieceId)
      }
    },
    [interactive, selectedPieceId, onSelectPiece],
  )

  const handlePieceKeyDown = useCallback(
    (e, pieceId) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handlePieceClick(pieceId)
      }
    },
    [handlePieceClick],
  )

  const handleSquareKeyDown = useCallback(
    (e, position) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSquareActivate(position)
      }
    },
    [handleSquareActivate],
  )

  const handleDragOver = (e) => {
    if (interactive) e.preventDefault()
  }

  const handleDrop = (e, position) => {
    if (!interactive) return
    e.preventDefault()
    const pieceId = e.dataTransfer.getData('text/piece-id')
    if (pieceId) onDropPiece?.(pieceId, position)
  }

  const rows = []
  for (let row = 0; row < boardSize; row += 1) {
    const cells = []
    for (let col = 0; col < boardSize; col += 1) {
      const key = `${row}-${col}`
      const isLight = (row + col) % 2 === 0
      const occupant = pieceByKey.get(key)
      const squareState = squareStateMap[key]
      const coordinate = squareToCoordinate({ row, col }, boardSize)

      const classNames = ['board-square', isLight ? 'board-square--light' : 'board-square--dark']
      if (squareState) classNames.push(`board-square--${squareState}`)
      if (occupant && selectedPieceId === occupant.id) classNames.push('board-square--holds-selected')

      cells.push(
        <button
          key={key}
          type="button"
          className={classNames.join(' ')}
          onClick={() => handleSquareActivate({ row, col })}
          onKeyDown={(e) => handleSquareKeyDown(e, { row, col })}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, { row, col })}
          aria-label={
            occupant
              ? `Square ${coordinate}, occupied by ${occupant.type} piece${
                  pieceStateMap[occupant.id] ? `, ${pieceStateMap[occupant.id]}` : ''
                }`
              : `Square ${coordinate}, empty`
          }
          disabled={!interactive}
        >
          {occupant && (
            <Piece
              id={occupant.id}
              color={occupant.color}
              type={occupant.type}
              label={`${occupant.type} piece at ${coordinate}`}
              state={
                selectedPieceId === occupant.id ? 'selected' : pieceStateMap[occupant.id] || undefined
              }
              draggable={interactive}
              onDragStart={(e) => e.dataTransfer.setData('text/piece-id', occupant.id)}
              onClick={handlePieceClick}
              onKeyDown={handlePieceKeyDown}
            />
          )}
        </button>,
      )
    }
    rows.push(
      <div className="board-row" key={row}>
        {showCoordinates && <span className="board-rank-label">{boardSize - row}</span>}
        <div className="board-row__squares">{cells}</div>
      </div>,
    )
  }

  return (
    // --cols drives every grid track size (see ChessBoard.css) so the board's
    // pixel size depends only on boardSize + viewport width - never on how
    // many pieces currently happen to be on the board.
    <div className="board-wrapper" role="group" aria-label={label} style={{ '--cols': boardSize }}>
      <div className="board-rows">{rows}</div>
      {showCoordinates && (
        <div className="board-file-labels">
          <span />
          {Array.from({ length: boardSize }, (_, col) => (
            <span key={col}>{String.fromCharCode(65 + col)}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChessBoard
