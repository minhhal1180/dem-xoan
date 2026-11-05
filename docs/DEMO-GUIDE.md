# Hướng dẫn trình diễn một trang

## Trước buổi trình diễn

1. Mở ứng dụng bằng Chrome Android hoặc trình duyệt desktop. Dùng HTTPS; không mở `index.html` bằng file explorer.
2. Vào **Thiết bị & tư liệu → Chuẩn bị demo offline**. Chờ thông báo đã xác minh đủ tài nguyên. Nếu chưa xác minh, không khẳng định offline sẵn sàng.
3. Chuẩn bị tai nghe có dây và chỗ yên tĩnh. Kiểm tra micro; thử một lượt trước khi lên sân khấu.
4. Nếu dùng kính: Android phải có cảm biến, cấp quyền micro/cảm biến trước, xoay ngang. Có người hỗ trợ, ngồi ổn định. Nếu khó chịu hoặc hướng nhìn không hoạt động, dùng màn hình.
5. Không dùng số liệu lớp giả lập làm kết quả thực nghiệm.

## Kịch bản 5–10 phút

| Chặng     | Thao tác / lời dẫn                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| Mở đầu    | “Đêm Xoan là một điểm bắt đầu để người trẻ tìm hiểu di sản bằng sự lắng nghe và thực hành.” Mở QR thật từ nút chia sẻ |
| Khám phá  | Mở trang di sản, chỉ thông tin UNESCO và ảnh có nguồn. Video mở tại nguồn và cần internet                             |
| Chuẩn bị  | Chọn vai kép/đào, quãng giọng thấp/cao. Nghe thử, kiểm tra micro                                                      |
| Thực hành | Vào sân đình, chọn bài đầu, nghe mẫu. Nhấn Đến lượt bạn, đợi ba nhịp đếm rồi đáp bốn tiếng “a” ngắt rõ                |
| Phản hồi  | Xem hai điểm, nhận xét sớm/trễ và cao/thấp; nghe lại bản thu. Nếu thiếu dữ liệu, thử lại; không đổi thành điểm giả    |
| Thử lại   | Làm lại cùng bài và quãng giọng. Vào Hành trình để xem so sánh các lượt hợp lệ                                        |
| Kính giấy | Chỉ trình diễn khi đã kiểm tra trên điện thoại thật. Nhìn vào nút 1,5 giây để chọn; căn hướng và thoát luôn có sẵn    |
| Giáo viên | Mở lớp giả lập 30 học sinh. Nói rõ đây là dữ liệu minh họa cho giao diện tương lai                                    |
| Kết       | “Bước tiếp theo là có bản ghi được phép xử lý và duyệt bộ chấm cùng nghệ nhân trước khi dạy thử.”                     |

## Khi có sự cố

- Không có micro: cho phép trong cài đặt trình duyệt, hoặc tiếp tục nghe mẫu/khám phá.
- Không có WebGL/cảm biến: dùng 2D, không cần kính để hoàn thành bài.
- Mất mạng: dùng bài kỹ thuật đã chuẩn bị; kết quả lưu trên máy. Tư liệu UNESCO ngoài app sẽ chưa mở được.
- API chưa kết nối: không ảnh hưởng thu/chấm; vào Thiết bị & tư liệu để thử đồng bộ sau.
- Không có tiếng/điểm trống: kiểm tra đầu vào và ngắt rõ giữa các tiếng. Chấm âm tổng hợp chỉ là minh họa kỹ thuật.

Ảnh chụp trong `docs/screenshots` chỉ minh họa giao diện. `docs/demo/interface-demo.webm` là video thao tác giao diện tự động, không có âm thanh, có nhãn phân biệt trên hình; dùng làm tư liệu dự phòng khi giới thiệu sản phẩm. Có thể tạo lại bằng `node scripts/record-demo.mjs` khi preview đang chạy. Video trình diễn thật cần tự ghi từ thiết bị sau khi nghiệm thu; dự án không có video quay người dùng thật hoặc nghệ nhân giả lập.
