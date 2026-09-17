import React, { useState } from 'react'
import { useApp, VIEWS } from '../context/AppContext.jsx'
import { EXERCISES, EXERCISE_LABELS, PIECE_SIDE_MODES, PIECE_SIDE_MODE_LABELS, DEFAULT_CUSTOM_PROPERTIES } from '../game/config.js'

const EXERCISE_CHOICES = [EXERCISES.STATICS, EXERCISES.TRANSPOSITION, EXERCISES.FLASHES, EXERCISES.MOVES, EXERCISES.SUPER_MOVES]

function buildDefaultForm(settings) {
  return {
    exercise: EXERCISES.STATICS,
    boardSize: settings.boardSize,
    pieceCount: settings.defaultPieceCount,
    pieceSideMode: settings.defaultPieceSideMode,
    memorizationSeconds: settings.memorizationSeconds,
    flashIntervalMs: settings.flashIntervalMs,
    flashCount: 5,
    movementComplexity: 2,
    showCoordinates: settings.showCoordinates,
  }
}

function CustomMode() {
  const { settings, navigate, setPendingExercise, showToast } = useApp()
  const [form, setForm] = useState(() => buildDefaultForm(settings))

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const maxPieces = form.boardSize * form.boardSize
  const invalid = form.pieceCount < 1 || form.pieceCount > maxPieces

  const handleStart = () => {
    if (invalid) {
      showToast(`Piece count must be between 1 and ${maxPieces} for an ${form.boardSize}x${form.boardSize} board.`, 'error')
      return
    }
    const customConfig = {
      boardSize: Number(form.boardSize),
      pieceCount: Number(form.pieceCount),
      sideMode: form.pieceSideMode,
      memorizationSeconds: Number(form.memorizationSeconds),
      flashIntervalMs: Number(form.flashIntervalMs),
      flashCount: Number(form.flashCount),
      movementComplexity: Number(form.movementComplexity),
      showCoordinates: form.showCoordinates,
    }
    setPendingExercise({ exercise: form.exercise, customConfig })
    navigate(VIEWS.GAME)
  }

  const handleReset = () => setForm(buildDefaultForm(DEFAULT_CUSTOM_PROPERTIES))
  const handleCancel = () => navigate(VIEWS.LEVELS)

  return (
    <div>
      <h1>Custom Mode</h1>
      <p style={{ color: 'var(--color-text-dim)' }}>Advanced edition: configure a one-off custom game.</p>

      <div className="panel">
        <div className="field">
          <label htmlFor="custom-exercise">Exercise type</label>
          <select id="custom-exercise" value={form.exercise} onChange={(e) => update('exercise', e.target.value)}>
            {EXERCISE_CHOICES.map((ex) => (
              <option key={ex} value={ex}>
                {EXERCISE_LABELS[ex]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="custom-board-size">Board size</label>
          <select id="custom-board-size" value={form.boardSize} onChange={(e) => update('boardSize', Number(e.target.value))}>
            {[4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}x{n}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="custom-piece-count">Number of pieces (max {maxPieces})</label>
          <input
            id="custom-piece-count"
            type="number"
            min={1}
            max={maxPieces}
            value={form.pieceCount}
            onChange={(e) => update('pieceCount', e.target.value)}
          />
          {invalid && <span className="field-error">Must be between 1 and {maxPieces}.</span>}
        </div>

        <div className="field">
          <label htmlFor="custom-piece-side-mode">Piece side</label>
          <select
            id="custom-piece-side-mode"
            value={form.pieceSideMode}
            onChange={(e) => update('pieceSideMode', e.target.value)}
          >
            {PIECE_SIDE_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {PIECE_SIDE_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="custom-memorize">Memorization time (seconds)</label>
          <input
            id="custom-memorize"
            type="number"
            min={2}
            max={30}
            value={form.memorizationSeconds}
            onChange={(e) => update('memorizationSeconds', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="custom-flash-speed">Flash speed (ms between flashes)</label>
          <input
            id="custom-flash-speed"
            type="number"
            min={300}
            max={3000}
            step={100}
            value={form.flashIntervalMs}
            onChange={(e) => update('flashIntervalMs', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="custom-flash-count">Number of flashes</label>
          <input
            id="custom-flash-count"
            type="number"
            min={2}
            max={12}
            value={form.flashCount}
            onChange={(e) => update('flashCount', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="custom-movement">Movement difficulty (1-3)</label>
          <input
            id="custom-movement"
            type="number"
            min={1}
            max={3}
            value={form.movementComplexity}
            onChange={(e) => update('movementComplexity', e.target.value)}
          />
        </div>

        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={form.showCoordinates}
              onChange={(e) => update('showCoordinates', e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Show board coordinates
          </label>
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={handleStart}>
            Start Custom Game
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleReset}>
            Reset Settings
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomMode
