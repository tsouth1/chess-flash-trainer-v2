/**
 * Pure aggregation functions over a user's session history. Statistics.jsx
 * and Leaderboard.jsx should be thin render layers over this module's output.
 *
 * A "session" record shape (appended by GameContext on each completed game):
 * {
 *   date: ISOString,
 *   exercise: 'statics' | 'transposition' | 'flashes' | 'moves' | 'superMoves',
 *   levelId: number,
 *   score: number,
 *   success: boolean,
 *   timeSeconds: number,
 * }
 */

export function aggregateUserStats(sessions) {
  const totalGames = sessions.length
  const completed = sessions.length // every appended session is a completed attempt
  const successful = sessions.filter((s) => s.success).length
  const failed = completed - successful
  const successRate = completed > 0 ? Math.round((successful / completed) * 100) : 0
  const bestScore = sessions.reduce((max, s) => Math.max(max, s.score), 0)
  const averageScore = completed > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / completed) : 0
  const averageTime =
    completed > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.timeSeconds, 0) / completed) : 0

  const bestByExercise = {}
  sessions.forEach((s) => {
    const current = bestByExercise[s.exercise]
    if (!current || s.score > current.score) {
      bestByExercise[s.exercise] = { score: s.score, levelId: s.levelId, date: s.date }
    }
  })

  const recent = [...sessions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20)

  return {
    totalGames,
    completed,
    successful,
    failed,
    successRate,
    bestScore,
    averageScore,
    averageTime,
    bestByExercise,
    recent,
  }
}

export function aggregateLeaderboard(usersWithSessions) {
  // usersWithSessions: [{ id, name, sessions, completedLevels }]
  return usersWithSessions
    .map(({ id, name, sessions, completedLevels }) => {
      const stats = aggregateUserStats(sessions)
      const totalScore = sessions.reduce((sum, s) => sum + s.score, 0)
      const bestLevel = completedLevels.length > 0 ? Math.max(...completedLevels) : 0
      return {
        id,
        name,
        totalScore,
        successRate: stats.successRate,
        bestLevel,
        gamesCompleted: stats.completed,
        averageScore: stats.averageScore,
      }
    })
    .sort((a, b) => b.totalScore - a.totalScore)
}

export const LEADERBOARD_SORTS = {
  score: (a, b) => b.totalScore - a.totalScore,
  successRate: (a, b) => b.successRate - a.successRate,
  level: (a, b) => b.bestLevel - a.bestLevel,
}
