import React, { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { loadStats, loadAchievements } from '../utils/storage.js'
import { aggregateLeaderboard, LEADERBOARD_SORTS } from '../utils/statsAggregation.js'
import { isMultiuser } from '../game/config.js'

function Leaderboard() {
  const { users } = useApp()
  const [rows, setRows] = useState([])
  const [sortKey, setSortKey] = useState('score')

  useEffect(() => {
    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      sessions: loadStats(u.id),
      completedLevels: loadAchievements(u.id).completedLevels || [],
    }))
    setRows(aggregateLeaderboard(data))
  }, [users])

  const sorted = useMemo(() => [...rows].sort(LEADERBOARD_SORTS[sortKey]), [rows, sortKey])

  if (!isMultiuser()) {
    return (
      <div>
        <h1>Best Intelligencers</h1>
        <p>This leaderboard is only available in multiuser mode.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Best Intelligencers</h1>

      <div className="panel">
        <div className="field" style={{ maxWidth: '260px' }}>
          <label htmlFor="leaderboard-sort">Sort by</label>
          <select id="leaderboard-sort" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="score">Total score</option>
            <option value="successRate">Success rate</option>
            <option value="level">Best level</option>
          </select>
        </div>

        {sorted.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>No games played yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Username</th>
                <th scope="col">Total score</th>
                <th scope="col">Success rate</th>
                <th scope="col">Best level</th>
                <th scope="col">Games completed</th>
                <th scope="col">Average score</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={row.id}>
                  <td>{i + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.totalScore}</td>
                  <td>{row.successRate}%</td>
                  <td>{row.bestLevel || '-'}</td>
                  <td>{row.gamesCompleted}</td>
                  <td>{row.averageScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
