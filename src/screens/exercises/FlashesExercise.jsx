import React, { useEffect, useRef, useState } from 'react'
import ChessBoard from '../../components/ChessBoard.jsx'
import GameControls from '../../components/GameControls.jsx'
import GameStatus from '../../components/GameStatus.jsx'
import { useGameSession } from '../../game/useGameSession.js'
import { generatePieces, shufflePieces, comparePlacements } from '../../game/placement.js'
import { PHASES, EXERCISES } from '../../game/config.js'

/**
 * Flashes: the board repeatedly reshuffles. Exactly one of the flash frames
 * (chosen at random, never frame 0) matches the original arrangement again -
 * the player must click OK the instant they see it. Reflex + memory.
 */
function FlashesExercise({ levelId, customConfig }) {
  const session = useGameSession({ exercise: EXERCISES.FLASHES, levelId, customConfig })
  const { phase, setPhase, config, attemptNumber, lastResult, beginTimer, finishGame, resetSession, selectedUser } =
    session

  const [originalPieces, setOriginalPieces] = useState([])
  const [displayedPieces, setDisplayedPieces] = useState([])
  const [matchFrameIndex, setMatchFrameIndex] = useState(-1)
  const [frameIndex, setFrameIndex] = useState(0)
  const [wasCorrect, setWasCorrect] = useState(null)
  const framesRef = useRef([])
  const intervalRef = useRef(null)
  const frameCounterRef = useRef(0)

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const positionsMatch = (a, b) => {
    const key = (p) => `${p.position.row}-${p.position.col}`
    const aKeys = new Set(a.map(key))
    return b.every((p) => aKeys.has(key(p))) && a.length === b.length
  }

  const buildFrames = (original) => {
    const flashCount = Math.max(2, config.flashCount || 5)
    const matchIndex = 1 + Math.floor(Math.random() * (flashCount - 1)) // never the first flash
    const frames = []
    for (let i = 0; i < flashCount; i += 1) {
      if (i === matchIndex) {
        frames.push(original)
      } else {
        let candidate
        do {
          candidate = shufflePieces(original, config.boardSize)
        } while (positionsMatch(candidate, original))
        frames.push(candidate)
      }
    }
    return { frames, matchIndex }
  }

  const handleStart = () => {
    const pieces = generatePieces(config.boardSize, config.pieceCount, config.sideMode)
    setOriginalPieces(pieces)
    setDisplayedPieces(pieces)
    setWasCorrect(null)
    beginTimer()
    setPhase(PHASES.MEMORIZING)

    setTimeout(() => {
      const { frames, matchIndex } = buildFrames(pieces)
      framesRef.current = frames
      frameCounterRef.current = 0
      setMatchFrameIndex(matchIndex)
      setPhase(PHASES.TRANSFORMATION)
      setFrameIndex(0)
      setDisplayedPieces(frames[0])

      intervalRef.current = setInterval(() => {
        frameCounterRef.current += 1
        if (frameCounterRef.current >= frames.length) {
          clearInterval(intervalRef.current)
          handleSubmit(frames.length - 1, frames[frames.length - 1])
          return
        }
        setFrameIndex(frameCounterRef.current)
        setDisplayedPieces(frames[frameCounterRef.current])
      }, config.flashIntervalMs || 900)
    }, (config.memorizationSeconds || 5) * 1000)
  }

  const handleSubmit = (clickedFrameIndex, clickedFrame) => {
    clearInterval(intervalRef.current)
    const correct = clickedFrameIndex === matchFrameIndex || positionsMatch(clickedFrame, originalPieces)
    const comparison = comparePlacements(originalPieces, clickedFrame)
    setWasCorrect(correct)
    setPhase(PHASES.SUBMITTING)
    finishGame({
      correctCount: correct ? originalPieces.length : comparison.correctCount,
      totalPieces: originalPieces.length,
      mistakes: correct ? 0 : Math.max(1, originalPieces.length - comparison.correctCount),
      difficultyMultiplier: 1.15,
    })
  }

  const handleOk = () => {
    if (phase !== PHASES.TRANSFORMATION) return
    handleSubmit(frameIndex, displayedPieces)
  }

  const handlePlayAgain = () => {
    resetSession()
    setOriginalPieces([])
    setDisplayedPieces([])
    setWasCorrect(null)
  }

  const boardPieces = phase === PHASES.RESULTS ? originalPieces : displayedPieces

  const helperText = {
    [PHASES.IDLE]: 'Click Start. Watch the board flash - click OK the instant it matches the original layout.',
    [PHASES.MEMORIZING]: 'Memorize the original layout...',
    [PHASES.TRANSFORMATION]: 'Watching for the original layout to reappear - click OK now if this is it!',
    [PHASES.SUBMITTING]: 'Checking...',
    [PHASES.RESULTS]: wasCorrect === null ? '' : wasCorrect ? 'Correct! You caught the original layout.' : "That wasn't the original layout - here it is.",
  }[phase]

  return (
    <div>
      <GameStatus
        userName={selectedUser?.name}
        exercise={EXERCISES.FLASHES}
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
          interactive={false}
          label="Flashes exercise board"
        />
        {phase === PHASES.RESULTS && wasCorrect !== null && (
          <p aria-live="polite" style={{ marginTop: '0.75rem' }}>
            <span className={`tag ${wasCorrect ? 'tag-success' : 'tag-fail'}`}>
              {wasCorrect ? 'Correct moment' : 'Incorrect moment'}
            </span>
          </p>
        )}
      </div>

      <GameControls
        phase={phase}
        onStart={handleStart}
        onOk={handleOk}
        onPlayAgain={handlePlayAgain}
        onBackToLevels={handlePlayAgain}
        okEnabled={phase === PHASES.TRANSFORMATION}
        okLabel="OK - This Is It!"
        showAnswer={false}
        helperText={helperText}
      />
    </div>
  )
}

export default FlashesExercise
