import React, { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { loadStats, clearStats, loadAchievements } from '../utils/storage.js'
import { aggregateUserStats } from '../utils/statsAggregation.js'
import { EXERCISE_LABELS } from '../game/config.js'
import { LEVELS } from '../game/levels.js'
import Modal from '../components/Modal.jsx'

function Statistics() {
  const { selectedUser, showToast } = useApp()
  const [sessions, setSessions] = useState([])
  const [achievements, setAchievements] = useState({ completedLevels: [], bestScoresByExercise: {} })
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    if (!selectedUser) return
    setSessions(loadStats(selectedUser.id))
    setAchievements(loadAchievements(selectedUser.id))
  }, [selectedUser])

  if (!selectedUser) return null

  const stats = aggregateUserStats(sessions)

  const handleClear = () => {
    clearStats(selectedUser.id)
    setSessions([])
    setConfirmClear(false)
    showToast('Statistics cleared.', 'success')
  }

  return (
    <div>
      <h1>Statistics</h1>
      <p style={{ color: 'var(--color-text-dim)' }}>
        Current user: <strong>{selectedUser.name}</strong>
      </p>

      <div className="panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        <Stat label="Total games played" value={stats.totalGames} />
        <Stat label="Games completed" value={stats.completed} />
        <Stat label="Successful games" value={stats.successful} />
        <Stat label="Failed games" value={stats.failed} />
        <Stat label="Success rate" value={`${stats.successRate}%`} />
        <Stat label="Best score" value={stats.bestScore} />
        <Stat label="Average score" value={stats.averageScore} />
        <Stat label="Average time" value={`${stats.averageTime}s`} />
      </div>

      <div className="panel">
        <h2>Best result per exercise</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Exercise</th>
              <th scope="col">Best score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(EXERCISE_LABELS)
              .filter(([key]) => key !== 'custom')
              .map(([key, label]) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td>{achievements.bestScoresByExercise?.[key] ?? '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Level progress</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {LEVELS.map((lvl) => (
            <span key={lvl.id} className={`tag ${achievements.completedLevels.includes(lvl.id) ? 'tag-success' : 'tag-fail'}`}>
              {lvl.name} {achievements.completedLevels.includes(lvl.id) ? 'complete' : 'incomplete'}
            </span>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Recent game history</h2>
        {stats.recent.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>No games played yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Exercise</th>
                <th scope="col">Level</th>
                <th scope="col">Score</th>
                <th scope="col">Result</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((s, i) => (
                <tr key={i}>
                  <td>{new Date(s.date).toLocaleString()}</td>
                  <td>{EXERCISE_LABELS[s.exercise] || s.exercise}</td>
                  <td>{s.levelId ?? 'Custom'}</td>
                  <td>{s.score}</td>
                  <td>
                    <span className={`tag ${s.success ? 'tag-success' : 'tag-fail'}`}>{s.success ? 'Success' : 'Failure'}</span>
                  </td>
                  <td>{s.timeSeconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-danger" onClick={() => setConfirmClear(true)}>
          Clear Statistics
        </button>
      </div>

      {confirmClear && (
        <Modal
          title="Clear all statistics?"
          onClose={() => setConfirmClear(false)}
          actions={
            <>
              <button type="button" className="btn btn-danger" onClick={handleClear}>
                Yes, clear my statistics
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
            </>
          }
        >
          <p>This permanently deletes all recorded game history for {selectedUser.name}. This cannot be undone.</p>
        </Modal>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
    </div>
  )
}

export default Statistics
