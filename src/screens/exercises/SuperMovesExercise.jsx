import React, { useState } from 'react'
import ChessBoard from '../../components/ChessBoard.jsx'
import Piece from '../../components/Piece.jsx'
import GameControls from '../../components/GameControls.jsx'
import GameStatus from '../../components/GameStatus.jsx'
import { useGameSession } from '../../game/useGameSession.js'
import { generatePieces, comparePlacements, coordinateToSquare } from '../../game/placement.js'
import { generateMoveSet, moveListDescription } from '../../game/movement.js'
import { PHASES, EXERCISES, DIRECTION_LABELS } from '../../game/config.js'

/**
 * Super Moves: after the move list is hidden, the board is NOT shown again.
 * The player must select each piece's new coordinate (e.g. "E4") directly,
 * with no visual board to place onto - the hardest of the five exercises.
 */
function SuperMovesExercise({ levelId, customConfig }) {
  const session = useGameSession({ exercise: EXERCISES.SUPER_MOVES, levelId, customConfig })
  const { phase, setPhase, config, attemptNumber, lastResult, beginTimer, finishGame, resetSession, selectedUser } =
    session

  const [startPieces, setStartPieces] = useState([])
  const [moves, setMoves] = useState([])
  const [targetPieces, setTargetPieces] = useState([])
  const [selections, setSelections] = useState({}) // pieceId -> { file, rank }
  const [comparison, setComparison] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [duplicateError, setDuplicateError] = useState('')

  const handleStart = () => {
    const pieces = generatePieces(config.boardSize, config.pieceCount, config.sideMode)
    const { moves: moveList, resultingPieces } = generateMoveSet(pieces, config.boardSize, config.movementComplexity || 2)
    setStartPieces(pieces)
    setMoves(moveList)
    setTargetPieces(resultingPieces)
    setSelections({})
    setComparison(null)
    setShowAnswer(false)
    setDuplicateError('')
    beginTimer()
    setPhase(PHASES.MEMORIZING)
  }

  const handleFirstOk = () => setPhase(PHASES.TRANSFORMATION) // showing move list
  const handleSecondOk = () => setPhase(PHASES.SOLVING) // coordinate-entry interface, no board

  const files = Array.from({ length: config.boardSize }, (_, i) => String.fromCharCode(65 + i))
  const ranks = Array.from({ length: config.boardSize }, (_, i) => config.boardSize - i)

  const updateSelection = (pieceId, key, value) => {
    setSelections((prev) => ({ ...prev, [pieceId]: { ...prev[pieceId], [key]: value } }))
    setDuplicateError('')
  }

  const allSelected = targetPieces.every((p) => selections[p.id]?.file && selections[p.id]?.rank)

  const handleSubmit = () => {
    if (!allSelected) return
    const coords = targetPieces.map((p) => `${selections[p.id].file}${selections[p.id].rank}`)
    if (new Set(coords).size !== coords.length) {
      setDuplicateError('Two pieces can’t share the same square - please choose distinct squares.')
      return
    }
    const playerArrangement = targetPieces.map((p) => ({
      id: p.id,
      position: coordinateToSquare(`${selections[p.id].file}${selections[p.id].rank}`, config.boardSize),
    }))
    const result = comparePlacements(targetPieces, playerArrangement)
    setComparison(result)
    finishGame({
      correctCount: result.correctCount,
      totalPieces: result.total,
      mistakes: result.mistakes,
      difficultyMultiplier: 1.3,
    })
  }

  const handlePlayAgain = () => {
    resetSession()
    setStartPieces([])
    setMoves([])
    setTargetPieces([])
    setSelections({})
    setComparison(null)
    setShowAnswer(false)
    setDuplicateError('')
  }

  const okEnabled =
    phase === PHASES.MEMORIZING || phase === PHASES.TRANSFORMATION ? true : phase === PHASES.SOLVING ? allSelected : false

  const handleOk =
    phase === PHASES.MEMORIZING || phase === PHASES.WAITING_FIRST_CONFIRMATION
      ? handleFirstOk
      : phase === PHASES.TRANSFORMATION
        ? handleSecondOk
        : handleSubmit

  const resultBoardPieces = showAnswer
    ? targetPieces
    : targetPieces.map((p) => {
        const sel = selections[p.id]
        if (!sel?.file || !sel?.rank) return p
        return { ...p, position: coordinateToSquare(`${sel.file}${sel.rank}`, config.boardSize) }
      })

  const pieceStateMap = {}
  if (comparison && phase === PHASES.RESULTS && !showAnswer) {
    comparison.perPiece.forEach((r) => {
      pieceStateMap[r.id] = r.correct ? 'correct' : 'incorrect'
    })
  }

  const helperText = {
    [PHASES.IDLE]: 'Advanced mode: no board while solving - you’ll pick each piece’s coordinate from memory.',
    [PHASES.MEMORIZING]: 'Memorize the starting positions, then click OK to see the move list.',
    [PHASES.TRANSFORMATION]: 'Read each move, then click OK - the board will NOT reappear.',
    [PHASES.SOLVING]: 'Remember: columns A-H run left to right, rows count up from the bottom (1 nearest you). Select every piece’s new square.',
    [PHASES.RESULTS]: lastResult ? `${lastResult.correctCount}/${lastResult.totalPieces} correct - score ${lastResult.score}.` : '',
  }[phase]

  return (
    <div>
      <GameStatus
        userName={selectedUser?.name}
        exercise={EXERCISES.SUPER_MOVES}
        levelId={levelId}
        score={lastResult?.score}
        phase={phase}
        attemptNumber={attemptNumber}
      />

      {(phase === PHASES.MEMORIZING || phase === PHASES.WAITING_FIRST_CONFIRMATION) && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <ChessBoard boardSize={config.boardSize} pieces={startPieces} interactive={false} label="Super Moves starting board" />
        </div>
      )}

      {phase === PHASES.TRANSFORMATION && (
        <div className="panel">
          <h2>Move list</h2>
          <ul>
            {moves.map((m) => {
              const piece = startPieces.find((p) => p.id === m.pieceId)
              return (
                <li key={m.pieceId}>{moveListDescription(m, `${piece?.side} ${piece?.type} piece`, DIRECTION_LABELS)}</li>
              )
            })}
          </ul>
        </div>
      )}

      {phase === PHASES.SOLVING && (
        <div className="panel">
          <h2>Select each piece&rsquo;s new square</h2>
          <p style={{ color: 'var(--color-text-dim)' }}>Columns A-{files[files.length - 1]} left to right, rows 1-{config.boardSize} bottom to top.</p>
          <table>
            <thead>
              <tr>
                <th scope="col">Piece</th>
                <th scope="col">Column</th>
                <th scope="col">Row</th>
              </tr>
            </thead>
            <tbody>
              {targetPieces.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '2.4rem', height: '2.4rem', flex: 'none' }}>
                        <Piece
                          id={p.id}
                          side={p.side}
                          type={p.type}
                          size="sm"
                          label={`${p.side} ${p.type} piece`}
                          tabIndex={-1}
                        />
                      </span>
                      <span className="sr-only">{`${p.side} ${p.type}`}</span>
                    </span>
                  </td>
                  <td>
                    <label className="sr-only" htmlFor={`file-${p.id}`}>
                      Column for {p.side} {p.type} piece
                    </label>
                    <select id={`file-${p.id}`} value={selections[p.id]?.file || ''} onChange={(e) => updateSelection(p.id, 'file', e.target.value)}>
                      <option value="" disabled>
                        --
                      </option>
                      {files.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <label className="sr-only" htmlFor={`rank-${p.id}`}>
                      Row for {p.side} {p.type} piece
                    </label>
                    <select id={`rank-${p.id}`} value={selections[p.id]?.rank || ''} onChange={(e) => updateSelection(p.id, 'rank', e.target.value)}>
                      <option value="" disabled>
                        --
                      </option>
                      {ranks.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {duplicateError && <p className="error-text">{duplicateError}</p>}
        </div>
      )}

      {phase === PHASES.RESULTS && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <ChessBoard boardSize={config.boardSize} pieces={resultBoardPieces} pieceStateMap={pieceStateMap} interactive={false} label="Super Moves result board" />
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

export default SuperMovesExercise
