export type VoiceRange = 'low' | 'high'
export type Role = 'kep' | 'dao'
export type DisplayMode = 'screen' | 'cardboard'
export type Phase = 'ready' | 'sample' | 'countdown' | 'recording' | 'analyzing' | 'feedback'
export interface Note {
  time: number
  duration: number
  midi: number
}
export interface ExerciseDefinition {
  id: string
  title: string
  subtitle: string
  description: string
  version: number
  duration: number
  bpm: number
  hideGuide: boolean
  notes: Note[]
}
export interface Analysis {
  rhythm: number | null
  pitch: number | null
  confidence: number
  feedback: string[]
  onsetOffsetMs: number | null
  medianCents: number | null
}
export interface AttemptResult extends Analysis {
  id: string
  sessionId: string
  ownerId: string | null
  exerciseId: string
  exerciseVersion: number
  algorithmVersion: string
  voice: VoiceRange
  createdAt: string
  syncStatus: 'local' | 'pending' | 'synced'
}
export interface LearningSession {
  id: string
  ownerId: string | null
  role: Role
  mode: DisplayMode
  createdAt: string
  endedAt: string | null
}
export interface ContentItem {
  id: string
  title: string
  kind: string
  author: string
  sourceUrl: string
  rights: string
  reviewed: boolean
  version: number
}
