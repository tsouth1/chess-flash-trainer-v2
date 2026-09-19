import React from 'react'
import { PHASES } from '../game/config.js'

/**
 * Shared Start / OK / Answer control row. The exercise engine tells this
 * component what's currently actionable via booleans rather than this
 * component inferring behaviour from phase alone, since the five exercises
 * use the phases slightly differently.
 */
function GameControls({
  phase,
  onStart,
  onOk,
  onAnswer,
  onPlayAgain,
  onRestart,
  okEnabled = false,
  okLabel = 'OK',
  showAnswer = false,
  helperText,
}) {
  return (
    <div className="game-controls">
      {helperText && (
        <p className="game-controls__helper" aria-live="off">
          {helperText}
        </p>
      )}
      <div className="btn-row">
        {phase === PHASES.IDLE && (
          <button type="button" className="btn btn-primary" onClick={onStart} autoFocus>
            Start
          </button>
        )}
        {phase !== PHASES.IDLE && phase !== PHASES.RESULTS && (
          <button type="button" className="btn btn-accent" onClick={onOk} disabled={!okEnabled}>
            {okLabel}
          </button>
        )}
        {phase === PHASES.RESULTS && showAnswer && (
          <button type="button" className="btn btn-ghost" onClick={onAnswer}>
            Answer
          </button>
        )}
        {phase === PHASES.RESULTS && (
          <>
            <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
              Play Again
            </button>
            <button type="button" className="btn btn-ghost" onClick={onRestart}>
              Restart Level
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default GameControls
