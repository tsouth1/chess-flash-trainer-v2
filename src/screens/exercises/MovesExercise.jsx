import React, { useState } from 'react'
import ChessBoard from '../../components/ChessBoard.jsx'
import Piece from '../../components/Piece.jsx'
import GameControls from '../../components/GameControls.jsx'
import GameStatus from '../../components/GameStatus.jsx'
import { useGameSession } from '../../game/useGameSession.js'
import { generatePieces, comparePlacements, isSquareOccupied } from '../../game/placement.js'
import { generateMoveSet, moveListDescription } from '../../game/movement.js'
import { PHASES, EXERCISES, DIRECTION_LABELS } from '../../game/config.js'

function MovesExercise({ levelId, customConfig }) {
  const session = useGameSession({ exercise: EXERCISES.MOVES, levelId, customConfig })
  const { phase, setPhase, config, attemptNumber, lastResult, beginTimer, finishGame, resetSession, selectedUser } =
    session

  const [startPieces, setStartPieces] = useState([])
  const [moves, setMoves] = useState([])
  const [targetPieces, setTargetPieces] = useState([])
  const [playerPositions, setPlayerPositions] = useState({})
  const [selectedPieceId, setSelectedPieceId] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const handleStart = () => {
    const pieces = generatePieces(config.boardSize, config.pieceCount, config.colors)
    const { moves: moveList, resultingPieces } = generateMoveSet(pieces, config.boardSize, config.movementComplexity || 1)
    setStartPieces(pieces)
    setMoves(moveList)
    setTargetPieces(resultingPieces)
    setPlayerPositions({})
    setComparison(null)
    setShowAnswer(false)
    beginTimer()
    setPhase(PHASES.MEMORIZING)
  }

  const handleFirstOk = () => {
    setPhase(PHASES.TRANSFORMATION) // showing the move list, board hidden
  }

  const handleSecondOk = () => {
    setPhase(PHASES.SOLVING) // move list hidden, board shown empty for placement
  }

  const allPlaced = targetPieces.length > 0 && Object.keys(playerPositions).length === targetPieces.length

  const placeAt = (pieceId, position) => {
    setPlayerPositions((prev) => {
      const currentPieces = targetPieces.map((p) => ({ id: p.id, position: prev[p.id] || null }))
      if (isSquareOccupied(currentPieces.filter((p) => p.position), position, pieceId)) return prev
      return { ...prev, [pieceId]: position }
    })
    setSelectedPieceId(null)
  }

  const handleSubmit = () => {
    if (!allPlaced) return
    const playerArrangement = targetPieces.map((p) => ({ id: p.id, position: playerPositions[p.id] }))
    const result = comparePlacements(targetPieces, playerArrangement)
    setComparison(result)
    finishGame({ correctCount: result.correctCount, totalPieces: result.total, mistakes: result.mistakes })
  }

  const handlePlayAgain = () => {
    resetSession()
    setStartPieces([])
    setMoves([])
    setTargetPieces([])
    setPlayerPositions({})
    setComparison(null)
    setShowAnswer(false)
  }

  const pieceStateMap = {}
  if (comparison && phase === PHASES.RESULTS && !showAnswer) {
    comparison.perPiece.forEach((r) => {
      pieceStateMap[r.id] = r.correct ? 'correct' : 'incorrect'
    })
  }

  const boardPieces =
    phase === PHASES.MEMORIZING || phase === PHASES.WAITING_FIRST_CONFIRMATION
      ? startPieces
      : phase === PHASES.RESULTS && showAnswer
        ? targetPieces
        : phase === PHASES.RESULTS
          ? targetPieces.filter((p) => playerPositions[p.id]).map((p) => ({ ...p, position: playerPositions[p.id] }))
          : targetPieces.filter((p) => playerPositions[p.id]).map((p) => ({ ...p, position: playerPositions[p.id] }))

  const tray = phase === PHASES.SOLVING ? targetPieces.filter((p) => !playerPositions[p.id]) : []

  const okEnabled =
    phase === PHASES.MEMORIZING || phase === PHASES.TRANSFORMATION ? true : phase === PHASES.SOLVING ? allPlaced : false

  const handleOk =
    phase === PHASES.MEMORIZING || phase === PHASES.WAITING_FIRST_CONFIRMATION
      ? handleFirstOk
      : phase === PHASES.TRANSFORMATION
        ? handleSecondOk
        : handleSubmit

  const helperText = {
    [PHASES.IDLE]: 'Advanced mode: memorize the board, then calculate where each piece moves to.',
    [PHASES.MEMORIZING]: 'Memorize the starting positions, then click OK to see the move list.',
    [PHASES.TRANSFORMATION]: 'Read each move, then click OK to hide the list and place the pieces.',
    [PHASES.SOLVING]: allPlaced ? 'All pieces placed. Click Submit.' : `Place each piece on its calculated new square. ${tray.length} remaining.`,
    [PHASES.RESULTS]: lastResult ? `${lastResult.correctCount}/${lastResult.totalPieces} correct - score ${lastResult.score}.` : '',
  }[phase]

  return (
    <div>
      <GameStatus
        userName={selectedUser?.name}
        exercise={EXERCISES.MOVES}
        levelId={levelId}
        score={lastResult?.score}
        phase={phase}
        attemptNumber={attemptNumber}
      />

      {phase === PHASES.TRANSFORMATION && (
        <div className="panel">
          <h2>Move list</h2>
          <ul>
            {moves.map((m) => {
              const piece = startPieces.find((p) => p.id === m.pieceId)
              return (
                <li key={m.pieceId}>
                  {moveListDescription(m, `${piece?.type} piece (${piece?.color})`, DIRECTION_LABELS)}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {phase !== PHASES.TRANSFORMATION && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <ChessBoard
            boardSize={config.boardSize}
            pieces={boardPieces}
            showCoordinates={config.showCoordinates ?? true}
            selectedPieceId={selectedPieceId}
            onSelectPiece={(id) => setSelectedPieceId((cur) => (cur === id ? null : id))}
            onPlaceSelected={(pos) => selectedPieceId && placeAt(selectedPieceId, pos)}
            onDropPiece={(pieceId, pos) => placeAt(pieceId, pos)}
            pieceStateMap={pieceStateMap}
            interactive={phase === PHASES.SOLVING}
            label="Moves exercise board"
          />

          {phase === PHASES.SOLVING && (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Pieces to place</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }} role="group" aria-label="Unplaced pieces">
                {tray.map((p) => (
                  <span key={p.id} style={{ width: '3.2rem', height: '3.2rem', flex: 'none' }}>
                    <Piece
                      id={p.id}
                      color={p.color}
                      type={p.type}
                      label={`${p.type} piece, unplaced`}
                      state={selectedPieceId === p.id ? 'selected' : undefined}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/piece-id', p.id)}
                      onClick={(id) => setSelectedPieceId((cur) => (cur === id ? null : id))}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GameControls
        phase={phase}
        onStart={handleStart}
        onOk={handleOk}
        onAnswer={() => setShowAnswer((v) => !v)}
        onPlayAgain={handlePlayAgain}
        onBackToLevels={handlePlayAgain}
        okEnabled={okEnabled}
        okLabel={phase === PHASES.SOLVING ? 'Submit' : 'OK'}
        showAnswer={Boolean(comparison)}
        helperText={helperText}
      />
    </div>
  )
}

export default MovesExercise
