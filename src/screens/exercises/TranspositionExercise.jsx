import React from 'react'
import PlacementBoardExercise from './PlacementBoardExercise.jsx'
import { EXERCISES } from '../../game/config.js'

function TranspositionExercise({ levelId, customConfig }) {
  return (
    <PlacementBoardExercise exercise={EXERCISES.TRANSPOSITION} levelId={levelId} customConfig={customConfig} transpose />
  )
}

export default TranspositionExercise
