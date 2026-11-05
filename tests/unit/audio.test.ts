import { afterEach, expect, it, vi } from 'vitest'
import { AudioEngine } from '../../src/audio/engine'

afterEach(() => vi.unstubAllGlobals())

it('resumes an interrupted Safari context and creates a fresh context after disposal', async () => {
  let created = 0
  const resume = vi.fn()
  class Context {
    state = 'interrupted'
    constructor() {
      created++
    }
    async resume() {
      resume()
      this.state = 'running'
    }
    async close() {
      this.state = 'closed'
    }
  }
  vi.stubGlobal('AudioContext', Context)
  const engine = new AudioEngine()
  await engine.unlock()
  expect(resume).toHaveBeenCalledTimes(1)
  await engine.unlock()
  expect(resume).toHaveBeenCalledTimes(1)
  engine.dispose()
  await engine.unlock()
  expect(created).toBe(2)
  expect(resume).toHaveBeenCalledTimes(2)
  engine.dispose()
})
