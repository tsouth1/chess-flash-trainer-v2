import React from 'react'
import { EXERCISE_LABELS, PHASE_LABELS } from '../game/config.js'
import './GameStatus.css'

function GameStatus({ userName, exercise, levelId, score, phase, attemptNumber }) {
  return (
    <div className="game-status panel" role="status">
      <div className="game-status__item">
        <span className="game-status__label">Player</span>
        <span className="game-status__value">{userName || '-'}</span>
      </div>
      <div className="game-status__item">
        <span className="game-status__label">Exercise</span>
        <span className="game-status__value">{EXERCISE_LABELS[exercise] || '-'}</span>
      </div>
      {levelId ? (
        <div className="game-status__item">
          <span className="game-status__label">Level</span>
          <span className="game-status__value">{levelId}</span>
        </div>
      ) : null}
      <div className="game-status__item">
        <span className="game-status__label">Attempt</span>
        <span className="game-status__value">{attemptNumber}</span>
      </div>
      <div className="game-status__item">
        <span className="game-status__label">Score</span>
        <span className="game-status__value">{score ?? 0}</span>
      </div>
      <div className="game-status__item game-status__item--phase">
        <span className="game-status__label">Phase</span>
        <span className="tag tag-success">{PHASE_LABELS[phase] || phase}</span>
      </div>
    </div>
  )
}

export default GameStatus
