import React, { useEffect, useState } from 'react'
import { useApp, VIEWS } from '../context/AppContext.jsx'
import { LEVELS, isLevelUnlocked } from '../game/levels.js'
import { EXERCISES, EXERCISE_LABELS } from '../game/config.js'
import { loadAchievements } from '../utils/storage.js'

function LevelSelection() {
  const { selectedUser, pendingExercise, setPendingExercise, navigate, showToast } = useApp()
  const [completedLevels, setCompletedLevels] = useState([])

  useEffect(() => {
    if (!selectedUser) return
    setCompletedLevels(loadAchievements(selectedUser.id).completedLevels || [])
  }, [selectedUser])

  // Only Statics and Flashes are offered here for now - Transposition, Moves,
  // and Super Moves stay implemented (see GameScreen.jsx's ENGINES map) but
  // are hidden from this picker per an explicit scope-narrowing request.
  const exerciseOptions = [EXERCISES.STATICS, EXERCISES.FLASHES]
  const exercise = exerciseOptions.includes(pendingExercise?.exercise) ? pendingExercise.exercise : EXERCISES.STATICS

  const chooseExercise = (ex) => {
    setPendingExercise({ exercise: ex })
  }

  const chooseLevel = (levelId) => {
    if (!isLevelUnlocked(levelId, completedLevels)) {
      showToast('Complete the previous level first.', 'warning')
      return
    }
    setPendingExercise({ exercise, levelId })
    navigate(VIEWS.GAME)
  }

  return (
    <div>
      <h1>Level Selection</h1>

      <div className="panel">
        <h2>Exercise</h2>
        <div className="btn-row">
          {exerciseOptions.map((ex) => (
            <button
              key={ex}
              type="button"
              className={`btn ${ex === exercise ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => chooseExercise(ex)}
              aria-pressed={ex === exercise}
            >
              {EXERCISE_LABELS[ex]}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Levels</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {LEVELS.map((lvl) => {
            const unlocked = isLevelUnlocked(lvl.id, completedLevels)
            const complete = completedLevels.includes(lvl.id)
            return (
              <button
                key={lvl.id}
                type="button"
                className="panel"
                style={{
                  textAlign: 'left',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.5,
                  border: complete ? '1px solid var(--color-green)' : undefined,
                }}
                onClick={() => chooseLevel(lvl.id)}
                aria-disabled={!unlocked}
              >
                <strong>{lvl.name}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)' }}>
                  {lvl.boardSize}x{lvl.boardSize} board - {lvl.pieceCount} pieces
                </div>
                <div style={{ marginTop: '0.4rem' }}>
                  {complete && <span className="tag tag-success">Completed</span>}
                  {!unlocked && <span className="tag tag-fail">Locked</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LevelSelection
