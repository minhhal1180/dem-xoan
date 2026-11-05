import { useEffect, useState } from 'react'
import { getProgress } from './store'
import type { AttemptResult } from '../types'
export function useProgress() {
  const [attempts, setAttempts] = useState<AttemptResult[]>([]),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    const refresh = () =>
      void getProgress()
        .then((data) => {
          if (alive) {
            setAttempts(data)
            setError('')
            setLoading(false)
          }
        })
        .catch(() => {
          if (alive) {
            setError(
              'Chưa đọc được dữ liệu trên máy. Kiểm tra dung lượng hoặc chế độ riêng tư của trình duyệt.',
            )
            setLoading(false)
          }
        })
    refresh()
    window.addEventListener('progress-changed', refresh)
    return () => {
      alive = false
      window.removeEventListener('progress-changed', refresh)
    }
  }, [])
  return { attempts, error, loading }
}
