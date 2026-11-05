import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import {
  Home as HomeIcon,
  Compass,
  AudioLines,
  TrendingUp,
  GraduationCap,
  Settings as SettingsIcon,
  Menu,
  X,
  ArrowUpRight,
  QrCode,
  Check,
  WifiOff,
  Leaf,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Modal, Button, Notice } from './components/ui'
import { PwaProvider } from './pwa'
import { syncProgress } from './data/store'
import Home from './pages/Home'
const Explore = lazy(() => import('./pages/Explore')),
  Prepare = lazy(() => import('./pages/Prepare')),
  Practice = lazy(() => import('./pages/Practice')),
  Progress = lazy(() => import('./pages/Progress')),
  Teacher = lazy(() => import('./pages/Teacher')),
  Settings = lazy(() => import('./pages/Settings'))
const nav = [
  { path: '/', icon: HomeIcon, label: 'Trang chủ', end: true },
  { path: '/kham-pha', icon: Compass, label: 'Khám phá di sản' },
  { path: '/chuan-bi', icon: AudioLines, label: 'Vào sân đình' },
  { path: '/tien-bo', icon: TrendingUp, label: 'Hành trình của bạn' },
]
function Shell() {
  const [menu, setMenu] = useState(false),
    [share, setShare] = useState(false),
    [copied, setCopied] = useState(false),
    [online, setOnline] = useState(navigator.onLine),
    [syncError, setSyncError] = useState(false)
  const location = useLocation()
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 900px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)')
    const changed = () => setMobile(media.matches)
    media.addEventListener('change', changed)
    return () => media.removeEventListener('change', changed)
  }, [])
  useEffect(() => {
    if (!menu) return
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menu])
  useEffect(() => {
    setMenu(false)
    window.scrollTo(0, 0)
  }, [location.pathname])
  useEffect(() => {
    const connect = () => {
      setOnline(navigator.onLine)
      if (navigator.onLine) void syncProgress().catch(() => setSyncError(true))
    }
    const error = () => setSyncError(true)
    window.addEventListener('online', connect)
    window.addEventListener('offline', connect)
    window.addEventListener('sync-error', error)
    return () => {
      window.removeEventListener('online', connect)
      window.removeEventListener('offline', connect)
      window.removeEventListener('sync-error', error)
    }
  }, [])
  const shareUrl = window.location.href
  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Đến nội dung chính
      </a>
      {menu && (
        <button
          className="nav-backdrop"
          aria-label="Đóng điều hướng"
          onClick={() => setMenu(false)}
        />
      )}
      <aside inert={mobile && !menu} className={`sidebar ${menu ? 'open' : ''}`}>
        <Link to="/" className="brand">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="44" height="44" />
          <span>
            <strong>Đêm Xoan</strong>
            <small>KHÔNG TẮT</small>
          </span>
        </Link>
        <button
          className="icon-button mobile-close"
          onClick={() => setMenu(false)}
          aria-label="Đóng menu"
        >
          <X size={20} />
        </button>
        <div className="nav-kicker">KHÔNG GIAN CỦA BẠN</div>
        <nav aria-label="Điều hướng chính">
          {nav.map(({ path, icon: Icon, label, end }) => (
            <NavLink key={path} end={end} to={path}>
              <Icon size={19} />
              <span>{label}</span>
              <span className="nav-active-dot" />
            </NavLink>
          ))}
          <div className="nav-separator" />
          <NavLink to="/giao-vien">
            <GraduationCap size={19} />
            <span>Góc giáo viên</span>
            <span className="nav-mini-tag">Mẫu</span>
          </NavLink>
          <NavLink to="/cai-dat">
            <SettingsIcon size={19} />
            <span>Thiết bị & tư liệu</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="heritage-seal">
            <Leaf size={23} />
            <span>
              Một di sản được hát,
              <br />
              một di sản được tiếp nối.
            </span>
          </div>
          <div className="version-line">
            <span>BẢN TRẢI NGHIỆM</span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenu(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>
            <span>
              Văn hóa Phú Thọ <span className="breadcrumb-slash">/</span> <strong>Hát Xoan</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="availability">
              <span className={online ? 'live-dot' : 'offline-dot'} />
              {online ? 'Di sản luôn ở đây' : 'Đang dùng offline'}
            </span>
            <button className="share-button" onClick={() => setShare(true)}>
              <QrCode size={17} />
              <span>Chia sẻ trải nghiệm</span>
            </button>
            <span className="visitor-avatar" aria-label="Khách trải nghiệm">
              B
            </span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {!online && (
            <Notice>
              <WifiOff size={16} /> Bạn đang offline. Bài kỹ thuật đã chuẩn bị vẫn dùng được; tư
              liệu bên ngoài cần mạng.
            </Notice>
          )}
          {syncError && (
            <Notice>
              Chưa đồng bộ được. Kết quả vẫn trên máy. Vào “Thiết bị & tư liệu” để thử lại.
            </Notice>
          )}
          <Suspense
            fallback={
              <div className="page-loading">
                <span className="loading-orbit" />
                Đang mở không gian của bạn…
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/kham-pha" element={<Explore />} />
              <Route path="/chuan-bi" element={<Prepare />} />
              <Route path="/san-dinh" element={<Practice />} />
              <Route path="/tien-bo" element={<Progress />} />
              <Route path="/giao-vien" element={<Teacher />} />
              <Route path="/cai-dat" element={<Settings />} />
              <Route
                path="*"
                element={
                  <section className="empty-state">
                    <h1>Chưa có lối này trong sân đình</h1>
                    <Link className="btn btn-primary" to="/">
                      Về trang chủ
                    </Link>
                  </section>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <footer>
          <span>
            <img src={`${import.meta.env.BASE_URL}icon.svg`} width="22" height="22" alt="" />
            Đêm Xoan Không Tắt
          </span>
          <p>Từ đất Tổ, gửi đến thế hệ tiếp nối.</p>
          <Link to="/cai-dat">
            Nguồn tư liệu <ArrowUpRight size={14} />
          </Link>
        </footer>
      </div>
      {share && (
        <Modal title="Gửi bạn một lời hẹn ở sân đình" onClose={() => setShare(false)}>
          <p>Quét mã để mở đúng trang bạn đang xem.</p>
          <div className="qr-wrap">
            <QRCodeSVG value={shareUrl} size={220} marginSize={3} level="M" />
          </div>
          <div className="share-url">{shareUrl}</div>
          <Button
            onClick={() => {
              void navigator.clipboard
                ?.writeText(shareUrl)
                .then(() => setCopied(true))
                .catch(() => setCopied(false))
            }}
          >
            {copied ? <Check size={16} /> : <QrCode size={16} />}{' '}
            {copied ? 'Đã sao chép' : 'Sao chép đường dẫn'}
          </Button>
        </Modal>
      )}
    </div>
  )
}
export default function App() {
  return (
    <HashRouter>
      <PwaProvider>
        <Shell />
      </PwaProvider>
    </HashRouter>
  )
}
