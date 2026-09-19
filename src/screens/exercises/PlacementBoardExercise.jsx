import React, { useCallback, useState } from 'react'
import ChessBoard from '../../components/ChessBoard.jsx'
import Piece from '../../components/Piece.jsx'
import GameControls from '../../components/GameControls.jsx'
import GameStatus from '../../components/GameStatus.jsx'
import { useGameSession } from '../../game/useGameSession.js'
import { generatePieces, comparePlacements, isSquareOccupied } from '../../game/placement.js'
import { PHASES } from '../../game/config.js'

/**
 * Statics exercise engine: memorize a placement, the board clears, then
 * reconstruct the same placement from the tray. (Transposition used to
 * share this engine via a `transpose` prop - it's now its own component,
 * TranspositionExercise.jsx, since its timed multi-reveal + retry flow no
 * longer fits this single-transform model. See TODO.md for the history.)
 */
function PlacementBoardExercise({ exercise, levelId, customConfig }) {
  const session = useGameSession({ exercise, levelId, customConfig })
  const { phase, setPhase, config, attemptNumber, lastResult, beginTimer, finishGame, resetSession, selectedUser } =
    session

  const [targetPieces, setTargetPieces] = useState([])
  const [playerPositions, setPlayerPositions] = useState({}) // pieceId -> {row,col}
  const [selectedPieceId, setSelectedPieceId] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const handleStart = () => {
    const pieces = generatePieces(config.boardSize, config.pieceCount, config.sideMode)
    setTargetPieces(pieces)
    setPlayerPositions({})
    setSelectedPieceId(null)
    setComparison(null)
    setShowAnswer(false)
    beginTimer()
    setPhase(PHASES.MEMORIZING)
  }

  const handleFirstOk = () => {
    setPlayerPositions({})
    setComparison(null)
    setPhase(PHASES.SOLVING)
  }

  const allPlaced = targetPieces.length > 0 && Object.keys(playerPositions).length === targetPieces.length

  const handleSelectPiece = useCallback((pieceId) => {
    setSelectedPieceId((current) => (current === pieceId ? null : pieceId))
  }, [])

  const placeAt = useCallback(
    (pieceId, position) => {
      setPlayerPositions((prev) => {
        const currentPieces = targetPieces.map((p) => ({ id: p.id, position: prev[p.id] || null }))
        if (isSquareOccupied(currentPieces.filter((p) => p.position), position, pieceId)) {
          return prev
        }
        return { ...prev, [pieceId]: position }
      })
      setSelectedPieceId(null)
    },
    [targetPieces],
  )

  const handlePlaceSelected = useCallback(
    (position) => {
      if (!selectedPieceId) return
      placeAt(selectedPieceId, position)
    },
    [selectedPieceId, placeAt],
  )

  const handleDropPiece = useCallback(
    (pieceId, position) => {
      placeAt(pieceId, position)
    },
    [placeAt],
  )

  const handleSecondOk = () => {
    if (!allPlaced) return
    const playerArrangement = targetPieces.map((p) => ({ id: p.id, position: playerPositions[p.id] }))
    const result = comparePlacements(targetPieces, playerArrangement)
    setComparison(result)
    finishGame({
      correctCount: result.correctCount,
      totalPieces: result.total,
      mistakes: result.mistakes,
    })
  }

  const handlePlayAgain = () => {
    resetSession()
    setTargetPieces([])
    setPlayerPositions({})
    setComparison(null)
    setShowAnswer(false)
  }

  const boardPieces =
    phase === PHASES.MEMORIZING || phase === PHASES.WAITING_FIRST_CONFIRMATION
      ? targetPieces
      : phase === PHASES.RESULTS && showAnswer
        ? targetPieces
        : targetPieces
            .filter((p) => playerPositions[p.id])
            .map((p) => ({ ...p, position: playerPositions[p.id] }))

  const tray = phase === PHASES.SOLVING ? targetPieces.filter((p) => !playerPositions[p.id]) : []

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

  const helperText = {
    [PHASES.IDLE]: 'Click Start to begin. Memorize the piece positions before they’re hidden.',
    [PHASES.MEMORIZING]: 'Memorize the board, then click OK when ready.',
    [PHASES.WAITING_FIRST_CONFIRMATION]: 'Click OK when ready to continue.',
    [PHASES.SOLVING]: allPlaced
      ? 'All pieces placed. Click OK to submit your answer.'
      : `Place all ${targetPieces.length} pieces back onto their original squares. ${tray.length} remaining.`,
    [PHASES.RESULTS]: lastResult
      ? `${lastResult.correctCount}/${lastResult.totalPieces} correct - score ${lastResult.score}.`
      : '',
  }[phase]

  return (
    <div>
      <GameStatus
        userName={selectedUser?.name}
        exercise={exercise}
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
          label={`${exercise} exercise board`}
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

      <GameControls
        phase={phase}
        onStart={handleStart}
        onOk={phase === PHASES.SOLVING ? handleSecondOk : handleFirstOk}
        onAnswer={() => setShowAnswer((v) => !v)}
        onPlayAgain={handlePlayAgain}
        onRestart={handlePlayAgain}
        okEnabled={okEnabled}
        okLabel={phase === PHASES.SOLVING ? 'Submit' : 'OK'}
        showAnswer={Boolean(comparison)}
        helperText={helperText}
      />
    </div>
  )
}

export default PlacementBoardExercise
