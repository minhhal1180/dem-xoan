import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { XoanDatabase } from '../../src/data/store'
let db: XoanDatabase | undefined
afterEach(async () => {
  await db?.delete()
})
describe('local progress', () => {
  it('upserts the same attempt UUID and persists nullable measurements without PCM', async () => {
    db = new XoanDatabase(`test-${crypto.randomUUID()}`)
    const item = {
      id: 'attempt',
      sessionId: 'session',
      ownerId: null,
      exerciseId: 'bon-nhip',
      exerciseVersion: 1,
      algorithmVersion: 'demo-1.0',
      voice: 'low' as const,
      createdAt: new Date().toISOString(),
      syncStatus: 'local' as const,
      rhythm: null,
      pitch: null,
      confidence: 0,
      feedback: ['Chưa đủ dữ liệu'],
      onsetOffsetMs: null,
      medianCents: null,
    }
    await db.attempts.put(item)
    await db.attempts.put({ ...item, confidence: 0.2 })
    expect(await db.attempts.count()).toBe(1)
    expect((await db.attempts.get('attempt'))?.confidence).toBe(0.2)
    expect(Object.keys((await db.attempts.get('attempt'))!)).not.toContain('samples')
  })
})
