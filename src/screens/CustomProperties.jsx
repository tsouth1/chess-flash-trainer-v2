import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { EXERCISES, EXERCISE_LABELS, PIECE_COLORS } from '../game/config.js'

const EXERCISE_CHOICES = [EXERCISES.STATICS, EXERCISES.TRANSPOSITION, EXERCISES.FLASHES, EXERCISES.MOVES, EXERCISES.SUPER_MOVES]

function CustomProperties() {
  const { settings, updateSettings, showToast } = useApp()
  const [form, setForm] = useState(settings)
  const [errors, setErrors] = useState({})

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = (values) => {
    const errs = {}
    const maxPieces = values.boardSize * values.boardSize
    if (values.boardSize < 4 || values.boardSize > 8) errs.boardSize = 'Board size must be between 4 and 8.'
    if (values.defaultPieceCount < 1 || values.defaultPieceCount > maxPieces) {
      errs.defaultPieceCount = `Piece count must be between 1 and ${maxPieces}.`
    }
    if (values.memorizationSeconds < 2 || values.memorizationSeconds > 30) {
      errs.memorizationSeconds = 'Memorization duration must be between 2 and 30 seconds.'
    }
    if (values.flashIntervalMs < 300 || values.flashIntervalMs > 3000) {
      errs.flashIntervalMs = 'Flash interval must be between 300 and 3000 ms.'
    }
    return errs
  }

  const handleSave = (e) => {
    e.preventDefault()
    const normalized = {
      ...form,
      boardSize: Number(form.boardSize),
      defaultPieceCount: Number(form.defaultPieceCount),
      memorizationSeconds: Number(form.memorizationSeconds),
      flashIntervalMs: Number(form.flashIntervalMs),
    }
    const errs = validate(normalized)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      showToast('Please fix the highlighted fields.', 'error')
      return
    }
    updateSettings(normalized)
    showToast('Custom properties saved.', 'success')
  }

  const toggleColor = (color) => {
    const has = form.defaultPieceColors.includes(color)
    const next = has ? form.defaultPieceColors.filter((c) => c !== color) : [...form.defaultPieceColors, color]
    update('defaultPieceColors', next)
  }

  return (
    <div>
      <h1>Custom Properties</h1>
      <p style={{ color: 'var(--color-text-dim)' }}>Permanent defaults used across all exercises and levels.</p>

      <form className="panel" onSubmit={handleSave}>
        <div className="field">
          <label htmlFor="prop-board-size">Board size</label>
          <select id="prop-board-size" value={form.boardSize} onChange={(e) => update('boardSize', Number(e.target.value))}>
            {[4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}x{n}
              </option>
            ))}
          </select>
          {errors.boardSize && <span className="field-error">{errors.boardSize}</span>}
        </div>

        <div className="field">
          <label htmlFor="prop-piece-count">Default number of pieces</label>
          <input
            id="prop-piece-count"
            type="number"
            value={form.defaultPieceCount}
            onChange={(e) => update('defaultPieceCount', e.target.value)}
          />
          {errors.defaultPieceCount && <span className="field-error">{errors.defaultPieceCount}</span>}
        </div>

        <div className="field">
          <label>Default piece colors</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {PIECE_COLORS.map((color) => {
              const active = form.defaultPieceColors.includes(color)
              return (
                <button
                  type="button"
                  key={color}
                  onClick={() => toggleColor(color)}
                  aria-pressed={active}
                  aria-label={`Toggle color ${color}`}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    background: color,
                    border: active ? '3px solid var(--color-focus)' : '2px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                />
              )
            })}
          </div>
        </div>

        <div className="field">
          <label htmlFor="prop-default-exercise">Default exercise mode</label>
          <select id="prop-default-exercise" value={form.defaultExercise} onChange={(e) => update('defaultExercise', e.target.value)}>
            {EXERCISE_CHOICES.map((ex) => (
              <option key={ex} value={ex}>
                {EXERCISE_LABELS[ex]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="prop-memorize">Memorization duration (seconds)</label>
          <input
            id="prop-memorize"
            type="number"
            value={form.memorizationSeconds}
            onChange={(e) => update('memorizationSeconds', e.target.value)}
          />
          {errors.memorizationSeconds && <span className="field-error">{errors.memorizationSeconds}</span>}
        </div>

        <div className="field">
          <label htmlFor="prop-flash-interval">Flash interval (ms)</label>
          <input
            id="prop-flash-interval"
            type="number"
            value={form.flashIntervalMs}
            onChange={(e) => update('flashIntervalMs', e.target.value)}
          />
          {errors.flashIntervalMs && <span className="field-error">{errors.flashIntervalMs}</span>}
        </div>

        <div className="field">
          <label>
            <input type="checkbox" checked={form.soundEnabled} onChange={(e) => update('soundEnabled', e.target.checked)} style={{ marginRight: '0.5rem' }} />
            Sound effects
          </label>
        </div>

        <div className="field">
          <label htmlFor="prop-animation-speed">Animation speed</label>
          <select id="prop-animation-speed" value={form.animationSpeed} onChange={(e) => update('animationSpeed', e.target.value)}>
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>

        <div className="field">
          <label>
            <input type="checkbox" checked={form.showCoordinates} onChange={(e) => update('showCoordinates', e.target.checked)} style={{ marginRight: '0.5rem' }} />
            Show coordinates on the board
          </label>
        </div>

        <div className="field">
          <label>
            <input type="checkbox" checked={form.advancedEdition} onChange={(e) => update('advancedEdition', e.target.checked)} style={{ marginRight: '0.5rem' }} />
            Advanced edition (unlocks Moves, Super Moves, and Custom mode)
          </label>
        </div>

        <div className="btn-row">
          <button type="submit" className="btn btn-primary">
            Save Properties
          </button>
        </div>
      </form>
    </div>
  )
}

export default CustomProperties
