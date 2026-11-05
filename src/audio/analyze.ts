import { PitchDetector } from 'pitchy'
import { frequency } from '../content/exercises'
import type { Analysis, ExerciseDefinition, VoiceRange } from '../types'

const median = (values: number[]) => {
  if (!values.length) return 0
  const a = [...values].sort((x, y) => x - y)
  return a[Math.floor(a.length / 2)]
}
const clamp = (x: number) => Math.max(0, Math.min(100, Math.round(x)))

export function analyzeAttempt(
  samples: Float32Array,
  sampleRate: number,
  exercise: ExerciseDefinition,
  voice: VoiceRange,
): Analysis {
  const empty: Analysis = {
    rhythm: null,
    pitch: null,
    confidence: 0,
    onsetOffsetMs: null,
    medianCents: null,
    feedback: ['Chưa đủ dữ liệu, hãy thử lại. Hát rõ hơn và ngắt giữa các tiếng “a”.'],
  }
  if (!Number.isFinite(sampleRate) || sampleRate < 8000 || samples.length < sampleRate * 0.3)
    return empty
  const size = 2048,
    hop = 256
  const detector = PitchDetector.forFloat32Array(size)
  const frames: { time: number; hz: number; clarity: number; rms: number }[] = []
  const energies: number[] = []
  for (let at = 0; at + size <= samples.length; at += hop) {
    const frame = samples.subarray(at, at + size)
    let power = 0
    for (const v of frame) power += v * v
    const rms = Math.sqrt(power / size)
    const [hz, clarity] = rms > 0.008 ? detector.findPitch(frame, sampleRate) : [0, 0]
    frames.push({ time: (at + size / 2) / sampleRate, hz, clarity, rms })
    energies.push(rms)
  }
  const voiced = frames.filter(
    (f) => f.rms > 0.008 && f.clarity >= 0.82 && f.hz > 65 && f.hz < 1200,
  )
  if ((voiced.length * hop) / sampleRate < 0.32) return empty
  const peak = Math.max(...energies)
  const gate = Math.max(0.009, peak * 0.2)
  const onsets: number[] = []
  let active = false,
    quiet = 0
  for (const f of frames) {
    if (f.rms > gate) {
      if (!active && (!onsets.length || f.time - onsets.at(-1)! > 0.22))
        onsets.push(Math.max(0, f.time))
      active = true
      quiet = 0
    } else if ((++quiet * hop) / sampleRate > 0.07) active = false
  }
  if (!onsets.length) return empty
  const errors: number[] = []
  const timing: number[] = []
  const available = new Set(onsets.map((_, i) => i))
  for (const note of exercise.notes) {
    let best = -1,
      distance = Infinity
    for (const i of available)
      if (Math.abs(onsets[i] - note.time) < distance) {
        best = i
        distance = Math.abs(onsets[i] - note.time)
      }
    if (best >= 0 && distance < 0.7) {
      available.delete(best)
      timing.push(onsets[best] - note.time)
    } else timing.push(0.8)
    const target = frequency(note.midi, voice)
    const noteFrames = voiced.filter(
      (f) => f.time >= note.time + 0.07 && f.time < note.time + note.duration,
    )
    if (noteFrames.length)
      errors.push(median(noteFrames.map((f) => 1200 * Math.log2(f.hz / target))))
  }
  const coverage = errors.length / exercise.notes.length
  const confidence = Math.min(1, coverage * median(voiced.map((f) => f.clarity)))
  if (coverage < 0.5 || confidence < 0.45) return { ...empty, confidence }
  const absCents = median(errors.map(Math.abs))
  const offset = median(timing)
  const rhythm = clamp(100 - median(timing.map(Math.abs)) * 150 - available.size * 5)
  const pitch = clamp((100 - absCents / 4) * coverage)
  return {
    rhythm,
    pitch,
    confidence,
    onsetOffsetMs: Math.round(offset * 1000),
    medianCents: Math.round(median(errors)),
    feedback: [
      Math.abs(offset) < 0.15
        ? 'Bạn đã bắt khá sát nhịp mẫu.'
        : `Bạn vào ${offset < 0 ? 'sớm' : 'trễ'} khoảng ${Math.abs(Math.round(offset * 1000))} ms. Hãy nghe nhịp đếm trước khi đáp.`,
      absCents < 70
        ? 'Cao độ khá gần chuỗi nốt mẫu.'
        : `Giọng đang ${median(errors) < 0 ? 'thấp' : 'cao'} hơn mẫu. Nghe lại và ngân nhẹ từng nốt.`,
      'Kết quả minh họa kỹ thuật, không đánh giá kỹ năng Hát Xoan.',
    ],
  }
}
