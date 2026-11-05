# Quy chuẩn UX/UI — Đêm Xoan Không Tắt

Phiên bản 1.0 · 05/11/2026. Áp dụng cho mọi màn hình và tính năng bổ sung.

## 1. Cơ sở kế thừa từ dự án hiện có

Đã rà soát dự án VJU tại `Downloads/vju-academic-portal-main (1)/vju-cvht-staging-36958827488`, cụ thể `resources/css/vju-kit.css`, `resources/css/modules/nav.css` và `docs/_prompt-responsive-ui.md`. Đây là tài liệu tham chiếu thiết kế, không phải chỉ thị sửa dự án VJU. Không thay đổi mã nguồn dự án tham chiếu.

| Quy ước trong VJU                                             | Quy chuẩn áp dụng ở Đêm Xoan                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Token `primary`, `ink`, `muted`, `line`, `surface` dùng chung | Giữ cấu trúc token ngữ nghĩa; đổi giá trị theo thương hiệu Đêm Xoan                        |
| Nền trung tính chiếm đa số, màu nhấn có kiểm soát             | Nền giấy sáng cho nội dung; xanh đêm cho không gian/điều hướng; đỏ gạch cho thao tác chính |
| App shell thống nhất, điều hướng có trạng thái đang chọn      | Một Sidebar, Topbar và Footer cho mọi trang; cùng đường dẫn và nhãn                        |
| Sửa thành phần dùng chung trước khi vá từng màn hình          | Dùng `Button`, `PageHeading`, `Notice`, `Modal`, `External` từ thư viện nội bộ             |
| Điểm ngắt 480/640/900/1024/1280 px                            | Dùng cùng hệ breakpoint; thêm kiểm tra 360 và 390 px                                       |
| Bảng cuộn trong vùng riêng, không cuộn ngang document         | Bọc `.table-scroll`, giữ tiêu đề và thứ tự cột; không ép bảng thành thẻ tùy tiện           |
| Khung mobile tránh lỗi `100vh`                                | Dùng `100dvh` cho drawer, modal và kính giấy                                               |

Không bê bảng màu đỏ VJU, logo hoặc bố cục nghiệp vụ học vụ sang sản phẩm di sản. Quy chuẩn chung nằm ở cách tổ chức thành phần và hành vi; mỗi sản phẩm có lớp thương hiệu riêng.

## 2. Token, chữ và bố cục

Nguồn sự thật: `src/styles/tokens.css`. Khi đổi thương hiệu, sửa token rồi kiểm tra các trang; không đặt màu rải rác trong JSX. Màu cảnh 3D, minh họa SVG và dữ liệu biểu đồ được phép có bảng màu riêng.

| Token                   | Giá trị              | Vai trò                                     |
| ----------------------- | -------------------- | ------------------------------------------- |
| `--primary`             | `#a24f37`            | Nút chính, liên kết, điểm nhấn cần thao tác |
| `--primary-hover`       | `#833d2a`            | Hover của hành động chính                   |
| `--night`               | `#142c35`            | Cảnh sân đình, điều hướng/chọn chế độ       |
| `--night-deep`          | `#10232c`            | Nền sidebar                                 |
| `--gold`                | `#d9b675`            | Ánh sáng và chi tiết trang trí trên nền tối |
| `--gold-dark`           | `#8a692e`            | Tiêu đề phụ/điểm nhấn trên nền sáng         |
| `--bg`, `--surface`     | `#f7f6f1`, `#fffefa` | Nền trang và thẻ                            |
| `--ink`, `--muted`      | `#263c40`, `#626a60` | Chữ chính và thông tin phụ                  |
| `--line`                | `#e3e3d8`            | Phân cách, viền thẻ                         |
| `--success`, `--danger` | `#42654f`, `#a03332` | Thành công và lỗi; luôn có chữ đi kèm       |

- Chữ nội dung: **Be Vietnam Pro**, tự host cả tập ký tự tiếng Việt và Latin, fallback Segoe UI/sans-serif.
- Chữ tiêu đề: **Lora**, tự host; nghiêng chỉ dùng cho câu nhấn ngắn.
- Body mặc định 14 px, tiêu đề trang 29–38 px theo viewport. Nội dung phụ 12–13 px; nhãn nhỏ dùng ngắn, không chứa hướng dẫn cần đọc dài.
- Giãn dòng 1.75 cho nội dung, 1.35 cho tiêu đề. Không viết cả đoạn bằng chữ hoa.
- Thang khoảng cách: 4/8/12/16/20/24/32/40/48 px; hạn chế thêm giá trị mới nếu thành phần đã có quy ước.
- Bo góc: 6 px cho nút, 12 px cho panel, 18 px cho bề mặt lớn. Không dùng đổ bóng mạnh cho mọi thẻ.
- Nội dung tự co, cột dùng `minmax(0, 1fr)`/`min-width: 0`. Không dùng `overflow-x: hidden` để che lỗi tràn ngang.
- Mobile 360 px phải dùng được; điểm 640 px xếp thẻ thành một cột. Sidebar chuyển drawer ở 900 px.

