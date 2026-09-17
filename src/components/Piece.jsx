import React from 'react'

// CSS-shape based piece rendering - no copyrighted chess-set imagery.
// Each shape is drawn with plain CSS/SVG so the game never depends on
// external image assets.

const SHAPE_GLYPH = {
  circle: '●',
  triangle: '▲',
  square: '■',
  diamond: '◆',
  star: '★',
  hex: '⬡',
  cross: '✚',
  pentagon: '⬟',
}

function Piece({
  id,
  color,
  type = 'circle',
  label,
  state, // 'selected' | 'correct' | 'incorrect' | undefined
  draggable = false,
  onDragStart,
  onClick,
  onKeyDown,
  tabIndex = 0,
  size = 'md',
}) {
  const glyph = SHAPE_GLYPH[type] || SHAPE_GLYPH.circle
  const accessibleLabel = label || `${type} piece`

  const classNames = ['piece', `piece--${size}`]
  if (state) classNames.push(`piece--${state}`)

  return (
    <span
      role={onClick ? 'button' : 'img'}
      aria-label={accessibleLabel}
      tabIndex={onClick ? tabIndex : -1}
      className={classNames.join(' ')}
      style={{ color }}
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
