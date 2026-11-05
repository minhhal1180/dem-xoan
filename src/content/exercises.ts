import type { ExerciseDefinition, VoiceRange } from '../types'

export const ALGORITHM_VERSION = 'demo-1.0'
export const exercises: ExerciseDefinition[] = [
  {
    id: 'bon-nhip',
    title: 'Bắt một nhịp chung',
    subtitle: 'Bốn nhịp · Làm quen',
    description: 'Nghe bốn tiếng mẫu. Đáp lại bằng bốn tiếng “a” ngắn, ngắt rõ giữa các tiếng.',
    version: 1,
    duration: 4.4,
    bpm: 75,
    hideGuide: false,
    notes: [0.4, 1.2, 2, 2.8].map((time) => ({ time, duration: 0.42, midi: 55 })),
  },
  {
    id: 'ba-not',
    title: 'Theo dấu giai điệu',
    subtitle: 'Ba nốt · Lắng nghe',
    description:
      'Nghe ba nốt đi lên, rồi ngân ba tiếng “a” theo đúng thứ tự. Chọn quãng giọng thoải mái trước khi bắt đầu.',
    version: 1,
    duration: 4.4,
    bpm: 75,
    hideGuide: false,
    notes: [55, 57, 59].map((midi, i) => ({ time: 0.4 + i * 1.05, duration: 0.68, midi })),
  },
  {
    id: 'doi-dap',
    title: 'Đến lượt bạn đáp',
    subtitle: 'Bốn tiếng · Ghi nhớ',
    description:
      'Lắng nghe và ghi nhớ một chuỗi ngắn. Khi đến lượt, gợi ý sẽ ẩn đi; hãy đáp lại bằng tiếng “a”.',
    version: 1,
    duration: 4.8,
    bpm: 75,
    hideGuide: true,
    notes: [55, 59, 57, 55].map((midi, i) => ({ time: 0.4 + i * 0.9, duration: 0.5, midi })),
  },
]
export const frequency = (midi: number, voice: VoiceRange) =>
  440 * 2 ** ((midi + (voice === 'high' ? 12 : 0) - 69) / 12)
