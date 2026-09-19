import React, { useEffect, useRef, useState } from 'react'
import ChessBoard from '../../components/ChessBoard.jsx'
import Piece from '../../components/Piece.jsx'
import GameControls from '../../components/GameControls.jsx'
import GameStatus from '../../components/GameStatus.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useGameSession } from '../../game/useGameSession.js'
import { generatePieces, shufflePieces, comparePlacements, isSquareOccupied } from '../../game/placement.js'
import { PHASES, EXERCISES } from '../../game/config.js'

// Number of timed random placements shown after the initial position, the
// interval between them, and how many failed attempts a player gets before
// the level ends. See TODO.md for the rationale behind these numbers.
const REVEAL_COUNT = 3
const REVEAL_INTERVAL_MS = 5000
const MAX_RETRIES = 3

/**
 * Transposition: memorize the initial placement, then watch it reshuffle
 * into REVEAL_COUNT new random placements (one every REVEAL_INTERVAL_MS).
 * One of those placements - picked at random and announced only as its
 * number - is the one the player must reconstruct from the tray. A wrong
 * attempt offers a "Retry?" against the same target pattern, up to
 * MAX_RETRIES times, before the level ends in failure.
 *
 * This used to share PlacementBoardExercise with Statics via a `transpose`
 * prop, but the timed multi-reveal + retry flow no longer fits that
 * single-transform model, so it's now its own self-contained engine (see
 * TODO.md for the history of that split).
 */
