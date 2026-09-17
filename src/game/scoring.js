/**
 * Deterministic, transparent scoring.
 *
 * finalScore =
 *   (correctCount * BASE_PER_PIECE * levelMultiplier)
 *   + (isPerfect ? NO_MISTAKE_BONUS * levelMultiplier : 0)
 *   + speedBonus
 *   - (mistakes * MISTAKE_PENALTY)
 *
 * speedBonus rewards finishing well under the allotted time, scaled by
 * difficulty (board size / piece count) so bigger boards give more room.
 */

export const BASE_PER_PIECE = 40
export const NO_MISTAKE_BONUS = 60
export const MISTAKE_PENALTY = 25
export const MAX_SPEED_BONUS = 120

export function computeLevelMultiplier(levelId) {
  return 1 + (levelId - 1) * 0.25
}

export function computeSpeedBonus(elapsedSeconds, parSeconds) {
  if (!parSeconds || elapsedSeconds >= parSeconds) return 0
  const ratio = 1 - elapsedSeconds / parSeconds
  return Math.round(MAX_SPEED_BONUS * Math.max(0, Math.min(1, ratio)))
}

/**
 * @param {Object} params
 * @param {number} params.correctCount
 * @param {number} params.totalPieces
 * @param {number} params.mistakes
 * @param {number} params.levelId
 * @param {number} params.elapsedSeconds
 * @param {number} params.parSeconds - "expected" completion time for a full speed bonus
 * @param {number} [params.difficultyMultiplier] - extra multiplier for harder exercises (e.g. Super Moves)
 */
export function computeScore({
  correctCount,
  totalPieces,
  mistakes,
  levelId,
  elapsedSeconds,
  parSeconds,
  difficultyMultiplier = 1,
}) {
  const levelMultiplier = computeLevelMultiplier(levelId)
  const isPerfect = mistakes === 0 && correctCount === totalPieces

  const basePoints = Math.round(correctCount * BASE_PER_PIECE * levelMultiplier * difficultyMultiplier)
  const perfectBonus = isPerfect ? Math.round(NO_MISTAKE_BONUS * levelMultiplier) : 0
  const speedBonus = computeSpeedBonus(elapsedSeconds, parSeconds)
  const mistakePenalty = mistakes * MISTAKE_PENALTY

  const total = Math.max(0, basePoints + perfectBonus + speedBonus - mistakePenalty)

  return {
    total,
    breakdown: {
      basePoints,
      perfectBonus,
      speedBonus,
      mistakePenalty: -mistakePenalty,
      levelMultiplier,
      difficultyMultiplier,
    },
    isPerfect,
  }
}
