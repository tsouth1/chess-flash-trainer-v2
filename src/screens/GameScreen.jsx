import React, { useEffect } from 'react'
import { useApp, VIEWS } from '../context/AppContext.jsx'
import { EXERCISES } from '../game/config.js'
import StaticsExercise from './exercises/StaticsExercise.jsx'
import TranspositionExercise from './exercises/TranspositionExercise.jsx'
import FlashesExercise from './exercises/FlashesExercise.jsx'
import MovesExercise from './exercises/MovesExercise.jsx'
import SuperMovesExercise from './exercises/SuperMovesExercise.jsx'

const ENGINES = {
  [EXERCISES.STATICS]: StaticsExercise,
  [EXERCISES.TRANSPOSITION]: TranspositionExercise,
  [EXERCISES.FLASHES]: FlashesExercise,
  [EXERCISES.MOVES]: MovesExercise,
  [EXERCISES.SUPER_MOVES]: SuperMovesExercise,
}

function GameScreen() {
  const { pendingExercise, navigate } = useApp()

  useEffect(() => {
    if (!pendingExercise?.exercise) {
      navigate(VIEWS.LEVELS)
    }
  }, [pendingExercise, navigate])

  if (!pendingExercise?.exercise) return null

  const Engine = ENGINES[pendingExercise.exercise]
  if (!Engine) {
    navigate(VIEWS.LEVELS)
    return null
  }

  return <Engine levelId={pendingExercise.levelId} customConfig={pendingExercise.customConfig} />
}

export default GameScreen
