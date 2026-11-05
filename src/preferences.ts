import type { Role, VoiceRange, DisplayMode } from './types'
export interface Preferences {
  role: Role
  voice: VoiceRange
  mode: DisplayMode
  sensorsReady: boolean
}
export function getPreferences(): Preferences {
  let stored: Partial<Preferences> = {}
  try {
    stored = JSON.parse(sessionStorage.getItem('dem-xoan-preferences') || '{}')
  } catch {
    /* defaults */
  }
  return {
    role: stored.role === 'dao' ? 'dao' : 'kep',
    voice: stored.voice === 'high' ? 'high' : 'low',
    mode: stored.mode === 'cardboard' ? 'cardboard' : 'screen',
    sensorsReady: stored.sensorsReady === true,
  }
}
export function savePreferences(value: Preferences) {
  sessionStorage.setItem('dem-xoan-preferences', JSON.stringify(value))
}
