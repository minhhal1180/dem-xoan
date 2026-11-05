# Kiểm chứng và giới hạn

## Đã kiểm tra tự động trong môi trường phát triển

- TypeScript strict và production build.
- PCM: tín hiệu mẫu chuẩn, trễ nhịp, sai cao độ, im lặng, nhiễu và bản thu quá ngắn.
- IndexedDB: cùng UUID không tạo bản ghi trùng, điểm có thể rỗng, không có PCM trong dữ liệu lưu.
- API: hai chủ token cách ly dữ liệu; body owner không vượt xác thực; session phải cùng chủ; upsert không trùng; xóa đúng người; CORS; UUID/dữ liệu sai; không lưu samples.
- Browser Chromium: điều hướng, nguồn, QR, dashboard 30 học sinh giả lập, deep link, từ chối micro, đường thu âm AudioWorklet → Worker → IndexedDB.
- Browser offline: xác minh cache, ngắt mạng, mở lazy route lớp mẫu và sân đình, thu và phân tích khi offline.
- Responsive: kiểm tra document không tràn ở 360/390/768/1024/1440 px trên cả bảy trang chính.

Kết quả thực tế cuối cùng và URL triển khai được cập nhật ở cuối quá trình phát hành. Các lệnh tái lập nằm trong README và CI.

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
