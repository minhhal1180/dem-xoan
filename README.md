# Đêm Xoan Không Tắt

PWA tiếng Việt giới thiệu Hát Xoan Phú Thọ và minh họa việc nghe–đáp, thu âm, phản hồi nhịp/cao độ. Giao diện trên GitHub Pages, API Python/SQLite trên VPS. Không dùng Supabase.

- **Ứng dụng:** https://minhhal1180.github.io/dem-xoan/
- **API:** https://sv28.bcse-vju.com/v1/health
- **Quy chuẩn thiết kế:** [docs/UX-UI-STANDARD.md](docs/UX-UI-STANDARD.md)
- **Triển khai và vận hành:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Hướng dẫn trình diễn:** [docs/DEMO-GUIDE.md](docs/DEMO-GUIDE.md)
- **Kiểm chứng và giới hạn:** [docs/VERIFICATION.md](docs/VERIFICATION.md)
- **Ảnh imagegen và bộ prompt:** [docs/IMAGE-ASSETS.md](docs/IMAGE-ASSETS.md)

## Chạy local

Yêu cầu Node.js 24+, npm; Python 3.11+ cho backend và kiểm thử API. Dependencies frontend khóa bằng `package-lock.json`; backend không cần pip.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Mở địa chỉ Vite in ra và thêm `/dem-xoan/` nếu cần. Chỉnh `VITE_API_URL=https://sv28.bcse-vju.com` để dùng API. Để trống nếu chỉ cần local/offline; app không giả lập việc đã đồng bộ.

```powershell
npm run typecheck
npm test
python -m unittest discover -s backend -p 'test_*.py'
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Kiểm thử API thật từ giao diện: đặt `TEST_LIVE_API=1`, chạy `npx playwright test live.spec.ts`. Mặc định CI bỏ qua test này để không tạo dữ liệu trên VPS. Dùng `TEST_BASE_URL` để chỉ định bản GitHub Pages thay cho preview local.

`npm run preview` phục vụ bản build và service worker. Dev server không được dùng làm bằng chứng PWA offline. `npm run icons` tạo lại icon PNG từ SVG nội bộ.

## Cấu trúc

```text
src/pages/        Trang chủ, khám phá, chuẩn bị, sân đình, tiến bộ, lớp mẫu, cài đặt
src/components/  Thành phần UI dùng chung và ảnh hero
src/styles/      Token thiết kế và responsive
src/audio/       AudioWorklet, Web Audio, Worker và bộ chấm PCM
src/scene/       Three.js, stereo và cảm biến hướng nhìn
src/data/        IndexedDB, phiên ẩn danh và hàng đợi đồng bộ
src/content/     Danh mục nguồn, bài kỹ thuật và dữ liệu lớp giả lập
public/media/generated/  WebP minh họa dùng trong UI và cảnh Three.js
assets/imagegen/v1.1/    PNG gốc của bộ ảnh imagegen
src/sw.ts        Precache và xác minh gói offline
backend/         API, migration tự động, systemd, Nginx và kiểm thử phân quyền
tests/           Kiểm thử bộ chấm, lưu trữ và trình duyệt
docs/            Quy chuẩn UX/UI, vận hành, trình diễn, giới hạn kiểm chứng
```

## Dữ liệu và phạm vi

Mặc định lưu tiến bộ trong IndexedDB. Người dùng chủ động bật lưu online để nhận token ẩn danh; API chỉ lưu số liệu, không lưu file âm thanh. Token chỉ lưu trong trình duyệt; database giữ hash token. Không có tài khoản khôi phục nhiều thiết bị. Điểm do client tính nên không dùng làm điểm thi hoặc số liệu được chứng thực.

Ba bài dùng âm tổng hợp, **không phải câu Hát Xoan**. Cảnh/nhân vật là minh họa. Dashboard giáo viên dùng 30 học sinh giả lập có nhãn. Bản ghi Hát Xoan thật, lớp học thật và hiệu chỉnh chuyên môn chưa nằm trong release này.

Từ v1.1, giao diện và sân đình dùng tranh imagegen có nhãn minh họa AI. Cảnh Three.js dùng nền panorama và hai nhân vật trên mặt phẳng có alpha; chưa phải mô hình nhân vật có hoạt ảnh. PNG gốc, WebP tối ưu và đặc tả prompt được bàn giao cùng mã nguồn. Đã bổ sung xử lý quyền cảm biến, góc xoay và AudioContext của Safari/iOS; micro và kính vẫn cần nghiệm thu trên iPhone thật.

Ảnh tư liệu `public/media/hatxoan.jpg`: Tungdino1997, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Hatxoan.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), giữ nguyên file gốc và dẫn nguồn riêng. Không được hiểu tác giả/người trong ảnh bảo trợ dự án. Tư liệu UNESCO chỉ dẫn nguồn. Phông Be Vietnam Pro và Lora qua Fontsource có giấy phép OFL kèm package. Thư viện bên thứ ba giữ giấy phép gốc.
