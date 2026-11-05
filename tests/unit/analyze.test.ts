import { describe, expect, it } from 'vitest'
import { analyzeAttempt } from '../../src/audio/analyze'
import { exercises, frequency } from '../../src/content/exercises'
const rate = 16000
function synth(shift = 0, semitones = 0, noise = false) {
  const e = exercises[0],
    samples = new Float32Array(rate * e.duration)
  let rng = 12345
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate
    if (noise) {
      rng = (rng * 1664525 + 1013904223) >>> 0
      samples[i] = (rng / 4294967296 - 0.5) * 0.4
      continue
    }
    for (const note of e.notes) {
      const at = t - note.time - shift
      if (at >= 0 && at < note.duration) {
        const envelope = Math.min(1, at / 0.02, (note.duration - at) / 0.025)
        samples[i] =
          0.25 * envelope * Math.sin(2 * Math.PI * frequency(note.midi + semitones, 'low') * at)
      }
    }
  }
  return samples
}
describe('actual PCM scoring', () => {
  it('recognizes clean reference and gives high scores', () => {
    const r = analyzeAttempt(synth(), rate, exercises[0], 'low')
    expect(r.rhythm).toBeGreaterThan(85)
    expect(r.pitch).toBeGreaterThan(90)
    expect(r.confidence).toBeGreaterThan(0.8)
  })
  it('penalizes timing errors without hiding them through alignment', () => {
    const clean = analyzeAttempt(synth(), rate, exercises[0], 'low'),
      late = analyzeAttempt(synth(0.27), rate, exercises[0], 'low')
    expect(late.rhythm!).toBeLessThan(clean.rhythm! - 20)
    expect(late.onsetOffsetMs!).toBeGreaterThan(150)
  })
  it('penalizes pitch shift', () => {
    const r = analyzeAttempt(synth(0, 3), rate, exercises[0], 'low')
    expect(r.pitch).toBeLessThan(40)
    expect(r.medianCents!).toBeGreaterThan(200)
  })
  it('does not turn silence, noise, or too short audio into zero scores', () => {
    for (const samples of [new Float32Array(rate * 4), synth(0, 0, true), new Float32Array(200)]) {
      const r = analyzeAttempt(samples, rate, exercises[0], 'low')
      expect(r.pitch).toBeNull()
      expect(r.rhythm).toBeNull()
      expect(r.feedback.join(' ')).toContain('Chưa đủ dữ liệu')
    }
  })
})
