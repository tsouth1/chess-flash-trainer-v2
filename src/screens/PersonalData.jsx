import React, { useState } from 'react'
import { useApp, VIEWS } from '../context/AppContext.jsx'
import { APP_MODE, getMaxUsers, EXERCISES } from '../game/config.js'

function PersonalData() {
  const { users, selectedUser, selectedUserId, addUser, selectUser, deleteUser, navigate, setPendingExercise, showToast } =
    useApp()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const maxUsers = getMaxUsers()

  const handleAdd = (e) => {
    e.preventDefault()
    const result = addUser(name)
    if (!result.ok) {
      setError(result.reason)
      return
    }
    setError('')
    setName('')
  }

  const handleStart = () => {
    if (!selectedUser) {
      setError('Select or create a username first.')
      return
    }
    setPendingExercise({ exercise: EXERCISES.STATICS })
    navigate(VIEWS.LEVELS)
  }

  const handleDelete = (userId) => {
    if (confirmDeleteId !== userId) {
      setConfirmDeleteId(userId)
      return
    }
    const user = users.find((u) => u.id === userId)
    deleteUser(userId)
    setConfirmDeleteId(null)
    showToast(`Deleted user "${user?.name}" and their saved results.`, 'warning')
  }

  return (
    <div>
      <h1>Personal Data</h1>
      <p style={{ color: 'var(--color-text-dim)' }}>
        {APP_MODE === 'personal'
          ? 'Personal edition - one local profile.'
          : `Multiuser edition - up to ${maxUsers} local profiles on this device.`}
      </p>

      <div className="panel">
        <h2>Current user</h2>
        <p aria-live="polite">
          {selectedUser ? (
            <>
              Playing as <strong>{selectedUser.name}</strong>
            </>
          ) : (
            'No user selected.'
          )}
        </p>
      </div>

      <div className="panel">
        <h2>Select an existing username</h2>
        {users.length === 0 && <p style={{ color: 'var(--color-text-faint)' }}>No users yet - add one below.</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {users.map((u) => (
            <li
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                background: u.id === selectedUserId ? 'var(--color-panel-alt)' : 'transparent',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1, justifyContent: 'flex-start', border: 'none' }}
                onClick={() => selectUser(u.id)}
                aria-pressed={u.id === selectedUserId}
              >
                {u.name}
                {u.id === selectedUserId ? ' (selected)' : ''}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDelete(u.id)}
              >
                {confirmDeleteId === u.id ? 'Confirm delete?' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h2>Add a new user</h2>
        <form onSubmit={handleAdd}>
          <div className="field">
            <label htmlFor="username-input">Username</label>
            <input
              id="username-input"
              type="text"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Agent Amber"
            />
            {error && <span className="field-error">{error}</span>}
          </div>
          <div className="btn-row">
            <button type="submit" className="btn btn-accent" disabled={users.length >= maxUsers && APP_MODE === 'personal'}>
              Add user
            </button>
          </div>
        </form>
        {users.length >= maxUsers && (
          <p className="field-error" style={{ marginTop: '0.5rem' }}>
            {maxUsers === 1
              ? 'Personal edition allows only one user - adding a new one will replace it.'
              : `Maximum of ${maxUsers} users reached - adding a new one will remove the oldest user.`}
          </p>
        )}
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={handleStart}>
          Start Game
        </button>
      </div>
    </div>
  )
}

export default PersonalData
