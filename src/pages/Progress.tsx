import { Link } from 'react-router-dom'
import { ArrowRight, Download, AudioLines, Flag, TrendingUp, Cloud, CloudOff } from 'lucide-react'
import { useProgress } from '../data/useProgress'
import { exercises } from '../content/exercises'
import { Button, Notice, PageHeading, downloadFile } from '../components/ui'
export default function Progress() {
  const { attempts, error, loading } = useProgress()
  const valid = attempts.filter((a) => a.rhythm !== null && a.pitch !== null)
  const complete = new Set(valid.map((a) => a.exerciseId)).size
  return (
    <>
      <PageHeading
        eyebrow="TỪNG NHỊP, TỪNG BƯỚC"
        title="Hành trình của riêng bạn"
        description="Ghi nhận những lần bạn đã thử. Kết quả chỉ phản ánh bài luyện âm tổng hợp, không đánh giá kỹ năng Hát Xoan."
        action={
          <Button
            variant="secondary"
            disabled={!attempts.length}
            onClick={() =>
              downloadFile(
                'dem-xoan-tien-bo.json',
                JSON.stringify(
                  {
                    type: 'dem-xoan-progress',
                    version: 1,
                    exportedAt: new Date().toISOString(),
                    attempts,
                  },
                  null,
                  2,
                ),
              )
            }
          >
            <Download size={17} />
            Xuất kết quả
          </Button>
        }
      />
      {error && <Notice kind="error">{error}</Notice>}
      {loading ? (
        <div className="panel">Đang đọc hành trình…</div>
      ) : (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <AudioLines size={21} />
              <strong>{attempts.length}</strong>
              <span>Lượt đã thực hành</span>
            </article>
            <article className="stat-card">
              <Flag size={21} />
              <strong>
                {complete}
                <small> / 3</small>
              </strong>
              <span>Bài có kết quả hợp lệ</span>
            </article>
            <article className="stat-card">
              <Cloud size={21} />
              <strong>{attempts.filter((a) => a.syncStatus === 'synced').length}</strong>
              <span>Lượt đã lưu online</span>
            </article>
          </div>
          {!attempts.length ? (
            <section className="empty-state">
              <span className="feature-icon sand">
                <AudioLines size={29} />
              </span>
              <h2>Mỗi hành trình bắt đầu từ một nhịp</h2>
              <p>Thử bài luyện đầu tiên. Kết quả của bạn sẽ xuất hiện ở đây.</p>
              <Link to="/chuan-bi" className="btn btn-primary">
                Bắt đầu luyện tập <ArrowRight size={17} />
              </Link>
            </section>
          ) : (
            <>
              <div className="section-heading section-block">
                <div>
                  <span className="eyebrow">NHÌN LẠI ĐỂ TIẾP NỐI</span>
                  <h2>Tiến bộ qua từng bài</h2>
                </div>
              </div>
              <div className="feature-grid">
                {exercises.map((exercise) => {
                  const all = valid.filter((a) => a.exerciseId === exercise.id),
                    latest = all[0]
                  const comparable = latest
                    ? all.filter(
                        (a) =>
                          a.voice === latest.voice &&
                          a.algorithmVersion === latest.algorithmVersion &&
                          a.exerciseVersion === latest.exerciseVersion,
                      )
                    : []
                  const first = comparable.at(-1),
                    delta = latest && first ? latest.rhythm! - first.rhythm! : 0
                  return (
                    <article className="feature-card" key={exercise.id}>
                      <span className="card-number">{exercise.subtitle}</span>
                      <h3>{exercise.title}</h3>
                      {latest ? (
                        <>
                          <div className="mini-score">
                            <strong>
                              {latest.rhythm}
                              <small>/100</small>
                            </strong>
                            <span>Điểm nhịp gần nhất</span>
                          </div>
                          <div className="score-track">
                            <span style={{ width: `${latest.rhythm}%` }} />
                          </div>
                          <p className="small muted">
                            {comparable.length > 1 ? (
                              <>
                                <TrendingUp size={14} /> {delta > 0 ? '+' : ''}
                                {delta} điểm nhịp so với lượt đầu cùng quãng giọng và phiên bản.
                              </>
                            ) : (
                              'Cần thêm một lượt hợp lệ cùng quãng giọng để so sánh.'
                            )}
                          </p>
                        </>
                      ) : (
                        <p>Chưa có lượt đo đủ dữ liệu.</p>
                      )}
                      <Link to={`/san-dinh?bai=${exercise.id}`} className="text-link">
                        Luyện thêm <ArrowRight size={15} />
                      </Link>
                    </article>
                  )
                })}
              </div>
              <section className="panel section-block">
                <div className="section-heading">
                  <h2>Những lượt vừa qua</h2>
                  <span className="subtle">Mới nhất trước</span>
                </div>
                <div
                  className="table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Lịch sử luyện tập"
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Bài luyện</th>
                        <th>Thời điểm</th>
                        <th>Giọng</th>
                        <th>Nhịp</th>
                        <th>Cao độ</th>
                        <th>Lưu trữ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.slice(0, 30).map((a) => (
                        <tr key={a.id}>
                          <td>
                            {exercises.find((e) => e.id === a.exerciseId)?.title || a.exerciseId}
                          </td>
                          <td>{new Date(a.createdAt).toLocaleString('vi-VN')}</td>
                          <td>{a.voice === 'low' ? 'Thấp' : 'Cao'}</td>
                          <td>{a.rhythm ?? 'Chưa đủ dữ liệu'}</td>
                          <td>{a.pitch ?? '—'}</td>
                          <td>
                            <span className="storage-status">
                              {a.syncStatus === 'synced' ? (
                                <Cloud size={14} />
                              ) : (
                                <CloudOff size={14} />
                              )}
                              {a.syncStatus === 'synced'
                                ? 'Đã đồng bộ'
                                : a.syncStatus === 'pending'
                                  ? 'Chờ đồng bộ'
                                  : 'Trên máy'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </>
  )
}
