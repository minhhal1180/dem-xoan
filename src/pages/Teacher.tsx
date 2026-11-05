import { Download, Users, Music2, Heart, Clock3 } from 'lucide-react'
import { demoStudents } from '../content/demoClass'
import { PageHeading, Notice, Button, downloadFile } from '../components/ui'
export default function Teacher() {
  return (
    <>
      <PageHeading
        eyebrow="GÓC GIÁO VIÊN"
        title="Cùng một lớp, chung một nhịp"
        description="Hình dung cách tổ chức hoạt động khám phá di sản và theo dõi các lượt thực hành trong tương lai."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              downloadFile(
                'lop-mau-DU-LIEU-MINH-HOA.csv',
                '\uFEFFDU LIEU MINH HOA - KHONG PHAI KET QUA THUC NGHIEM\nMa hoc sinh,Diem truoc,Diem sau,So buoi\n' +
                  demoStudents
                    .map((s) => `${s.id},${s.before},${s.after},${s.sessions}`)
                    .join('\n'),
                'text/csv;charset=utf-8',
              )
            }
          >
            <Download size={17} />
            Xuất lớp mẫu
          </Button>
        }
      />
      <Notice>
        Dữ liệu minh họa · Lớp giả lập 30 học sinh. Các con số và biểu đồ dưới đây không phải kết
        quả thử nghiệm hoặc dữ liệu người học thật.
      </Notice>
      <div className="stats-grid four">
        <article className="stat-card">
          <Users size={21} />
          <strong>30</strong>
          <span>Học sinh giả lập</span>
        </article>
        <article className="stat-card">
          <Music2 size={21} />
          <strong>3</strong>
          <span>Bài luyện mẫu</span>
        </article>
        <article className="stat-card">
          <Clock3 size={21} />
          <strong>
            10<small> phút</small>
          </strong>
          <span>Hoạt động gợi ý</span>
        </article>
        <article className="stat-card">
          <Heart size={21} />
          <strong>4</strong>
          <span>Trạm luân phiên</span>
        </article>
      </div>
      <div className="two-col section-block">
        <section className="panel">
          <span className="eyebrow">BIỂU ĐỒ MINH HỌA</span>
          <h2>Hình dung tiến bộ qua hai lượt</h2>
          <p className="muted small">Số liệu giả lập của 10 học sinh đầu, thang 0–100.</p>
          <div className="chart-legend">
            <span>
              <i />
              Lượt đầu
            </span>
            <span>
              <i />
              Lượt sau
            </span>
          </div>
          <div
            className="bar-chart"
            role="img"
            aria-label="Biểu đồ minh họa hai lượt của 10 học sinh giả lập"
          >
            {demoStudents.slice(0, 10).map((s) => (
              <div className="bar-pair" key={s.id}>
                <div>
                  <span style={{ height: `${s.before}%` }} title={`Đầu: ${s.before}`} />
                  <span style={{ height: `${s.after}%` }} title={`Sau: ${s.after}`} />
                </div>
                <small>{s.id.slice(2)}</small>
              </div>
            ))}
          </div>
          <p className="small muted">Dữ liệu minh họa. Xem số liệu đầy đủ trong bảng bên dưới.</p>
        </section>
        <section className="panel">
          <span className="eyebrow">GỢI Ý TỔ CHỨC</span>
          <h2>Một lớp học, bốn điểm chạm</h2>
          <ol className="teaching-steps">
            <li>
              <strong>Nghe và tìm hiểu</strong>
              <span>Giới thiệu bối cảnh, xem tư liệu nguồn.</span>
            </li>
            <li>
              <strong>Thử một nhịp chung</strong>
              <span>Nghe mẫu, dùng tiếng “a” thử bài kỹ thuật.</span>
            </li>
            <li>
              <strong>Vào sân đình</strong>
              <span>Luân phiên dùng màn hình và kính giấy.</span>
            </li>
            <li>
              <strong>Chia sẻ điều vừa học</strong>
              <span>Nói về cảm nhận và điều muốn hỏi nghệ nhân.</span>
            </li>
          </ol>
        </section>
      </div>
      <section className="panel section-block">
        <div className="section-heading">
          <h2>Lớp mẫu · 30 học sinh</h2>
          <span className="tag">Dữ liệu minh họa</span>
        </div>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Dữ liệu lớp giả lập">
          <table>
            <thead>
              <tr>
                <th>Mã giả lập</th>
                <th>Điểm lượt đầu</th>
                <th>Điểm lượt sau</th>
                <th>Số buổi mẫu</th>
              </tr>
            </thead>
            <tbody>
              {demoStudents.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.before}</td>
                  <td>{s.after}</td>
                  <td>{s.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
