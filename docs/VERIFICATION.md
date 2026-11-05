# Kiểm chứng và giới hạn

## Bổ sung v1.1 — hình ảnh và iOS

- 8 unit tests: bổ sung dữ liệu cảm biến hợp lệ, góc xoay iOS cũ/mới, AudioContext bị `interrupted` và tạo lại sau khi giải phóng.
- 14 browser checks đạt trên máy phát triển: 11 Chromium và 3 WebKit mô phỏng iPhone; bài kiểm tra API live chạy riêng bằng `TEST_LIVE_API=1`.
- WebKit trên Windows không cung cấp `AudioContext`, `AudioWorkletNode` hoặc `mediaDevices`. Kiểm tra tương ứng xác minh lỗi phục hồi được, **không xác nhận thu/phát âm thanh thật trên Safari**. Workflow Linux cũng cài WebKit để chạy nhánh Web Audio nếu bản WebKit cung cấp API.
- Chromium tiếp tục kiểm tra đường PCM → AudioWorklet → Worker → IndexedDB và offline. Bộ ảnh WebP được xác minh tải từ cache khi đã ngắt mạng.
- Bốn ảnh WebP tổng 694.336 byte; hai nhân vật giữ kênh alpha. Gói precache sau build khoảng 1,94 MiB, chưa phải số đo thời gian tải trên điện thoại.
- Đã điều chỉnh giao diện và quyền cho iOS; nghiệm thu micro, cảm biến, stereo, cài PWA và hiệu năng trên iPhone thật vẫn chưa thực hiện. Không coi thiết bị mô phỏng là nghiệm thu kính giấy.

Tham chiếu hành vi trình duyệt: [WebKit: yêu cầu quyền cảm biến từ tương tác](https://bugs.webkit.org/show_bug.cgi?id=201676), [WebKit: AudioContext interrupted](https://bugs.webkit.org/show_bug.cgi?id=273511).

## Đã kiểm tra tự động trong môi trường phát triển

- TypeScript strict và production build.
- PCM: tín hiệu mẫu chuẩn, trễ nhịp, sai cao độ, im lặng, nhiễu và bản thu quá ngắn.
- IndexedDB: cùng UUID không tạo bản ghi trùng, điểm có thể rỗng, không có PCM trong dữ liệu lưu.
- API: hai chủ token cách ly dữ liệu; body owner không vượt xác thực; session phải cùng chủ; upsert không trùng; xóa đúng người; CORS; UUID/dữ liệu sai; không lưu samples.
- Browser Chromium: điều hướng, nguồn, QR, dashboard 30 học sinh giả lập, deep link, từ chối micro, đường thu âm AudioWorklet → Worker → IndexedDB.
- Browser offline: xác minh cache, ngắt mạng, mở lazy route lớp mẫu và sân đình, thu và phân tích khi offline.
- Responsive: kiểm tra document không tràn ở 360/390/768/1024/1440 px trên cả bảy trang chính.

Kết quả kiểm tra ngày 05/11/2026: 5 unit tests, 2 API tests và 11 browser tests thành công trên máy phát triển; bộ kiểm tra CI Ubuntu cũng đã thành công. Kiểm tra accessibility tự động trên sáu trang nội dung theo nhóm WCAG A/AA của axe không phát hiện violation trong các trạng thái đã quét; không thay thế audit thủ công toàn bộ.

Đã triển khai GitHub Pages tại https://minhhal1180.github.io/dem-xoan/ và API systemd tại https://sv28.bcse-vju.com/v1/health. Nginx kiểm tra cấu hình thành công; trang chủ VPS hiện có vẫn trả HTTP 200.

Kiểm thử tích hợp HTTPS từ trình duyệt đã thành công: đồng ý lưu online → tạo phiên ẩn danh → thu âm bằng thiết bị micro giả lập Chromium qua AudioWorklet → phân tích Worker → đồng bộ kết quả → hiển thị Đã đồng bộ → xóa dữ liệu trên API và local. Đây là kiểm chứng đường đi dữ liệu, không phải kiểm chứng chất lượng đánh giá giọng hát thật.

Gói precache sau build sạch khoảng 1,29 MiB. JavaScript khởi động khoảng 129 kB gzip, chunk cảnh 3D khoảng 138 kB gzip. `npm audit` hiện không báo lỗ hổng trong cây dependency đã khóa. Các số bundle là kích thước build, không phải phép đo độ trễ mạng/thiết bị.

Các lệnh tái lập nằm trong README và CI. Để chạy kiểm thử kết nối VPS: đặt `TEST_LIVE_API=1` và chạy `npx playwright test live.spec.ts`; có thể đặt `TEST_BASE_URL=https://minhhal1180.github.io/dem-xoan/` để chạy trên bản công khai.

## Chưa được coi là nghiệm thu

- Chưa có kết quả kiểm thử hai điện thoại Android, một iPhone, kính giấy vật lý hoặc phiên 5 phút đo FPS trên điện thoại thật.
- Chưa xác minh distortion/quang học của từng kính. StereoEffect là hai góc nhìn stereo, không mặc nhiên tương đương một bộ tích hợp Cardboard đầy đủ.
- Chưa hiệu chỉnh với nghệ nhân hoặc bản ghi Xoan có quyền xử lý. Bộ chấm chỉ dùng bài âm tổng hợp, không đánh giá kỹ thuật Hát Xoan.
- Chưa đo mục tiêu tải 3 giây trên đường truyền giới hạn 10 Mbps hoặc phản hồi dưới 2 giây trên điện thoại mục tiêu.
- Chưa có kết quả dạy thử, mức hài lòng hay hiệu quả học tập. Dashboard là dữ liệu giả lập có nhãn.
- Không có video thực nghiệm người dùng thật. Ảnh chụp giao diện không thay thế bằng chứng sử dụng thực tế.

## Kiểm tra thủ công trước dạy thử

Ghi thiết bị/OS/trình duyệt, loại kính, quyền micro/cảm biến, quãng giọng, kết quả đo/nhận xét, FPS trung bình, thời gian phản hồi và lỗi. Kiểm tra cả browser và PWA cài trên màn hình chính. Dừng micro khi chuyển nền, kiểm tra khôi phục phiên, thử từ chối từng quyền và kiểm tra xóa dữ liệu online khi mất mạng.

## Giới hạn bản demo

Điểm do client tính và có thể bị người dùng chỉnh sửa; không dùng để xếp hạng chính thức. Token ẩn danh không khôi phục được nếu xóa trình duyệt; chưa có đăng nhập nhiều thiết bị. API bảo vệ cơ bản bằng token, kiểm tra đầu vào, ownership và giới hạn request; cần kiểm tra tải/abuse trước khi mở quy mô lớn. Dữ liệu không tự chứng minh hiệu quả giáo dục.
