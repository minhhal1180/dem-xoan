import Dexie, { type Table } from 'dexie'
import type { AttemptResult, LearningSession } from '../types'

export class XoanDatabase extends Dexie {
  attempts!: Table<AttemptResult, string>
  sessions!: Table<LearningSession, string>
  constructor(name = 'dem-xoan-v1') {
    super(name)
    this.version(1).stores({
      attempts: 'id, sessionId, ownerId, createdAt, syncStatus',
      sessions: 'id, ownerId, createdAt',
    })
  }
}
export const db = new XoanDatabase()
export const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
interface Identity {
  ownerId: string
  token: string
}
const IDENTITY_KEY = 'dem-xoan-identity'
const CONSENT_KEY = 'dem-xoan-cloud-consent'
export function identity(): Identity | null {
  try {
    return JSON.parse(localStorage.getItem(IDENTITY_KEY) || 'null')
  } catch {
    return null
  }
}
export const cloudEnabled = () => localStorage.getItem(CONSENT_KEY) === 'yes'
export function disableCloud() {
  generation++
  localStorage.removeItem(CONSENT_KEY)
  window.dispatchEvent(new Event('progress-changed'))
}

async function request(path: string, options: RequestInit = {}) {
  if (!apiUrl) throw new Error('Chưa cấu hình API VPS. Tiến bộ vẫn lưu trên máy.')
  const response = await fetch(`${apiUrl}/v1${path}`, {
    ...options,
    signal: AbortSignal.timeout(12000),
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(identity() ? { Authorization: `Bearer ${identity()!.token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? 'Phiên lưu online không còn hợp lệ. Dữ liệu trên máy được giữ lại; không tự chuyển sang người dùng khác.'
        : 'Chưa kết nối được API VPS. Kết quả trên máy được giữ lại.',
    )
  return response.status === 204 ? null : response.json()
}
export async function enableCloud() {
  if (!identity()) {
    const data = await request('/identity', { method: 'POST', body: '{}' })
    localStorage.setItem(IDENTITY_KEY, JSON.stringify({ ownerId: data.id, token: data.token }))
  }
  localStorage.setItem(CONSENT_KEY, 'yes')
  await syncProgress()
}
export async function newSession(role: LearningSession['role'], mode: LearningSession['mode']) {
  const session: LearningSession = {
    id: crypto.randomUUID(),
    ownerId: cloudEnabled() ? identity()?.ownerId || null : null,
    role,
    mode,
    createdAt: new Date().toISOString(),
    endedAt: null,
  }
  await db.sessions.put(session)
  return session
}
export async function saveAttempt(attempt: AttemptResult) {
  await db.attempts.put(attempt)
  window.dispatchEvent(new Event('progress-changed'))
  void syncProgress().catch(() => window.dispatchEvent(new Event('sync-error')))
}
export const getProgress = () => db.attempts.orderBy('createdAt').reverse().toArray()
let syncing: Promise<void> | null = null
let generation = 0
async function performSync() {
  const owner = identity()
  if (!cloudEnabled() || !owner) return
  if (!navigator.onLine)
    throw new Error('Chưa có mạng. Kết quả vẫn trên máy và sẽ đồng bộ khi kết nối lại.')
  const expected = generation
  const sessions = await db.sessions.toArray()
  for (const session of sessions) {
    if (expected !== generation) return
    if (session.ownerId && session.ownerId !== owner.ownerId) continue
    const owned = { ...session, ownerId: owner.ownerId }
    await request(`/sessions/${session.id}`, { method: 'PUT', body: JSON.stringify(owned) })
    if (expected !== generation) return
    await db.sessions.put(owned)
  }
  const attempts = await db.attempts.toArray()
  for (const attempt of attempts) {
    if (expected !== generation) return
    if (attempt.syncStatus === 'synced' || (attempt.ownerId && attempt.ownerId !== owner.ownerId))
      continue
    const parent = await db.sessions.get(attempt.sessionId)
    if (parent?.ownerId !== owner.ownerId) continue
    await db.attempts.update(attempt.id, { ownerId: owner.ownerId, syncStatus: 'pending' })
    await request(`/attempts/${attempt.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...attempt, ownerId: owner.ownerId }),
    })
    if (expected !== generation) return
    await db.attempts.update(attempt.id, { syncStatus: 'synced' })
  }
  window.dispatchEvent(new Event('progress-changed'))
}
export function syncProgress() {
  if (!syncing)
    syncing = performSync().finally(() => {
      syncing = null
    })
  return syncing
}
export async function deleteMyProgress() {
  generation++
  await syncing?.catch(() => undefined)
  if (identity()) await request('/progress', { method: 'DELETE' })
  await db.transaction('rw', db.attempts, db.sessions, async () => {
    await db.attempts.clear()
    await db.sessions.clear()
  })
  window.dispatchEvent(new Event('progress-changed'))
}
export async function restoreProgress() {
  const data = await request('/progress')
  await db.transaction('rw', db.attempts, db.sessions, async () => {
    for (const session of data.sessions as LearningSession[]) await db.sessions.put(session)
    for (const attempt of data.attempts as AttemptResult[])
      await db.attempts.put({ ...attempt, syncStatus: 'synced' })
  })
  window.dispatchEvent(new Event('progress-changed'))
}
