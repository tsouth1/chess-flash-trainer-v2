import { DEFAULT_CUSTOM_PROPERTIES } from '../game/config.js'

/**
 * Namespaced, schema-versioned localStorage access layer.
 * No component should call `localStorage` directly - go through here so
 * corrupted/missing data always degrades to a safe default instead of
 * throwing (see SECURITY.md).
 */

const SCHEMA_VERSION = 1

export const STORAGE_KEYS = {
  users: 'kgb.users',
  selectedUserId: 'kgb.selectedUserId',
  settings: 'kgb.settings',
  statsPrefix: 'kgb.stats.', // + userId
  achievementsPrefix: 'kgb.achievements.', // + userId
}

function safeGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed) {
      return parsed.data
    }
    return parsed
  } catch {
    return fallback
  }
}

function safeSet(key, data) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ schemaVersion: SCHEMA_VERSION, data }))
    return true
  } catch {
    return false
  }
}

// ---- Users ----

export function loadUsers() {
  const users = safeGet(STORAGE_KEYS.users, [])
  return Array.isArray(users) ? users : []
}

export function saveUsers(users) {
  safeSet(STORAGE_KEYS.users, users)
}

export function loadSelectedUserId() {
  return safeGet(STORAGE_KEYS.selectedUserId, null)
}

export function saveSelectedUserId(userId) {
  safeSet(STORAGE_KEYS.selectedUserId, userId)
}

// ---- Settings / Custom Properties ----

export function loadSettings() {
  const stored = safeGet(STORAGE_KEYS.settings, null)
  return { ...DEFAULT_CUSTOM_PROPERTIES, ...(stored || {}) }
}

export function saveSettings(settings) {
  safeSet(STORAGE_KEYS.settings, settings)
}

// ---- Per-user statistics history ----

export function loadStats(userId) {
  const stats = safeGet(STORAGE_KEYS.statsPrefix + userId, [])
  return Array.isArray(stats) ? stats : []
}

export function saveStats(userId, sessions) {
  safeSet(STORAGE_KEYS.statsPrefix + userId, sessions)
}

export function appendSession(userId, session) {
  const sessions = loadStats(userId)
  sessions.push(session)
  saveStats(userId, sessions)
  return sessions
}

export function clearStats(userId) {
  saveStats(userId, [])
}

export function deleteUserData(userId) {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.statsPrefix + userId)
    window.localStorage.removeItem(STORAGE_KEYS.achievementsPrefix + userId)
  } catch {
    // ignore - nothing more we can do if storage is unavailable
  }
}

// ---- Achievements / level progress ----

export function loadAchievements(userId) {
  const data = safeGet(STORAGE_KEYS.achievementsPrefix + userId, null)
  return (
    data || {
      completedLevels: [],
      currentLevel: 1,
      bestScoresByExercise: {},
    }
  )
}

export function saveAchievements(userId, achievements) {
  safeSet(STORAGE_KEYS.achievementsPrefix + userId, achievements)
}
