import { ArrowRight, BookOpen, MapPin, Users, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import catalog from '../content/catalog.json'
import { PageHeading, Eyebrow, External, Notice } from '../components/ui'
export default function Explore() {
  return (
    <>
      <PageHeading
        eyebrow="LẮNG NGHE MIỀN ĐẤT TỔ"
        title="Một lời ca. Một miền ký ức."
        description="Làm quen với di sản qua câu chuyện của cộng đồng gìn giữ Hát Xoan Phú Thọ."
      />
      <section className="discovery-hero">
        <img
          src={`${import.meta.env.BASE_URL}media/hatxoan.jpg`}
          alt="Cộng đồng biểu diễn Hát Xoan tại Việt Trì"
          width="600"
          height="480"
        />
        <div>
          <Eyebrow>HÁT XOAN PHÚ THỌ</Eyebrow>
          <h2>Tiếng hát từ sân đình, đi cùng bao thế hệ</h2>
          <p>
            Hát Xoan kết hợp tiếng hát, múa và nhịp gõ trong không gian sinh hoạt văn hóa cộng đồng
            ở Phú Thọ. Cách hát được trao truyền qua việc nghe, tập và cùng nhau thực hành.
          </p>
          <p>
            Năm 2017, Hát Xoan Phú Thọ được ghi danh vào Danh sách Di sản văn hóa phi vật thể đại
            diện của nhân loại.
          </p>
          <External href={catalog[0].sourceUrl}>Đọc hồ sơ UNESCO</External>
        </div>
      </section>
      <p className="attribution">
        Ảnh: Tungdino1997 / Wikimedia Commons ·{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
          CC BY-SA 4.0
        </a>{' '}
        · Ảnh gốc, bố cục hiển thị được điều chỉnh.
      </p>
      <div className="feature-grid section-block">
        {[
          {
            icon: MapPin,
            title: 'Không gian cộng đồng',
            text: 'Sân đình và làng Xoan là nơi tiếng hát gắn với ký ức, lễ hội và sự gặp gỡ của người dân.',
          },
          {
            icon: Users,
            title: 'Con người giữ nghề',
            text: 'Nghệ nhân và các phường Xoan lưu giữ cách hát, truyền dạy bằng lời và bằng thực hành cho thế hệ tiếp nối.',
          },
          {
            icon: BookOpen,
            title: 'Học từ sự lắng nghe',
            text: 'Tìm hiểu bối cảnh trước khi hát. Ứng dụng là điểm khởi đầu để khám phá, bổ trợ cho việc học cùng người giữ nghề.',
          },
        ].map(({ icon: Icon, title, text }) => (
          <article className="feature-card" key={title}>
            <span className="feature-icon sage">
              <Icon size={22} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <section className="resource-card">
        <div className="resource-icon">
          <ExternalLink size={27} />
        </div>
        <div>
          <Eyebrow>TƯ LIỆU TỪ NGUỒN GỐC · CẦN INTERNET</Eyebrow>
          <h2>Xem và nghe Hát Xoan</h2>
          <p>
            Phim tư liệu trong kho UNESCO. Mở tại trang nguồn để xem đầy đủ thông tin về người thực
            hiện và quyền sử dụng.
          </p>
          <External href={catalog[2].sourceUrl}>Mở tư liệu UNESCO</External>
        </div>
      </section>
      <Notice>
        Ba bài luyện trong ứng dụng dùng âm tổng hợp để minh họa nhịp và cao độ; không phải câu Hát
        Xoan. Các tư liệu bên ngoài không được tải vào gói offline.
      </Notice>
      <div className="page-end-action">
        <Link to="/chuan-bi" className="btn btn-primary">
          Thử một nhịp chung <ArrowRight size={17} />
        </Link>
        <Link to="/cai-dat" className="text-link">
          Xem tất cả nguồn tư liệu
        </Link>
      </div>
    </>
  )
}
