import { analyzeAttempt } from './analyze'
import type { ExerciseDefinition, VoiceRange } from '../types'
self.onmessage = (
  event: MessageEvent<{
    samples: Float32Array
    sampleRate: number
    exercise: ExerciseDefinition
    voice: VoiceRange
  }>,
) => {
  try {
    const { samples, sampleRate, exercise, voice } = event.data
    self.postMessage({ result: analyzeAttempt(samples, sampleRate, exercise, voice) })
  } catch {
    self.postMessage({ error: 'Không thể phân tích bản thu này. Hãy thử lại.' })
  }
}
