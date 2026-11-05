import { describe, expect, it, vi } from 'vitest'
import { hasOrientationData, screenAngle } from '../../src/scene/sensors'

describe('orientation data and iOS screen rotation', () => {
  it('accepts a genuine zero heading, rejects missing or nonfinite data', () => {
    expect(hasOrientationData({ alpha: 0, beta: 0, gamma: 0 })).toBe(true)
    for (const alpha of [null, NaN, Infinity])
      expect(hasOrientationData({ alpha, beta: 1, gamma: 2 })).toBe(false)
  })
  it('uses ScreenOrientation and falls back to the legacy iOS angle', () => {
    vi.stubGlobal('window', { screen: { orientation: { angle: 90 } }, orientation: -90 })
    expect(screenAngle()).toBe(90)
    vi.stubGlobal('window', { screen: {}, orientation: -90 })
    expect(screenAngle()).toBe(-90)
    vi.stubGlobal('window', { screen: {} })
    expect(screenAngle()).toBe(0)
    vi.unstubAllGlobals()
  })
})
