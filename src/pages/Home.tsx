import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Glasses,
  BookOpen,
  Play,
  Sprout,
  Headphones,
  Check,
} from 'lucide-react'
import { CourtyardArt } from '../components/CourtyardArt'
import { Eyebrow } from '../components/ui'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="heritage-label">
            <span /> DI SẢN SỐNG · THẾ HỆ TIẾP NỐI
          </div>
          <h1>
            Giữ một nhịp Xoan.
            <br />
            <em>Nối ngàn câu chuyện.</em>
          </h1>
          <p>
            Về với sân đình đất Tổ, lắng nghe lời ca xưa và để tiếng hát của bạn trở thành một phần
            câu chuyện.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/chuan-bi">
              Vào sân đình <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-ghost" to="/kham-pha">
              <span className="play-circle">
                <Play size={12} fill="currentColor" />
              </span>
              Khám phá Hát Xoan
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <Check size={14} /> Không cần cài đặt
            </span>
            <span>
              <Check size={14} /> Miễn phí trải nghiệm
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <CourtyardArt />
          <div className="art-note">
            <span className="note-icon">
              <AudioLines size={21} />
            </span>
            <div>
              <strong>Lắng nghe trước, cùng nhau đáp lại.</strong>
              <span>Tranh minh họa AI · Nhân vật hư cấu</span>
            </div>
            <span className="sound-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          <span className="visual-tag">
            ĐÊM XOAN KHÔNG TẮT <span>✦</span>
          </span>
        </div>
      </section>
      <section className="intro-strip">
        <span className="round-icon">
          <Sprout size={23} />
        </span>
        <p>
          Di sản chỉ thực sự sống
          <br />
          <strong>khi có người tiếp nối.</strong>
        </p>
        <span className="strip-line" />
        <p className="strip-detail">
          Một không gian để tìm hiểu, lắng nghe và thử sức với nhịp điệu — bắt đầu từ sự tò mò của
          chính bạn.
        </p>
        <Link to="/kham-pha" className="round-link" aria-label="Tìm hiểu di sản">
          <ArrowUpRight size={20} />
        </Link>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <Eyebrow>MỘT HÀNH TRÌNH, NHIỀU KẾT NỐI</Eyebrow>
            <h2>Chạm vào di sản theo cách của bạn</h2>
          </div>
          <span className="subtle">Dành cho những người mới bắt đầu</span>
        </div>
        <div className="feature-grid">
          <Link to="/kham-pha" className="feature-card">
            <div className="feature-top">
              <span className="feature-icon sage">
                <BookOpen size={23} />
              </span>
              <ArrowUpRight size={20} />
            </div>
            <span className="card-number">01 / KHÁM PHÁ</span>
            <h3>Hiểu một miền di sản</h3>
            <p>Gặp những câu chuyện, con người và không gian đã nuôi dưỡng Hát Xoan.</p>
            <span className="card-link">
              Mở câu chuyện <ArrowRight size={16} />
            </span>
          </Link>
          <Link to="/chuan-bi" className="feature-card">
            <div className="feature-top">
              <span className="feature-icon terracotta">
                <AudioLines size={23} />
              </span>
              <ArrowUpRight size={20} />
            </div>
            <span className="card-number">02 / THỰC HÀNH</span>
            <h3>Nghe một câu, đáp một nhịp</h3>
            <p>Thử bài luyện nhịp, cao độ và nhận phản hồi từ chính giọng hát của bạn.</p>
            <span className="card-link">
              Thử luyện tập <ArrowRight size={16} />
            </span>
          </Link>
          <Link to="/chuan-bi" className="feature-card">
            <div className="feature-top">
              <span className="feature-icon sand">
                <Glasses size={23} />
              </span>
              <ArrowUpRight size={20} />
            </div>
            <span className="card-number">03 / TRẢI NGHIỆM</span>
            <h3>Một bước vào sân đình</h3>
            <p>Khám phá không gian 3D trên màn hình hoặc trải nghiệm qua kính giấy.</p>
            <span className="card-link">
              Chọn trải nghiệm <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>
      <section className="journey-banner">
        <div className="journey-symbol">
          <Headphones size={36} />
          <span>♪</span>
        </div>
        <div>
          <Eyebrow>CHỈ CẦN MỘT CHÚT TÒ MÒ</Eyebrow>
          <h2>Buổi hẹn đầu tiên với nhịp Xoan</h2>
          <p>Một hành trình ngắn: tìm hiểu di sản, nghe mẫu rồi thử đáp lại.</p>
          <span className="tag">5–10 phút</span>
          <span className="tag">3 bài luyện minh họa</span>
        </div>
        <Link className="btn btn-secondary" to="/chuan-bi">
          Bắt đầu hành trình <ArrowRight size={17} />
        </Link>
      </section>
    </>
  )
}
