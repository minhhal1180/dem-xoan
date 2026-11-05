import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Mic, Monitor, Glasses, Check, Volume2, AudioLines } from 'lucide-react'
import { AudioEngine } from '../audio/engine'
import { exercises } from '../content/exercises'
import { Button, Notice, PageHeading, Eyebrow } from '../components/ui'
import { getPreferences, savePreferences } from '../preferences'
import { requestSensors } from '../scene/sensors'

export default function Prepare() {
  const [prefs, setPrefs] = useState(getPreferences)
  const [mic, setMic] = useState(false),
    [testing, setTesting] = useState(false),
    [level, setLevel] = useState(0)
  const [sensorBusy, setSensorBusy] = useState(false),
    [error, setError] = useState('')
  const engine = useRef(new AudioEngine()),
    alive = useRef(true)
  const navigate = useNavigate()
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      engine.current.dispose()
    }
  }, [])
  useEffect(() => {
    if (!testing) return
    const interval = setInterval(() => setLevel(engine.current.level()), 80)
    const timer = setTimeout(() => {
      engine.current.releaseMic()
      setTesting(false)
    }, 5000)
    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [testing])
  async function testMic() {
    setError('')
    try {
      await engine.current.openMicrophone()
      if (!alive.current) {
        engine.current.releaseMic()
        return
      }
      setMic(true)
      setTesting(true)
    } catch {
      setError(
        'Chưa mở được micro. Hãy cho phép quyền micro trong trình duyệt rồi thử lại. Bạn vẫn có thể vào sân đình để nghe mẫu.',
      )
    }
  }
  async function sensors() {
    setSensorBusy(true)
    setError('')
    try {
      const ok = await requestSensors()
      if (!alive.current) return
      setPrefs((p) => ({ ...p, sensorsReady: ok, mode: ok ? 'cardboard' : 'screen' }))
      if (!ok)
        setError('Chưa nhận được cảm biến hướng nhìn. Hãy dùng chế độ màn hình trên thiết bị này.')
    } catch {
      setError('Quyền cảm biến chưa được cấp. Bạn vẫn có thể học trên màn hình.')
    } finally {
      if (alive.current) setSensorBusy(false)
    }
  }
  async function enter() {
    if (prefs.mode === 'cardboard') {
      try {
        await engine.current.openMicrophone()
        engine.current.releaseMic()
      } catch {
        setError(
          'Cần cho phép micro trước khi đặt máy vào kính. Hãy kiểm tra micro hoặc chọn chế độ màn hình.',
        )
        return
      }
    }
    savePreferences(prefs)
    navigate('/san-dinh')
  }
  return (
    <>
      <PageHeading
        eyebrow="TRƯỚC KHI VÀO SÂN ĐÌNH"
        title="Sẵn sàng cho lượt hát đầu tiên?"
        description="Chọn cách trải nghiệm và dành một phút làm quen với âm thanh. Không cần có kiến thức âm nhạc trước."
      />
      <div className="prepare-grid">
        <div className="stack">
          <section className="panel">
            <span className="step-label">BƯỚC 01</span>
            <h2>Bạn muốn chọn vai nào?</h2>
            <p className="muted">
              Vai diễn trong không gian minh họa, không giới hạn giới tính hay quãng giọng.
            </p>
            <div className="choice-grid">
              {(['kep', 'dao'] as const).map((role, i) => (
                <button
                  key={role}
                  className={`choice ${prefs.role === role ? 'selected' : ''}`}
                  onClick={() => setPrefs((p) => ({ ...p, role }))}
                  aria-pressed={prefs.role === role}
                >
                  <span className={`role-avatar ${role}`}>{i ? 'Đ' : 'K'}</span>
                  <strong>{i ? 'Vai đào' : 'Vai kép'}</strong>
                  <span className="muted">
                    {i ? 'Một lời đáp dịu dàng' : 'Một nhịp ca kết nối'}
                  </span>
                  {prefs.role === role && <Check size={18} className="choice-check" />}
                </button>
              ))}
            </div>
          </section>
          <section className="panel">
            <span className="step-label">BƯỚC 02</span>
            <h2>Chọn cách bước vào sân đình</h2>
            <div className="choice-grid">
              <button
                className={`choice ${prefs.mode === 'screen' ? 'selected' : ''}`}
                onClick={() => setPrefs((p) => ({ ...p, mode: 'screen' }))}
                aria-pressed={prefs.mode === 'screen'}
              >
                <Monitor size={29} />
                <strong>Trên màn hình</strong>
                <span className="muted">Điện thoại, máy tính bảng hoặc máy tính</span>
              </button>
              <button
                className={`choice ${prefs.mode === 'cardboard' ? 'selected' : ''}`}
                onClick={() => void sensors()}
                disabled={sensorBusy}
                aria-pressed={prefs.mode === 'cardboard'}
              >
                <Glasses size={29} />
                <strong>{sensorBusy ? 'Đang kiểm tra…' : 'Với kính giấy'}</strong>
                <span className="muted">Android có cảm biến · Xoay ngang</span>
              </button>
            </div>
            <p className="small muted">
              Kính giấy cần cấp quyền cảm biến và micro trước khi đặt máy vào kính. Ngồi ổn định, có
              người hướng dẫn; dừng khi thấy khó chịu.
            </p>
          </section>
        </div>
        <aside className="stack">
          <section className="panel sound-panel">
            <span className="feature-icon sand">
              <HeadphoneIcon />
            </span>
            <Eyebrow>BƯỚC 03 · ÂM THANH</Eyebrow>
            <h2>Tìm quãng giọng của bạn</h2>
            <p className="muted">Chọn giọng bạn thấy thoải mái khi nghe và ngân theo mẫu.</p>
            <div className="segmented" aria-label="Quãng giọng">
              <button
                className={prefs.voice === 'low' ? 'active' : ''}
                onClick={() => setPrefs((p) => ({ ...p, voice: 'low' }))}
              >
                Giọng thấp
              </button>
              <button
                className={prefs.voice === 'high' ? 'active' : ''}
                onClick={() => setPrefs((p) => ({ ...p, voice: 'high' }))}
              >
                Giọng cao
              </button>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                void engine.current
                  .playSample(exercises[1], prefs.voice)
                  .catch(() =>
                    setError('Chưa phát được âm thanh. Hãy thử chạm nút nghe mẫu lần nữa.'),
                  )
              }
            >
              <Volume2 size={17} />
              Nghe thử ba nốt
            </Button>
            <Button variant="secondary" onClick={() => void testMic()} disabled={testing}>
              <Mic size={17} />
              {testing ? 'Nói hoặc ngân thử…' : mic ? 'Kiểm tra lại micro' : 'Kiểm tra micro'}
            </Button>
            <div
              className="mic-meter"
              role="meter"
              aria-label="Mức âm lượng micro"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(level * 100)}
            >
              <span style={{ width: `${Math.max(3, level * 100)}%` }} />
            </div>
            <span className="small muted">
              {testing
                ? 'Đang kiểm tra trong 5 giây, không lưu bản thu.'
                : mic
                  ? 'Đã mở được micro. Quyền sẽ được kiểm tra lại khi thu.'
                  : 'Bạn có thể nghe mẫu ngay cả khi chưa cấp micro.'}
            </span>
          </section>
          <div className="privacy-note">
            <AudioLines size={21} />
            <p>
              Giọng hát được phân tích trên thiết bị.
              <br />
              <strong>Bản thu không gửi lên máy chủ.</strong>
            </p>
          </div>
          <Button onClick={() => void enter()}>
            Vào sân đình <ArrowRight size={18} />
          </Button>
        </aside>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
    </>
  )
}
function HeadphoneIcon() {
  return <Volume2 size={24} />
}
