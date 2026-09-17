import React from 'react'
import PlacementBoardExercise from './PlacementBoardExercise.jsx'
import { EXERCISES } from '../../game/config.js'

function StaticsExercise({ levelId, customConfig }) {
  return <PlacementBoardExercise exercise={EXERCISES.STATICS} levelId={levelId} customConfig={customConfig} transpose={false} />
}

export default StaticsExercise
