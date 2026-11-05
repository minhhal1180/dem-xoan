# Triển khai và vận hành

## Kiến trúc đã chọn

Frontend: `https://minhhal1180.github.io/dem-xoan/`.
API: `https://sv28.bcse-vju.com/v1/`, qua reverse proxy HTTPS của VPS đến Nginx cổng 80, rồi proxy loopback `127.0.0.1:8107`.
API dùng Python stdlib + SQLite, do systemd quản lý. Không có Supabase hoặc API key quyền cao trong frontend.

Không đưa mật khẩu SSH, gateway slot, private key hoặc token ẩn danh vào Git. Dùng phiên SSH được cấp riêng; thông tin đăng nhập hai lớp không được lưu trong repository.

## Frontend GitHub Pages

1. Repository `minhhal1180/dem-xoan`; Settings → Pages → Source: GitHub Actions.
2. Repository variable `VITE_API_URL`: `https://sv28.bcse-vju.com` (không có `/v1` cuối).
3. Push `main` hoặc chạy workflow thủ công. CI kiểm tra TypeScript, unit/API tests, build và browser tests trước deploy.
4. `VITE_BASE_PATH` mặc định `/dem-xoan/`. Nếu đổi tên repository, đổi base trong workflow/config và URL chia sẻ.
5. Không chỉnh `dist` bằng tay; đây là đầu ra build.

## Backend VPS

Checkout tại `/home/student/projects/dem-xoan`. Tạo `/home/student/projects/dem-xoan/backend/api.env` trên VPS, quyền 600:

```ini
PORT=8107
DATABASE_PATH=/home/student/.local/share/dem-xoan/progress.sqlite3
ALLOWED_ORIGINS=https://minhhal1180.github.io,http://127.0.0.1:4173,http://localhost:4173,http://127.0.0.1:5173,http://localhost:5173
```

```bash
mkdir -p /home/student/.local/share/dem-xoan
chmod 700 /home/student/.local/share/dem-xoan
sudo install -m 644 backend/dem-xoan-api.service /etc/systemd/system/dem-xoan-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now dem-xoan-api
curl --fail http://127.0.0.1:8107/v1/health
```

Thêm location trong `backend/nginx-api.conf` vào server đang phục vụ VPS. Giữ các location/trang hiện có. Luôn sao lưu cấu hình trước khi thay đổi, chạy `sudo nginx -t` thành công rồi mới reload.

Nếu reverse proxy phía trước đặt Host nội bộ, cần đưa location vào đúng server block đang nhận request; không tạo virtual host rồi giả định mọi request đều tới nó. Xác minh bằng URL HTTPS thực tế.

```bash
sudo nginx -t
sudo systemctl reload nginx
curl --fail https://sv28.bcse-vju.com/v1/health
```

Database tự tạo schema khi khởi động. Tables: identities (hash token), learning_sessions (owner), attempts (owner + session). Mọi API dữ liệu yêu cầu bearer token, lấy owner từ token thay vì từ body.

## Hợp đồng API

| Method / endpoint            | Chức năng                                                        |
| ---------------------------- | ---------------------------------------------------------------- |
| `GET /v1/health`             | Kiểm tra dịch vụ, không có dữ liệu riêng                         |
| `POST /v1/identity` với `{}` | Tạo ID và bearer token ẩn danh; token chỉ trả trong phản hồi này |
| `PUT /v1/sessions/{uuid}`    | Upsert buổi luyện của chủ token                                  |
| `PUT /v1/attempts/{uuid}`    | Upsert kết quả, bắt buộc session cùng chủ                        |
| `GET /v1/progress`           | Lấy sessions/attempts của chủ token                              |
| `DELETE /v1/progress`        | Xóa sessions/attempts của chủ token, giữ identity                |

CORS dùng origin chính xác, không `*`. CORS không thay thế xác thực. Body tối đa 16 KiB; kiểm tra UUID, bài, phiên bản, timestamp và phạm vi số đo. Kết quả thiếu dữ liệu có điểm `null`. API chỉ giữ các trường đã cho phép, bỏ mọi trường âm thanh. Upsert cùng UUID không tạo bản ghi trùng. Trả 401 cho token không hợp lệ, 403 khi truy cập session/UUID của người khác, 400 khi dữ liệu sai, 429 khi quá giới hạn.

Giới hạn request là bảo vệ cơ bản cho demo, không phải hệ chống abuse quy mô lớn. Trước triển khai trường học rộng cần bổ sung chính sách lưu dữ liệu, giám sát, xác thực phù hợp và kiểm tra tải.

## Cập nhật, sao lưu, rollback

- Trước cập nhật: kiểm tra `git status` VPS; không ghi đè thay đổi ngoài nhiệm vụ. Lưu bản sao SQLite bằng API backup của SQLite hoặc CLI `.backup`, không chỉ copy file đang có WAL.
- Deploy: fetch release đã kiểm tra → checkout → chạy API tests → restart `dem-xoan-api` → health check local và HTTPS.
- Rollback: checkout release trước, restart API; frontend chạy lại workflow tại ref/release trước. Giữ migration bổ sung tương thích; không tự xóa database.
- Chỉ bật bản PWA mới sau khi người dùng chọn cập nhật ngoài lượt luyện. Bản offline cũ có thể tiếp tục tồn tại cho đến lần mở có mạng tiếp theo.

```bash
sudo systemctl status dem-xoan-api --no-pager
sudo journalctl -u dem-xoan-api --since '1 hour ago' --no-pager
```

API không ghi request body hoặc token vào log. Không bật access log chứa Authorization. Theo dõi dung lượng database, lỗi 5xx, thời gian đáp ứng, dung lượng đĩa và trạng thái service. HTTP health check không xác nhận chất lượng chấm hát hoặc hỗ trợ kính.
