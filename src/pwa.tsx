import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './components/ui'
const PwaContext = createContext<{
  prepare: () => Promise<void>
  ready: boolean
  preparing: boolean
  message: string
}>({ prepare: async () => undefined, ready: false, preparing: false, message: '' })
export const usePwa = () => useContext(PwaContext)
export function PwaProvider({ children }: { children: ReactNode }) {
  const [busy, setBusy] = useState(false),
    [preparing, setPreparing] = useState(false),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState('')
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true })
  useEffect(() => {
    const handler = (event: Event) => setBusy((event as CustomEvent<boolean>).detail)
    window.addEventListener('practice-busy', handler)
    return () => window.removeEventListener('practice-busy', handler)
  }, [])
  async function prepare() {
    setPreparing(true)
    setReady(false)
    setMessage('Đang kiểm tra các tài nguyên cho bản demo…')
    try {
      if (!('serviceWorker' in navigator)) throw new Error('Trình duyệt chưa hỗ trợ lưu offline.')
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  'Chưa có service worker. Hãy mở bản triển khai hoặc bản preview đã build.',
                ),
              ),
            20000,
          ),
        ),
      ])
      const worker = registration.active
      if (!worker) throw new Error('Bản offline chưa sẵn sàng. Hãy chờ một chút rồi thử lại.')
      const ok = await new Promise<boolean>((resolve, reject) => {
        const channel = new MessageChannel()
        const timer = setTimeout(() => {
          channel.port1.close()
          reject(new Error('Kiểm tra cache quá lâu. Hãy thử lại khi có mạng.'))
        }, 10000)
        channel.port1.onmessage = (e) => {
          clearTimeout(timer)
          channel.port1.close()
          resolve(e.data.ok === true)
        }
        worker.postMessage({ type: 'VERIFY_OFFLINE' }, [channel.port2])
      })
      if (!ok)
        throw new Error(
          'Gói offline còn thiếu tài nguyên. Kết nối mạng, tải lại trang và thử lại; chưa thể dùng offline đầy đủ.',
        )
      setReady(true)
      setMessage(
        'Đã xác minh đủ tài nguyên. Bạn có thể ngắt mạng để dùng cảnh 3D, bài kỹ thuật và lớp mẫu. Tư liệu bên ngoài vẫn cần mạng.',
      )
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : 'Chưa thể chuẩn bị offline. Kiểm tra mạng và dung lượng thiết bị.',
      )
    } finally {
      setPreparing(false)
    }
  }
  return (
    <PwaContext.Provider value={{ prepare, ready, preparing, message }}>
      {children}
      {needRefresh && !busy && (
        <div className="update-banner" role="status">
          <span>Có phiên bản Đêm Xoan mới.</span>
          <Button onClick={() => void updateServiceWorker(true)}>Cập nhật và tải lại</Button>
        </div>
      )}
    </PwaContext.Provider>
  )
}