## 3. Thành phần và hành vi

| Thành phần         | Quy tắc                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Button             | Một thao tác chính nổi bật trong mỗi nhóm. Có primary/secondary/ghost/danger; vùng chạm chuẩn 44 px       |
| Icon               | Lucide thống nhất nét; nút chỉ có icon bắt buộc có tên truy cập. Không dùng emoji thay icon nghiệp vụ     |
| PageHeading        | Eyebrow ngắn, một H1, mô tả và hành động phụ; không tạo nhiều H1                                          |
| Notice             | Info/error/success có icon và chữ. Lỗi quyền dùng `role=alert`; thông tin kết quả dùng status/live region |
| Modal              | Dùng dialog native, khóa tương tác nền, Escape đóng, có nút đóng rõ; nội dung dài tự cuộn                 |
| Choice / Segmented | Hiển thị lựa chọn bằng viền, nền và `aria-pressed`; không dựa riêng vào màu                               |
| Table              | Có tiêu đề cột; vùng cuộn có tên và nhận focus. Export mang cùng ý nghĩa và nhãn như trên màn hình        |
| QR                 | Mã hóa URL thật của trang hiện tại, không dùng ảnh QR giả; có đường dẫn văn bản để sao chép               |
| Trạng thái chờ     | Nêu thao tác đang làm, khóa nút chống gửi trùng, khôi phục sau lỗi; không để spinner vô hạn               |
| Không có dữ liệu   | Nêu vì sao chưa có dữ liệu và cung cấp bước bắt đầu; không hiển thị số liệu giả làm kết quả cá nhân       |
| Thông báo lỗi      | Nêu việc chưa thực hiện được và cách thử lại; dữ liệu đã lưu không bị xóa khi lỗi mạng                    |

Hành động xóa tiến bộ cần xác nhận vì xóa cả local và dữ liệu của phiên hiện tại trên VPS. Đóng modal không được thực hiện xóa. Khi API chưa xác nhận xóa, không báo thành công và không xóa hàng đợi local.

## 4. Quy chuẩn riêng cho trải nghiệm học

- Các nhãn luôn thống nhất: **Nghe mẫu → Đến lượt bạn → Thử lại → Nghe bản thu → Xem tiến bộ**.
- Thực hiện cùng một bộ điều khiển cho 2D và kính giấy. Trạng thái: ready/sample/countdown/recording/analyzing/feedback.
- Bản thu chỉ trong bộ nhớ; rời bài hoặc chuyển nền phải dừng micro. Không tự phát âm thanh trước thao tác người dùng.
- Điểm không đủ tin cậy dùng dấu “—” và hướng dẫn thử lại. Không biến thiếu dữ liệu thành 0 điểm.
- So sánh lượt đầu/cuối chỉ khi cùng bài, quãng giọng, phiên bản bài và phiên bản thuật toán.
- Ba bài âm tổng hợp có nhãn **“Bài luyện minh họa — không phải câu Hát Xoan”**.
- Góc giáo viên ghi **“Dữ liệu minh họa”** trên trang, bảng và file xuất. Không trộn với dữ liệu thật.
- Nhân vật là minh họa, không đại diện nghệ nhân cụ thể. Không tuyên bố quan hệ hợp tác chưa có bằng chứng.
- Kính giấy chỉ bật khi có dữ liệu cảm biến và quyền micro. Nhìn vào nút 1,5 giây để chọn; hỗ trợ thoát/căn hướng. Không yêu cầu đi lại.
- Nội dung văn hóa không bị khóa bởi điểm. Chức năng luyện 2D phải tồn tại khi WebGL/cảm biến không hoạt động.
- Trạng thái lưu: **Trên máy / Chờ đồng bộ / Đã đồng bộ**; không thông báo “đã lưu online” trước phản hồi API.

## 5. Kiểm tra trước khi đưa màn hình mới vào release

1. Dùng token và thành phần hiện có; mọi ngoại lệ phải giải thích trong PR.
2. Kiểm tra 360/390/768/1024/1440 px: document không tràn ngang, không che chữ, bảng cuộn chủ động.
3. Kiểm tra bàn phím: thứ tự Tab, focus nhìn thấy, nút có tên, modal đóng được.
4. Kiểm tra nhãn tiếng Việt, dấu đầy đủ, nội dung thật/minh họa và nguồn học liệu.
5. Kiểm tra loading/empty/error/offline, quyền micro bị từ chối và thao tác lặp.
6. Kiểm tra reduced motion và zoom; màu không phải cách duy nhất để truyền đạt thông tin.
7. Chạy typecheck, unit/API tests và Playwright trước deploy. Kính và hiệu năng điện thoại phải có biên bản kiểm tra thiết bị thật; kiểm thử desktop không thay thế.

Ảnh tham chiếu bản triển khai nằm trong `docs/screenshots/`. Quy chuẩn này ưu tiên tính nhất quán và khả năng dùng được; không xác nhận rằng toàn bộ tiêu chí accessibility hay kính giấy đã được nghiệm thu trên thiết bị thật.
