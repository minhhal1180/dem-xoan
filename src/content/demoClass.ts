export const demoStudents = Array.from({ length: 30 }, (_, i) => ({
  id: `HS${String(i + 1).padStart(2, '0')}`,
  before: 40 + ((i * 7) % 25),
  after: 64 + ((i * 11) % 31),
  sessions: 2 + (i % 5),
}))