function TranspositionExercise({ levelId, customConfig }) {
  const { announce } = useApp()
  const session = useGameSession({ exercise: EXERCISES.TRANSPOSITION, levelId, customConfig })
  const { phase, setPhase, config, attemptNumber, lastResult, beginTimer, finishGame, resetSession, selectedUser } =
    session

  const [initialPieces, setInitialPieces] = useState([])
  const [patterns, setPatterns] = useState([]) // REVEAL_COUNT shuffled arrangements
  const [chosenIndex, setChosenIndex] = useState(0) // which pattern the player must recreate
  const [displayedPieces, setDisplayedPieces] = useState([]) // during the timed reveal
  const [playerPositions, setPlayerPositions] = useState({}) // pieceId -> {row,col}
  const [selectedPieceId, setSelectedPieceId] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryPending, setRetryPending] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const timeoutsRef = useRef([])

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  useEffect(() => () => clearTimeouts(), [])

  const positionsMatch = (a, b) => {
    const key = (p) => `${p.position.row}-${p.position.col}`
    const aKeys = new Set(a.map(key))
    return b.every((p) => aKeys.has(key(p))) && a.length === b.length
  }

  /** Build REVEAL_COUNT shuffled arrangements, none matching the one shown right before it (or the initial layout). */
  const buildPatterns = (base) => {
    const result = []
    let previous = base
    for (let i = 0; i < REVEAL_COUNT; i += 1) {
      let candidate
      do {
        candidate = shufflePieces(base, config.boardSize)
      } while (positionsMatch(candidate, previous))
      result.push(candidate)
      previous = candidate
    }
    return result
  }

  const handleStart = () => {
    clearTimeouts()
    const pieces = generatePieces(config.boardSize, config.pieceCount, config.sideMode)
    const built = buildPatterns(pieces)
    setInitialPieces(pieces)
    setPatterns(built)
    setChosenIndex(Math.floor(Math.random() * REVEAL_COUNT))
    setDisplayedPieces([])
    setPlayerPositions({})
    setSelectedPieceId(null)
    setComparison(null)
    setRetryCount(0)
    setRetryPending(false)
    setShowAnswer(false)
    beginTimer()
    setPhase(PHASES.MEMORIZING)
  }

  const handleFirstOk = () => {
    clearTimeouts()
    setDisplayedPieces(patterns[0])
    setPhase(PHASES.TRANSFORMATION)
    announce(`Pattern 1 of ${REVEAL_COUNT}.`)

    for (let i = 1; i < REVEAL_COUNT; i += 1) {
      const timeoutId = setTimeout(() => {
        setDisplayedPieces(patterns[i])
        announce(`Pattern ${i + 1} of ${REVEAL_COUNT}.`)
      }, i * REVEAL_INTERVAL_MS)
      timeoutsRef.current.push(timeoutId)
    }

    const solveTimeoutId = setTimeout(() => {
      setPlayerPositions({})
      setComparison(null)
      setPhase(PHASES.SOLVING)
    }, REVEAL_COUNT * REVEAL_INTERVAL_MS)
    timeoutsRef.current.push(solveTimeoutId)
  }

  const targetPattern = patterns[chosenIndex] || []
  const allPlaced = targetPattern.length > 0 && Object.keys(playerPositions).length === targetPattern.length

  const handleSelectPiece = (pieceId) => {
    setSelectedPieceId((current) => (current === pieceId ? null : pieceId))
  }

  const placeAt = (pieceId, position) => {
    setPlayerPositions((prev) => {
      const currentPieces = targetPattern.map((p) => ({ id: p.id, position: prev[p.id] || null }))
      if (isSquareOccupied(currentPieces.filter((p) => p.position), position, pieceId)) {
        return prev
      }
      return { ...prev, [pieceId]: position }
    })
    setSelectedPieceId(null)
  }

  const handlePlaceSelected = (position) => {
    if (!selectedPieceId) return
    placeAt(selectedPieceId, position)
  }

  const handleDropPiece = (pieceId, position) => {
    placeAt(pieceId, position)
  }

  const handleSubmit = () => {
    if (!allPlaced) return
    const playerArrangement = targetPattern.map((p) => ({ id: p.id, position: playerPositions[p.id] }))
    const result = comparePlacements(targetPattern, playerArrangement)
    setComparison(result)

    if (result.isPerfect) {
      setRetryPending(false)
      finishGame({
        correctCount: result.correctCount,
        totalPieces: result.total,
        mistakes: result.mistakes,
        difficultyMultiplier: 1.2,
      })
      return
    }

    if (retryCount < MAX_RETRIES) {
      setRetryCount((n) => n + 1)
      setRetryPending(true)
      setPhase(PHASES.RESULTS)
    } else {
      setRetryPending(false)
      finishGame({
        correctCount: result.correctCount,
        totalPieces: result.total,
        mistakes: result.mistakes,
        difficultyMultiplier: 1.2,
      })
    }
  }

  const handleRetry = () => {
    setPlayerPositions({})
    setSelectedPieceId(null)
    setComparison(null)
    setRetryPending(false)
    setPhase(PHASES.SOLVING)
  }

  const handlePlayAgain = () => {
    clearTimeouts()
    resetSession()
    setInitialPieces([])
    setPatterns([])
    setChosenIndex(0)
    setDisplayedPieces([])
    setPlayerPositions({})
    setSelectedPieceId(null)
    setComparison(null)
    setRetryCount(0)
    setRetryPending(false)
    setShowAnswer(false)
  }

  const boardPieces =
    phase === PHASES.MEMORIZING || phase === PHASES.WAITING_FIRST_CONFIRMATION
      ? initialPieces
      : phase === PHASES.TRANSFORMATION
        ? displayedPieces
        : phase === PHASES.RESULTS && showAnswer
          ? targetPattern
          : targetPattern
              .filter((p) => playerPositions[p.id])
              .map((p) => ({ ...p, position: playerPositions[p.id] }))

  const tray = phase === PHASES.SOLVING ? targetPattern.filter((p) => !playerPositions[p.id]) : []

  const pieceStateMap = {}
  if (comparison && phase === PHASES.RESULTS && !showAnswer) {
    comparison.perPiece.forEach((r) => {
      pieceStateMap[r.id] = r.correct ? 'correct' : 'incorrect'
    })
  }

  const okEnabled =
    phase === PHASES.MEMORIZING || phase === PHASES.WAITING_FIRST_CONFIRMATION
      ? true
      : phase === PHASES.SOLVING
        ? allPlaced
        : false

  const handleOk =
    phase === PHASES.MEMORIZING || phase === PHASES.WAITING_FIRST_CONFIRMATION ? handleFirstOk : handleSubmit

  const retriesRemaining = MAX_RETRIES - retryCount

  const resultsHelperText = retryPending
    ? comparison
      ? `Not quite - ${comparison.correctCount}/${comparison.total} correct. ${retriesRemaining} retr${retriesRemaining === 1 ? 'y' : 'ies'} left.`
      : ''
    : lastResult
      ? `${lastResult.correctCount}/${lastResult.totalPieces} correct - score ${lastResult.score}.`
      : ''

  const helperText = {
    [PHASES.IDLE]: 'Click Start. Memorize the initial layout, then watch it reshuffle three times - you must recreate one flagged pattern from memory.',
    [PHASES.MEMORIZING]: 'Memorize the initial layout, then click OK to begin the reshuffles.',
    [PHASES.WAITING_FIRST_CONFIRMATION]: 'Click OK when ready to continue.',
    [PHASES.TRANSFORMATION]: 'Watch closely - three new placements, five seconds apart.',
    [PHASES.SOLVING]: allPlaced
      ? `Recreate pattern #${chosenIndex + 1}. Click Submit.`
      : `Recreate pattern #${chosenIndex + 1}. ${tray.length} piece(s) remaining.`,
    [PHASES.RESULTS]: resultsHelperText,
  }[phase]

  return (
    <div>
      <GameStatus
        userName={selectedUser?.name}
        exercise={EXERCISES.TRANSPOSITION}
        levelId={levelId}
        score={lastResult?.score}
        phase={phase}
        attemptNumber={attemptNumber}
      />

      <div className="panel" style={{ textAlign: 'center' }}>
        <ChessBoard
          boardSize={config.boardSize}
          pieces={boardPieces}
          showCoordinates={config.showCoordinates ?? true}
          selectedPieceId={selectedPieceId}
          onSelectPiece={handleSelectPiece}
          onPlaceSelected={handlePlaceSelected}
          onDropPiece={handleDropPiece}
          pieceStateMap={pieceStateMap}
          interactive={phase === PHASES.SOLVING}
          label="Transposition exercise board"
        />

        {phase === PHASES.SOLVING && (
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Pieces to place</h3>
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', minHeight: '2.5rem' }}
              role="group"
              aria-label="Unplaced pieces"
            >
              {tray.length === 0 && <span className="sr-only">All pieces placed.</span>}
              {tray.map((p) => (
                <span key={p.id} style={{ width: '3.2rem', height: '3.2rem', flex: 'none' }}>
                  <Piece
                    id={p.id}
                    side={p.side}
                    type={p.type}
                    label={`${p.side} ${p.type} piece, unplaced`}
                    state={selectedPieceId === p.id ? 'selected' : undefined}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/piece-id', p.id)}
                    onClick={handleSelectPiece}
                    onKeyDown={(e, id) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSelectPiece(id)
                      }
                    }}
                  />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {phase === PHASES.RESULTS && retryPending ? (
        <div className="game-controls">
          <p className="game-controls__helper" aria-live="off">
            {helperText}
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={handleRetry} autoFocus>
              Retry?
            </button>
          </div>
        </div>
      ) : (
        <GameControls
          phase={phase}
          onStart={handleStart}
          onOk={handleOk}
          onAnswer={() => setShowAnswer((v) => !v)}
          onPlayAgain={handlePlayAgain}
          onRestart={handlePlayAgain}
          okEnabled={okEnabled}
          okLabel={phase === PHASES.SOLVING ? 'Submit' : 'OK'}
          showAnswer={Boolean(comparison)}
          helperText={helperText}
        />
      )}
    </div>
  )
}

export default TranspositionExercise
