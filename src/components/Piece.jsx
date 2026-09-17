import React from 'react'
import './Piece.css'

// Real chess pieces, drawn with the standard Unicode chess-symbol glyphs
// (U+2654-U+265F) rather than an imported chess-set image - free text
// characters, so the game never depends on external/copyrighted image
// assets. White pieces use the hollow/outline glyphs, black pieces use the
// solid glyphs; CSS (Piece.css) then colors and outlines each side so both
// stay readable against the board's dark squares.
const GLYPH = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
}

function Piece({
  id,
  side = 'white',
  type = 'pawn',
  label,
  state, // 'selected' | 'correct' | 'incorrect' | undefined
  draggable = false,
  onDragStart,
  onClick,
  onKeyDown,
  tabIndex = 0,
  size = 'md',
}) {
  const glyph = GLYPH[side]?.[type] || GLYPH.white.pawn
  const accessibleLabel = label || `${side} ${type} piece`

  const classNames = ['piece', `piece--${size}`, `piece--${side}`]
  if (state) classNames.push(`piece--${state}`)

  return (
    <span
      role={onClick ? 'button' : 'img'}
      aria-label={accessibleLabel}
      tabIndex={onClick ? tabIndex : -1}
      className={classNames.join(' ')}
      draggable={draggable}
      data-piece-id={id}
      onDragStart={draggable ? (e) => onDragStart?.(e, id) : undefined}
      onClick={onClick ? () => onClick(id) : undefined}
      onKeyDown={onClick ? (e) => onKeyDown?.(e, id) : undefined}
    >
      <span aria-hidden="true" className="piece__glyph">
        {glyph}
      </span>
      {state === 'correct' && <span className="sr-only"> - correctly placed</span>}
      {state === 'incorrect' && <span className="sr-only"> - incorrectly placed</span>}
      {state === 'selected' && <span className="sr-only"> - selected</span>}
    </span>
  )
}

export default React.memo(Piece)
