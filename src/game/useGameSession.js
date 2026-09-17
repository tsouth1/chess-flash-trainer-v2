import { useCallback, useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { PHASES, PHASE_LABELS, EXERCISE_LABELS } from './config.js'
import { getLevel } from './levels.js'
import { computeScore } from './scoring.js'
import { appendSession, loadAchievements, saveAchievements } from '../utils/storage.js'

/**
 * Shared game-session state machine used by every exercise engine.
 *
 * Each exercise component owns its own extra state (piece positions, move
 * lists, flash timers, ...) but drives its phase transitions and scoring
 * through this hook so the status bar, results screen, scoring formula, and
 * persisted statistics stay consistent across all five exercise types.
 */
export function useGameSession({ exercise, levelId, customConfig = null }) {
  const { selectedUser, settings, announce, showToast } = useApp()

  const [phase, setPhaseRaw] = useState(PHASES.IDLE)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [lastResult, setLastResult] = useState(null)
  const startTimeRef = useRef(null)

  const level = levelId ? getLevel(levelId) : null

  const config = useMemo(() => {
    if (customConfig) return { showCoordinates: settings.showCoordinates, ...customConfig }
    if (level) {
      return {
        boardSize: level.boardSize,
        pieceCount: level.pieceCount,
        memorizationSeconds: level.memorizationSeconds,
        flashCount: level.flashCount,
        flashIntervalMs: level.flashIntervalMs,
        movementComplexity: level.movementComplexity,
        colors: settings.defaultPieceColors,
        showCoordinates: settings.showCoordinates,
      }
    }
    return {
      boardSize: settings.boardSize,
      pieceCount: settings.defaultPieceCount,
      memorizationSeconds: settings.memorizationSeconds,
      flashCount: 5,
      flashIntervalMs: settings.flashIntervalMs,
      movementComplexity: 1,
      colors: settings.defaultPieceColors,
      showCoordinates: settings.showCoordinates,
    }
  }, [customConfig, level, settings])

  const setPhase = useCallback(
    (next) => {
      setPhaseRaw(next)
      announce(`${EXERCISE_LABELS[exercise] || 'Exercise'}: ${PHASE_LABELS[next]}.`)
    },
    [announce, exercise],
  )

  const beginTimer = useCallback(() => {
    startTimeRef.current = Date.now()
  }, [])

  const elapsedSeconds = useCallback(() => {
    if (!startTimeRef.current) return 0
    return Math.round((Date.now() - startTimeRef.current) / 1000)
  }, [])

  /**
   * Finalize the current attempt: compute score, persist the session for the
   * active user, update level-completion / best-score achievements, and move
   * the phase to `results`.
   */
  const finishGame = useCallback(
    ({ correctCount, totalPieces, mistakes, difficultyMultiplier = 1, parSecondsOverride }) => {
      const timeSeconds = elapsedSeconds()
      const parSeconds = parSecondsOverride ?? Math.max(10, totalPieces * 6)
      const { total, breakdown, isPerfect } = computeScore({
        correctCount,
        totalPieces,
        mistakes,
        levelId: levelId || 1,
        elapsedSeconds: timeSeconds,
        parSeconds,
        difficultyMultiplier,
      })
      const success = totalPieces > 0 && correctCount / totalPieces >= 0.7

      const result = {
        score: total,
        breakdown,
        isPerfect,
        success,
        correctCount,
        totalPieces,
        mistakes,
        timeSeconds,
      }
      setLastResult(result)

      if (selectedUser) {
        appendSession(selectedUser.id, {
          date: new Date().toISOString(),
          exercise,
          levelId: levelId || null,
          score: total,
          success,
          timeSeconds,
        })

        if (levelId) {
          const achievements = loadAchievements(selectedUser.id)
          const nextAchievements = { ...achievements }
          if (isPerfect && !achievements.completedLevels.includes(levelId)) {
            nextAchievements.completedLevels = [...achievements.completedLevels, levelId]
            showToast(`Level ${levelId} complete!`, 'success')
          }
          const bestForExercise = achievements.bestScoresByExercise[exercise] || 0
          if (total > bestForExercise) {
            nextAchievements.bestScoresByExercise = {
              ...achievements.bestScoresByExercise,
              [exercise]: total,
            }
          }
          saveAchievements(selectedUser.id, nextAchievements)
        }
      }

      setAttemptNumber((n) => n + 1)
      setPhase(PHASES.RESULTS)
      return result
    },
    [elapsedSeconds, exercise, levelId, selectedUser, setPhase, showToast],
  )

  const resetSession = useCallback(() => {
    setPhaseRaw(PHASES.IDLE)
    setLastResult(null)
    startTimeRef.current = null
  }, [])

  return {
    phase,
    setPhase,
    config,
    level,
    attemptNumber,
    lastResult,
    beginTimer,
    elapsedSeconds,
    finishGame,
    resetSession,
    selectedUser,
    settings,
  }
}
