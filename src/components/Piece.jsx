import React from 'react'
import './Piece.css'
import { PIECE_SVGS } from './pieceGraphics.jsx'

// Real chess pieces, drawn with the standard Cburnett chess-set SVG artwork
// (see pieceGraphics.jsx for the full attribution and LICENSE.md at the
// project root for the required CC BY-SA credit). Using real SVG stroke/fill
// - rather than the CSS text-stroke trick the Unicode-glyph version relied
// on - means white/black contrast is consistent in every browser, including
// Firefox (which ignores -webkit-text-stroke).
const SIDE_CODE = { white: 'w', black: 'b' }
const TYPE_CODE = { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: 'P' }

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
  const PieceSvg = PIECE_SVGS[`${SIDE_CODE[side] || 'w'}${TYPE_CODE[type] || 'P'}`] || PIECE_SVGS.wP
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
        <PieceSvg />
      </span>
      {state === 'correct' && <span className="sr-only"> - correctly placed</span>}
      {state === 'incorrect' && <span className="sr-only"> - incorrectly placed</span>}
      {state === 'selected' && <span className="sr-only"> - selected</span>}
    </span>
  )
}

export default React.memo(Piece)
