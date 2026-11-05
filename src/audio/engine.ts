import workletUrl from './pcm.worklet.js?url'
import { frequency } from '../content/exercises'
import type { ExerciseDefinition, VoiceRange, Analysis } from '../types'

export class AudioEngine {
  private context: AudioContext | null = null
  private stream: MediaStream | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private worklet: AudioWorkletNode | null = null
  private gain: GainNode | null = null
  private oscillators: OscillatorNode[] = []
  private analyser: AnalyserNode | null = null
  private worker: Worker | null = null
  private chunks: Float32Array[] = []
  private capture = false
  private last: Float32Array | null = null
  private lastRate = 48000

  async unlock() {
    if (!this.context || this.context.state === 'closed') this.context = new AudioContext()
    if (this.context.state === 'suspended') await this.context.resume()
    return this.context
  }
  async openMicrophone() {
    const ctx = await this.unlock()
    if (this.stream?.active) return
    if (!navigator.mediaDevices?.getUserMedia)
      throw new Error(
        'Micro cần HTTPS và trình duyệt hỗ trợ thu âm. Hãy mở bằng Chrome hoặc Safari.',
      )
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false,
    })
    try {
      await ctx.audioWorklet.addModule(workletUrl)
      this.source = ctx.createMediaStreamSource(this.stream)
      this.analyser = ctx.createAnalyser()
      this.analyser.fftSize = 256
      this.source.connect(this.analyser)
      this.worklet = new AudioWorkletNode(ctx, 'pcm-capture')
      this.gain = ctx.createGain()
      this.gain.gain.value = 0
      this.source.connect(this.worklet)
      this.worklet.connect(this.gain)
      this.gain.connect(ctx.destination)
      this.worklet.port.onmessage = (e: MessageEvent<Float32Array>) => {
        if (this.capture) this.chunks.push(e.data)
      }
    } catch (error) {
      this.releaseMic()
      throw error
    }
  }
  level() {
    if (!this.analyser) return 0
    const data = new Float32Array(this.analyser.fftSize)
    this.analyser.getFloatTimeDomainData(data)
    return Math.min(1, Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length) * 6)
  }
  async playSample(exercise: ExerciseDefinition, voice: VoiceRange) {
    const ctx = await this.unlock()
    this.stopPlayback()
    const start = ctx.currentTime + 0.08
    for (const note of exercise.notes)
      this.tone(ctx, frequency(note.midi, voice), start + note.time, note.duration, 0.2)
  }
  private tone(ctx: AudioContext, hz: number, start: number, duration: number, volume: number) {
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = hz
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(volume, start + 0.025)
    gain.gain.setValueAtTime(volume, start + Math.max(0.03, duration - 0.04))
    gain.gain.linearRampToValueAtTime(0, start + duration)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
    this.oscillators.push(oscillator)
    oscillator.onended = () => {
      oscillator.disconnect()
      gain.disconnect()
    }
  }
  async tick() {
    const ctx = await this.unlock()
    this.tone(ctx, 880, ctx.currentTime + 0.01, 0.07, 0.1)
  }
  startCapture() {
    this.stopPlayback()
    this.last = null
    this.chunks = []
    this.capture = true
  }
  stopCapture() {
    this.capture = false
    const size = this.chunks.reduce((n, part) => n + part.length, 0)
    const samples = new Float32Array(size)
    let at = 0
    for (const part of this.chunks) {
      samples.set(part, at)
      at += part.length
    }
    this.chunks = []
    this.last = samples
    this.lastRate = this.context?.sampleRate || 48000
    this.releaseMic()
    return { samples, sampleRate: this.lastRate }
  }
  async replay() {
    if (!this.last?.length) return
    const ctx = await this.unlock()
    this.stopPlayback()
    const buffer = ctx.createBuffer(1, this.last.length, this.lastRate)
    buffer.copyToChannel(new Float32Array(this.last), 0)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start()
    source.onended = () => source.disconnect()
    this.replaySource = source
  }
  private replaySource: AudioBufferSourceNode | null = null
  analyze(
    samples: Float32Array,
    sampleRate: number,
    exercise: ExerciseDefinition,
    voice: VoiceRange,
  ): Promise<Analysis> {
    this.worker?.terminate()
    const worker = new Worker(new URL('./analysis.worker.ts', import.meta.url), { type: 'module' })
    this.worker = worker
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        worker.terminate()
        reject(new Error('Phân tích quá lâu. Hãy thử một lượt ngắn hơn.'))
      }, 20000)
      worker.onmessage = (e) => {
        clearTimeout(timer)
        worker.terminate()
        this.worker = null
        e.data.error ? reject(new Error(e.data.error)) : resolve(e.data.result)
      }
      worker.onerror = () => {
        clearTimeout(timer)
        worker.terminate()
        this.worker = null
        reject(new Error('Không thể khởi động bộ phân tích âm thanh.'))
      }
      const copy = new Float32Array(samples)
      worker.postMessage({ samples: copy, sampleRate, exercise, voice }, [copy.buffer])
    })
  }
  stopPlayback() {
    for (const oscillator of this.oscillators) {
      try {
        oscillator.stop()
      } catch {
        /* already stopped */
      }
    }
    this.oscillators = []
    try {
      this.replaySource?.stop()
    } catch {
      /* already stopped */
    }
    this.replaySource = null
  }
  releaseMic() {
    this.capture = false
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    this.source?.disconnect()
    this.worklet?.disconnect()
    this.gain?.disconnect()
    this.analyser?.disconnect()
    if (this.worklet) this.worklet.port.onmessage = null
    this.source = null
    this.worklet = null
    this.gain = null
    this.analyser = null
  }
  dispose() {
    this.stopPlayback()
    this.releaseMic()
    this.worker?.terminate()
    this.worker = null
    this.last = null
    this.chunks = []
    void this.context?.close()
    this.context = null
  }
}
