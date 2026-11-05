# Bộ hình ảnh sân đình — v1.1

Tạo bằng **imagegen tích hợp**, không dùng CLI/API dự phòng. Bốn ảnh PNG gốc được lưu trong `assets/imagegen/v1.1/`; bản WebP chạy trong ứng dụng nằm ở `public/media/generated/`. Sharp chỉ thu nhỏ và nén WebP, giữ kênh alpha; không tách nền bằng thuật toán ngoài imagegen.

| Tệp              | Vai trò                 | Kích thước sử dụng | Dung lượng |
| ---------------- | ----------------------- | ------------------ | ---------- |
| hero.webp        | Trang chủ và khám phá   | 1200 × 800         | 225 KB     |
| environment.webp | Nền nhìn quanh Three.js | 1774 × 887         | 334 KB     |
| kep.webp         | Nhân vật kép minh họa   | 640 × 960, alpha   | 73 KB      |
| dao.webp         | Nhân vật đào minh họa   | 640 × 960, alpha   | 62 KB      |

Ảnh nền được ánh xạ equirectangular vào nền cảnh Three.js; nhân vật là các mặt phẳng có texture trong suốt đặt ở hai vị trí 3D. Camera, stereo, raycast và chọn bằng hướng nhìn vẫn chạy bằng Three.js. Đây là tranh minh họa có chiều sâu, chưa phải mô hình nhân vật dạng khối có hoạt ảnh hay phục dựng đình có thể đi vào bên trong. Ảnh sinh có thể sai chi tiết kiến trúc/trang phục; cần chuyên gia duyệt trước khi dùng như học liệu văn hóa.

## Bộ prompt thiết kế

Các đặc tả dưới đây ghi lại nội dung và ràng buộc của bộ prompt tạo ảnh; không phải bản ghi nguyên văn của công cụ.

**Hero — illustration-story / production website hero.** Cinematic painterly illustration for Vietnamese heritage PWA “Đêm Xoan Không Tắt”. Two fictional adult Vietnamese Xoan folk singers, a man and woman, singing call and response in a brick courtyard of a modest northern Vietnamese đình làng in Phú Thọ at blue hour. Weathered terracotta roof with gently upturned ends, aged dark timber, worn red brick, broadleaf trees, sparse warm lamps and moonlight. Man in simple dark indigo tunic and headcloth; woman in understated brown áo tứ thân, muted brick-red inner garment, dark skirt and simple headscarf. Small full-length figures in the lower central composition, respectful open hands. Painterly editorial brushwork, sophisticated depth, midnight teal, terracotta and warm gold, landscape 3:2. No identifiable artist, documentary claim, text, logos, watermark, royal/opera costume, modern stage or microphones; avoid Chinese/Japanese palace architecture.

**Environment — illustrated panorama / scene background.** Empty 360 × 180 degree equirectangular panorama, 2:1, eye height about 1.6 m, horizon at the middle. Same modest northern Vietnamese communal-house courtyard at night, main house central, trees to the left, gate to the right, lower hemisphere brick ground and upper hemisphere night sky. Match the hero's painterly teal/terracotta/gold style. Left and right edges should join. No people, signs, text, UI, watermark, Chinese/Japanese palaces or stage equipment. This is an imaginative illustration, not a documentary reconstruction.

**Kép — isolated character / transparent cutout.** One fictional adult Vietnamese male folk singing guide, full body, three-quarter pose facing right, one arm gently extended toward his counterpart. Simple dark indigo tunic, cream trousers and dark headcloth. Match the painterly illustration and warm side lighting of the courtyard. Real transparent background/alpha, no scenery, floor, cast shadow, checkerboard, inscriptions, text or watermark. No real artist likeness, royal clothing or opera costume.

**Đào — isolated character / transparent cutout.** One fictional adult Vietnamese female folk singing guide, full body, three-quarter pose facing left, hand extended toward her counterpart. Understated dark brown áo tứ thân with muted brick-red inner garment, dark skirt and simple dark headscarf. Match the male guide's painterly finish and warm courtyard lighting. Request real zero-alpha transparent background; no backdrop, floor, cast shadow, halo, glow, checkerboard, text or watermark. No real artist likeness, royal clothing or opera costume.

## Ghi nhận trong sản phẩm

Trang chủ, khám phá, sân đình và nguồn tư liệu ghi rõ minh họa AI và nhân vật hư cấu. Ảnh tư liệu Wikimedia vẫn được dẫn nguồn riêng; ảnh sinh không được gán tên tác giả của ảnh tư liệu. Âm tổng hợp và nhãn bài luyện minh họa giữ nguyên ý nghĩa.
