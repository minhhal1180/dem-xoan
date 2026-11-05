class PCMCapture extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = new Float32Array(2048)
    this.at = 0
  }
  process(inputs) {
    const input = inputs[0]?.[0]
    if (input)
      for (const value of input) {
        this.buffer[this.at++] = value
        if (this.at === this.buffer.length) {
          this.port.postMessage(this.buffer, [this.buffer.buffer])
          this.buffer = new Float32Array(2048)
          this.at = 0
        }
      }
    return true
  }
}
registerProcessor('pcm-capture', PCMCapture)
