import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Play,
  Mic,
  RotateCcw,
  Volume2,
  Square,
  ArrowRight,
  Monitor,
  Glasses,
  Check,
  Headphones,
} from 'lucide-react'
import { AudioEngine } from '../audio/engine'
import { exercises, ALGORITHM_VERSION } from '../content/exercises'
import { getPreferences, savePreferences } from '../preferences'
import { cloudEnabled, db, identity, newSession, saveAttempt } from '../data/store'
import { Button, Notice, PageHeading } from '../components/ui'
import { requestSensors } from '../scene/sensors'
import type { SceneCommand } from '../scene/Courtyard'
import type { Analysis, LearningSession, Phase } from '../types'

const Courtyard = lazy(() => import('../scene/Courtyard'))
const phaseLabels: Record<Phase, string> = {
  ready: 'Lắng nghe trước khi đáp',
  sample: 'Đang phát mẫu · Lắng nghe',
  countdown: 'Chuẩn bị đến lượt bạn',
  recording: 'Đến lượt bạn · Hát “a” theo mẫu',
  analyzing: 'Đang lắng nghe bản thu…',
  feedback: 'Bạn đã hoàn thành lượt thử',
}
export default function Practice() {
  const [query] = useSearchParams()
  const initial = Math.max(
    0,
    exercises.findIndex((e) => e.id === query.get('bai')),
  )
  const [index, setIndex] = useState(initial),
    [prefs, setPrefs] = useState<ReturnType<typeof getPreferences>>(() => ({
      ...getPreferences(),
      mode: 'screen',
    })),
    [phase, setPhase] = useState<Phase>('ready')
  const [count, setCount] = useState(3),
    [elapsed, setElapsed] = useState(0),
    [analysis, setAnalysis] = useState<Analysis | null>(null),
    [error, setError] = useState(''),
    [sceneError, setSceneError] = useState(false),
    [saved, setSaved] = useState(false),
    [hasRecording, setHasRecording] = useState(false)
  const [sensorBusy, setSensorBusy] = useState(false)
  const engine = useRef(new AudioEngine()),
    session = useRef<LearningSession | null>(null),
    run = useRef(0),
    mounted = useRef(true),
    pending = useRef(false)
  const exercise = exercises[index],
    busy = !['ready', 'feedback'].includes(phase)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('practice-busy', { detail: busy }))
    return () => {
      window.dispatchEvent(new CustomEvent('practice-busy', { detail: false }))
    }
  }, [busy])
  useEffect(() => {
    mounted.current = true
    const interrupt = () => {
      if (document.hidden) {
        run.current++
        pending.current = false
        engine.current.dispose()
        setPhase('ready')
        setHasRecording(false)
        setError('Lượt luyện đã dừng khi ứng dụng chuyển nền. Bấm nghe mẫu để bắt đầu lại.')
      }
    }
    document.addEventListener('visibilitychange', interrupt)
    return () => {
      mounted.current = false
      run.current++
      engine.current.dispose()
      document.removeEventListener('visibilitychange', interrupt)
      const s = session.current
      if (s) void db.sessions.update(s.id, { endedAt: new Date().toISOString() })
    }
  }, [])
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
  const valid = (token: number) => mounted.current && run.current === token
  async function sample() {
    if (pending.current || busy) return
    pending.current = true
    const token = ++run.current
    setError('')
    setPhase('sample')
    try {
      await engine.current.playSample(exercise, prefs.voice)
      await wait((exercise.duration + 0.15) * 1000)
      if (valid(token)) setPhase('ready')
    } catch {
      if (valid(token)) {
        setError('Chưa phát được âm thanh. Hãy chạm nút nghe mẫu để thử lại.')
        setPhase('ready')
      }
    } finally {
      if (valid(token)) pending.current = false
    }
  }
  async function record() {
    if (pending.current || busy) return
    pending.current = true
    const token = ++run.current
    setError('')
    setAnalysis(null)
    setSaved(false)
    setHasRecording(false)
    try {
      await engine.current.openMicrophone()
      if (!valid(token)) {
        engine.current.releaseMic()
        return
      }
      setPhase('countdown')
      for (let n = 3; n > 0; n--) {
        if (!valid(token)) return
        setCount(n)
        await engine.current.tick()
        await wait(800)
      }
      if (!valid(token)) return
      engine.current.startCapture()
      setPhase('recording')
      setElapsed(0)
      const start = performance.now(),
        duration = Math.min(15, exercise.duration)
      while (performance.now() - start < duration * 1000) {
        await wait(60)
        if (!valid(token)) return
        setElapsed((performance.now() - start) / 1000)
      }
      const recording = engine.current.stopCapture()
      setHasRecording(recording.samples.length > 0)
      setPhase('analyzing')
      const result = await engine.current.analyze(
        recording.samples,
        recording.sampleRate,
        exercise,
        prefs.voice,
      )
      if (!valid(token)) return
      setAnalysis(result)
      setPhase('feedback')
      if (!session.current) session.current = await newSession(prefs.role, prefs.mode)
      if (!valid(token)) return
      const owner = cloudEnabled() ? identity()?.ownerId || null : null
      await saveAttempt({
        ...result,
        id: crypto.randomUUID(),
        sessionId: session.current.id,
        ownerId: owner,
        exerciseId: exercise.id,
        exerciseVersion: exercise.version,
        algorithmVersion: ALGORITHM_VERSION,
        voice: prefs.voice,
        createdAt: new Date().toISOString(),
        syncStatus: owner ? 'pending' : 'local',
      })
      if (valid(token)) setSaved(true)
    } catch (e) {
      if (valid(token)) {
        engine.current.releaseMic()
        setError(
          e instanceof Error
            ? e.message
            : 'Chưa thu được âm thanh. Hãy cấp quyền micro rồi thử lại.',
        )
        setPhase('ready')
      }
    } finally {
      if (valid(token)) pending.current = false
    }
  }
  function stop() {
    run.current++
    pending.current = false
    engine.current.dispose()
    setPhase('ready')
    setHasRecording(false)
  }
  function select(next: number) {
    stop()
    setIndex(next)
    setAnalysis(null)
    setError('')
    setSaved(false)
  }
  async function cardboard() {
    setSensorBusy(true)
    setError('')
    try {
      const ok = await requestSensors()
      if (!mounted.current) return
      if (!ok) throw new Error('Chưa có dữ liệu cảm biến. Hãy tiếp tục với chế độ màn hình.')
      await engine.current.openMicrophone()
      engine.current.releaseMic()
      const next = { ...prefs, mode: 'cardboard' as const, sensorsReady: true }
      setPrefs(next)
      savePreferences(next)
      if (document.documentElement.requestFullscreen)
        void document.documentElement.requestFullscreen().catch(() => undefined)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không mở được chế độ kính.')
    } finally {
      if (mounted.current) setSensorBusy(false)
    }
  }
  function exit() {
    const next = { ...prefs, mode: 'screen' as const }
    setPrefs(next)
    savePreferences(next)
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
  }
  function command(action: SceneCommand) {
    if (action === 'exit') {
      exit()
      return
    }
    if (action === 'sample') void sample()
    if (action === 'record') void record()
    if (action === 'replay' && hasRecording) void engine.current.replay()
  }
  const failScene = useCallback(() => setSceneError(true), [])
  const caption =
    phase === 'countdown'
      ? `Sẵn sàng · ${count}`
      : phase === 'feedback' && analysis
        ? analysis.pitch === null
          ? 'Chưa đủ dữ liệu · Thử lại'
          : `Nhịp ${analysis.rhythm}/100 · Cao độ ${analysis.pitch}/100`
        : phaseLabels[phase]
  return (
    <div className={prefs.mode === 'cardboard' ? 'practice-page cardboard-page' : 'practice-page'}>
      <PageHeading
        eyebrow="SÂN ĐÌNH · PHÒNG LUYỆN MINH HỌA"
        title="Nghe một câu. Đáp một nhịp."
        description="Bài luyện minh họa — không phải câu Hát Xoan. Nhân vật hướng dẫn và không gian được dựng để trải nghiệm."
        action={
          <Link className="btn btn-secondary" to="/chuan-bi">
            Đổi vai / quãng giọng
          </Link>
        }
      />
      <div className="exercise-tabs" aria-label="Chọn bài luyện">
        {exercises.map((e, i) => (
          <button key={e.id} onClick={() => select(i)} className={index === i ? 'active' : ''}>
            <span>0{i + 1}</span>
            {e.title}
          </button>
        ))}
      </div>
      <div className="practice-layout">
        <section className="scene-wrapper">
          {sceneError ? (
            <div className="scene-fallback">
              <Headphones size={40} />
              <h2>Học trên màn hình</h2>
              <p>
                Thiết bị chưa hiển thị được cảnh 3D. Các chức năng nghe, thu âm và phản hồi vẫn dùng
                được bên dưới.
              </p>
            </div>
          ) : (
            <Suspense fallback={<div className="scene-fallback">Đang mở sân đình…</div>}>
              <Courtyard
                mode={prefs.mode}
                phase={phase}
                caption={caption}
                onCommand={command}
                onError={failScene}
              />
            </Suspense>
          )}
          <div className="scene-toolbar">
            <span>
              <span className="live-dot" />
              {prefs.role === 'kep' ? 'Vai kép' : 'Vai đào'} ·{' '}
              {prefs.voice === 'low' ? 'Giọng thấp' : 'Giọng cao'}
            </span>
            {prefs.mode === 'cardboard' ? (
              <Button variant="secondary" onClick={exit}>
                <Monitor size={16} />
                Thoát kính
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => void cardboard()}
                loading={sensorBusy}
                disabled={busy || sceneError}
              >
                <Glasses size={17} />
                Dùng kính giấy
              </Button>
            )}
          </div>
          <div className="practice-controls">
            <div className="practice-status" aria-live="polite">
              <span className={`status-dot ${phase === 'recording' ? 'recording' : ''}`} />
              {caption}
            </div>
            {phase === 'recording' && (
              <progress value={elapsed} max={exercise.duration} aria-label="Thời lượng thu âm" />
            )}
            <div className="control-actions">
              <Button variant="secondary" onClick={() => void sample()} disabled={busy}>
                <Play size={17} />
                Nghe mẫu
              </Button>
              <Button onClick={() => void record()} disabled={busy}>
                <Mic size={17} />
                {analysis ? 'Thử lại' : 'Đến lượt bạn'}
              </Button>
              {hasRecording && (
                <Button
                  variant="ghost"
                  onClick={() => void engine.current.replay()}
                  disabled={busy}
                >
                  <Volume2 size={17} />
                  Nghe bản thu
                </Button>
              )}
              {busy && (
                <Button variant="ghost" onClick={stop}>
                  <Square size={16} />
                  Dừng
                </Button>
              )}
            </div>
          </div>
        </section>
        <aside className="stack">
          <section className="panel exercise-detail">
            <span className="step-label">BÀI 0{index + 1} / 03</span>
            <h2>{exercise.title}</h2>
            <p>{exercise.description}</p>
            <div className="note-guide" aria-label="Gợi ý chuỗi mẫu">
              {exercise.hideGuide && (phase === 'recording' || phase === 'countdown') ? (
                <span>Gợi ý đã ẩn · Hãy nhớ lại mẫu</span>
              ) : (
                exercise.notes.map((note, i) => (
                  <span key={i} style={{ transform: `translateY(${(59 - note.midi) * 3}px)` }}>
                    a<small>{i + 1}</small>
                  </span>
                ))
              )}
            </div>
            <ol className="instruction-list">
              <li>Nghe mẫu ít nhất một lần.</li>
              <li>Bấm “Đến lượt bạn”, nghe ba nhịp đếm.</li>
              <li>Ngắt rõ giữa các tiếng “a”; không hát khi mẫu đang phát.</li>
            </ol>
            <p className="small muted">
              Gợi ý: dùng tai nghe có dây, chọn chỗ yên tĩnh. Tắt loa ngoài khi thu.
            </p>
          </section>
          {analysis && (
            <section className="panel feedback-panel" aria-live="polite">
              <span className="step-label">LẮNG NGHE LƯỢT VỪA RỒI</span>
              <div className="score-pair">
                <div>
                  <strong>{analysis.rhythm ?? '—'}</strong>
                  <span>Nhịp / 100</span>
                </div>
                <div>
                  <strong>{analysis.pitch ?? '—'}</strong>
                  <span>Cao độ / 100</span>
                </div>
              </div>
              {analysis.feedback.map((text, i) => (
                <p key={i} className={i === 2 ? 'small muted' : ''}>
                  {text}
                </p>
              ))}
              {saved && (
                <span className="save-label">
                  <Check size={14} />
                  Đã lưu kết quả trên máy
                </span>
              )}
              <Link className="text-link" to="/tien-bo">
                Xem tiến bộ <ArrowRight size={16} />
              </Link>
              {index < 2 && (
                <Button variant="secondary" onClick={() => select(index + 1)}>
                  Bài tiếp theo <ArrowRight size={16} />
                </Button>
              )}
            </section>
          )}
        </aside>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      {prefs.mode === 'cardboard' && (
        <p className="landscape-hint">
          Xoay điện thoại ngang. Nhìn vào nút trong 1,5 giây để chọn. Ngồi ổn định và dừng khi khó
          chịu.
        </p>
      )}
      <Notice>
        Điểm là phản hồi thử nghiệm cho bài âm tổng hợp. Khi thiếu tiếng hát hoặc nhiễu nhiều, hệ
        thống sẽ đề nghị thử lại thay vì cho điểm 0.
      </Notice>
    </div>
  )
}
