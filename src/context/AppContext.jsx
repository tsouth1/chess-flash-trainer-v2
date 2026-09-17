import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { getMaxUsers } from '../game/config.js'
import {
  loadUsers,
  saveUsers,
  loadSelectedUserId,
  saveSelectedUserId,
  loadSettings,
  saveSettings,
  deleteUserData,
} from '../utils/storage.js'

const AppContext = createContext(null)

export const VIEWS = {
  PERSONAL_DATA: 'personalData',
  GAME: 'game',
  LEVELS: 'levels',
  CUSTOM_MODE: 'customMode',
  CUSTOM_PROPERTIES: 'customProperties',
  STATISTICS: 'statistics',
  LEADERBOARD: 'leaderboard',
  HELP: 'help',
  EXIT: 'exit',
}

let toastId = 0

export function AppProvider({ children }) {
  const [view, setView] = useState(VIEWS.PERSONAL_DATA)
  const [users, setUsers] = useState(() => loadUsers())
  const [selectedUserId, setSelectedUserId] = useState(() => loadSelectedUserId())
  const [settings, setSettings] = useState(() => loadSettings())
  const [toasts, setToasts] = useState([])
  const [liveMessage, setLiveMessage] = useState('')
  const [pendingExercise, setPendingExercise] = useState(null) // { exercise, levelId | custom }

  const announce = useCallback((message) => {
    // Re-set even if identical so assistive tech re-announces repeated events.
    setLiveMessage('')
    requestAnimationFrame(() => setLiveMessage(message))
  }, [])

  const showToast = useCallback((message, tone = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const navigate = useCallback((nextView) => setView(nextView), [])

  const addUser = useCallback(
    (name) => {
      const trimmed = name.trim().slice(0, 24)
      if (!trimmed) return { ok: false, reason: 'Username cannot be empty.' }
      if (users.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) {
        return { ok: false, reason: 'That username already exists.' }
      }
      const newUser = { id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: trimmed, createdAt: new Date().toISOString() }
      let nextUsers = [...users, newUser]
      let evicted = null
      const max = getMaxUsers()
      if (nextUsers.length > max) {
        evicted = nextUsers[0]
        nextUsers = nextUsers.slice(1)
        deleteUserData(evicted.id)
      }
      setUsers(nextUsers)
      saveUsers(nextUsers)
      setSelectedUserId(newUser.id)
      saveSelectedUserId(newUser.id)
      if (evicted) {
        showToast(`User limit reached - removed oldest user "${evicted.name}" and their saved results.`, 'warning')
      }
      return { ok: true, evicted }
    },
    [users, showToast],
  )

  const selectUser = useCallback((userId) => {
    setSelectedUserId(userId)
    saveSelectedUserId(userId)
  }, [])

  const deleteUser = useCallback(
    (userId) => {
      const remaining = users.filter((u) => u.id !== userId)
      setUsers(remaining)
      saveUsers(remaining)
      deleteUserData(userId)
      if (selectedUserId === userId) {
        const next = remaining[0]?.id ?? null
        setSelectedUserId(next)
        saveSelectedUserId(next)
      }
    },
    [users, selectedUserId],
  )

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      saveSettings(next)
      return next
    })
  }, [])

  const selectedUser = useMemo(() => users.find((u) => u.id === selectedUserId) || null, [users, selectedUserId])

  const value = useMemo(
    () => ({
      view,
      navigate,
      users,
      addUser,
      selectUser,
      deleteUser,
      selectedUser,
      selectedUserId,
      settings,
      updateSettings,
      toasts,
      showToast,
      dismissToast,
      liveMessage,
      announce,
      pendingExercise,
      setPendingExercise,
    }),
    [
      view,
      navigate,
      users,
      addUser,
      selectUser,
      deleteUser,
      selectedUser,
      selectedUserId,
      settings,
      updateSettings,
      toasts,
      showToast,
      dismissToast,
      liveMessage,
      announce,
      pendingExercise,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
