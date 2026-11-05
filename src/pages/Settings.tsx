import { useState } from 'react'
import {
  Download,
  Cloud,
  RefreshCw,
  Trash2,
  Smartphone,
  ShieldCheck,
  Check,
  BookOpen,
} from 'lucide-react'
import {
  apiUrl,
  cloudEnabled,
  disableCloud,
  enableCloud,
  syncProgress,
  deleteMyProgress,
  identity,
  restoreProgress,
} from '../data/store'
import { usePwa } from '../pwa'
import { PageHeading, Notice, Button, Modal, External } from '../components/ui'
import catalog from '../content/catalog.json'
export default function Settings() {
  const pwa = usePwa(),
    [enabled, setEnabled] = useState(cloudEnabled),
    [loading, setLoading] = useState(false),
    [message, setMessage] = useState(''),
    [remove, setRemove] = useState(false)
  async function action(fn: () => Promise<void>, success: string) {
    setLoading(true)
    setMessage('')
    try {
      await fn()
      setMessage(success)
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Thao tác chưa thành công. Dữ liệu trên máy được giữ lại.',
      )
    } finally {
      setEnabled(cloudEnabled())
      setLoading(false)
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="CHUẨN BỊ ĐỂ TIẾP TỤC HÀNH TRÌNH"
        title="Thiết bị, dữ liệu và nguồn tư liệu"
        description="Chủ động chọn cách lưu tiến bộ và chuẩn bị một buổi trải nghiệm ngay cả khi không có mạng."
      />
      <div className="two-col">
        <section className="panel settings-panel">
          <span className="feature-icon sand">
            <Download size={24} />
          </span>
          <h2>Mang sân đình theo bạn</h2>
          <p>
            Gói offline gồm giao diện, cảnh 3D, ba bài kỹ thuật và lớp mẫu. Tư liệu tại nguồn bên
            ngoài cần kết nối internet.
          </p>
          <Button onClick={() => void pwa.prepare()} loading={pwa.preparing}>
            {pwa.ready ? <Check size={17} /> : <Download size={17} />}Chuẩn bị demo offline
          </Button>
          {pwa.message && <Notice kind={pwa.ready ? 'success' : 'info'}>{pwa.message}</Notice>}
          <h3>
            <Smartphone size={18} /> Thêm vào màn hình chính
          </h3>
          <ul className="plain-list">
            <li>
              <strong>Android / Chrome:</strong> mở menu ⋮, chọn “Cài đặt ứng dụng” hoặc “Thêm vào
              màn hình chính”.
            </li>
            <li>
              <strong>iPhone / Safari:</strong> mở Chia sẻ, chọn “Thêm vào MH chính”.
            </li>
          </ul>
          <p className="small muted">
            Bạn luôn có thể mở ứng dụng trực tiếp bằng đường dẫn; không bắt buộc cài.
          </p>
          <p className="small muted">
            Trên iPhone/iPad, dùng Safari và chạm nút nghe mẫu để bật âm thanh. Kính giấy cần cho
            phép “Chuyển động & hướng”, xoay ngang thủ công, rồi chạm “Dùng kính giấy” trong sân
            đình. Nếu không có cảm biến, tiếp tục học trên màn hình.
          </p>
        </section>
        <section className="panel settings-panel">
          <span className="feature-icon sage">
            <Cloud size={24} />
          </span>
          <h2>Tiến bộ thuộc về bạn</h2>
          <p>
            Mặc định lưu trên thiết bị. Khi bật lưu online, chỉ kết quả dạng số được gửi đến máy chủ
            dự án; không gửi bản thu.
          </p>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={enabled}
              disabled={loading || !apiUrl}
              onChange={(e) => {
                if (e.target.checked) {
                  setEnabled(true)
                  void action(
                    enableCloud,
                    'Đã bật lưu online. Các kết quả trên máy đã được đồng bộ.',
                  )
                } else {
                  disableCloud()
                  setEnabled(false)
                  setMessage(
                    'Đã tắt tự động đồng bộ. Kết quả online trước đó vẫn được giữ cho đến khi bạn chọn xóa.',
                  )
                }
              }}
            />
            <span>Đồng ý lưu tiến bộ online</span>
          </label>
          {!apiUrl && (
            <Notice>
              Chưa kết nối máy chủ. Bạn vẫn dùng đầy đủ bài luyện và lưu tiến bộ trên máy.
            </Notice>
          )}
          <p className="small muted">
            Phiên ẩn danh không có email. Xóa dữ liệu trình duyệt có thể làm mất quyền truy cập kết
            quả online; không đồng bộ tài khoản giữa nhiều thiết bị.
          </p>
          <div className="control-actions">
            <Button
              variant="secondary"
              disabled={!enabled || !apiUrl}
              loading={loading}
              onClick={() => void action(syncProgress, 'Đã đồng bộ kết quả hiện có.')}
            >
              <RefreshCw size={16} />
              Đồng bộ ngay
            </Button>
            {identity() && (
              <Button
                variant="ghost"
                disabled={loading}
                onClick={() =>
                  void action(
                    restoreProgress,
                    'Đã lấy lại kết quả của phiên hiện tại.Để chuyển đổi dữ liệu, hãy tiếp tục dùng cùng trình duyệt.',
                  )
                }
              >
                <Cloud size={16} />
                Lấy kết quả online
              </Button>
            )}
          </div>
          <div className="privacy-note">
            <ShieldCheck size={20} />
            <p>
              Chỉ lưu mã bài, quãng giọng, điểm kỹ thuật và thời điểm luyện. Bản thu rời bộ nhớ khi
              rời bài.
            </p>
          </div>
          <Button variant="danger" disabled={loading} onClick={() => setRemove(true)}>
            <Trash2 size={16} />
            Xóa tiến bộ của tôi
          </Button>
          {message && <Notice>{message}</Notice>}
        </section>
      </div>
      <section className="panel section-block">
        <span className="eyebrow">TÔN TRỌNG NGƯỜI GIỮ NGHỀ</span>
        <h2>Nguồn tư liệu và ghi nhận</h2>
        <p className="muted">
          Phần giới thiệu được biên soạn lại cho người mới tìm hiểu. Nhân vật trong cảnh là hình
          minh họa AI, không đại diện cho nghệ nhân cụ thể. Tranh nền và nhân vật trong sân đình là
          hình ảnh do dự án tạo bằng imagegen; không phải ảnh tư liệu hay mô hình phục dựng di tích.
        </p>
        <div className="source-list">
          {catalog.map((item) => (
            <article key={item.id}>
              <BookOpen size={20} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.author}</p>
                <p className="small muted">{item.rights}</p>
                {item.sourceUrl && <External href={item.sourceUrl}>Xem nguồn gốc</External>}
              </div>
            </article>
          ))}
        </div>
      </section>
      {remove && (
        <Modal title="Xóa tiến bộ của bạn?" onClose={() => setRemove(false)}>
          <p>
            Xóa toàn bộ các lượt luyện trên thiết bị và trên máy chủ của phiên ẩn danh hiện tại.
            Thao tác này không thể hoàn tác. Nếu máy chủ chưa kết nối được, dữ liệu trên máy sẽ được
            giữ để bạn thử lại.
          </p>
          <div className="control-actions">
            <Button variant="secondary" onClick={() => setRemove(false)}>
              Giữ lại
            </Button>
            <Button
              variant="danger"
              loading={loading}
              onClick={() =>
                void action(async () => {
                  await deleteMyProgress()
                  setRemove(false)
                }, 'Đã xóa tiến bộ của bạn.')
              }
            >
              <Trash2 size={16} />
              Xóa dữ liệu
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
