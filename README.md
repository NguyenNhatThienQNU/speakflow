# SpeakFlow — Tiếng Anh giao tiếp từ Mất gốc đến C1

Web app học tiếng Anh giao tiếp cho người Việt, dựng theo biểu mẫu khởi tạo dự án.
Công nghệ: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Gemini API, Web Speech API.

## Chạy thử trên máy

Yêu cầu: Node.js 18.18 trở lên (khuyên dùng Node 20 hoặc 22).

```bash
npm install
npm run dev
```

Mở http://localhost:3000 bằng **Chrome hoặc Edge** (cần cho phần nhận diện giọng nói).

### Bật AI (Gemini)

Cách 1 — nhanh nhất, không cần sửa file: mở trang **Cài đặt AI** (`/settings`) trong app, dán khoá Gemini, bấm **Lưu & kiểm tra kết nối**. Khoá chỉ lưu trong trình duyệt của máy đó.

Cách 2 — khi đưa lên mạng cho học sinh dùng: đặt khoá ở phía máy chủ để học sinh không phải nhập và khoá không lộ ra trình duyệt.
```
# file .env.local (chạy trên máy) hoặc Environment Variables trên Vercel
GEMINI_API_KEY=khoá_của_bạn
GEMINI_MODEL=gemini-2.5-flash
```

Lấy khoá miễn phí tại https://aistudio.google.com/apikey. Chưa có khoá thì Gia sư AI chạy chế độ mô phỏng; các tính năng AI khác hiện nút dẫn tới trang Cài đặt.

### Các tính năng AI

| Tính năng | Ở đâu | API |
|---|---|---|
| Gia sư hội thoại: đóng vai, sửa lỗi, câu tự nhiên hơn, giải thích tiếng Việt, gợi ý trả lời | Gia sư AI, bước 4 mỗi bài học | `/api/chat` |
| Tự tạo tình huống hội thoại từ mô tả của người học | Gia sư AI → Tự tạo tình huống | `/api/ai/scenario` |
| AI nhận xét phát âm: chỉ từ sai, IPA, mẹo cho người Việt, câu luyện thêm | Mọi chỗ có thu âm (Nhại âm, Phòng phát âm, IPA, Test đầu vào) | `/api/ai/pronounce` |
| AI soạn trọn bài học 4 bước theo chủ đề + trình độ | Tạo bài bằng AI (`/create`) | `/api/ai/lesson` |
| Hỏi AI về một từ: nghĩa, cách dùng, sắc thái, ví dụ, collocation, từ hay nhầm | Bảng từ vựng trong bài, thẻ Ôn tập | `/api/ai/explain` |

Toàn bộ lời gọi Gemini đi qua `lib/gemini.ts` (ép trả JSON theo schema, báo lỗi tiếng Việt khi sai khoá/hết lượt). Với Gemini 2.5 Flash, chế độ "suy nghĩ" được tắt để hội thoại phản hồi nhanh.

## Triển khai lên Vercel

1. Đẩy thư mục này lên GitHub.
2. Vào https://vercel.com → New Project → chọn repo.
3. Mục Environment Variables: thêm `GEMINI_API_KEY` (và `GEMINI_MODEL` nếu muốn).
4. Deploy.

## Các phân hệ

| Trang | Chức năng |
|---|---|
| `/` Lộ trình | Chọn cấp độ Mất gốc → C1, bản đồ chặng mở khoá dần, streak, XP, thẻ cần ôn, thời gian nói hôm nay |
| `/placement` Test đầu vào | Nghe + Từ vựng ngữ cảnh (khó dần, sai 3 câu liên tiếp thì dừng) + Đọc to 5 câu → xếp lớp tự động |
| `/lesson/[id]` Bài học | 4 bước, 10–15 phút: Từ vựng cụm → Nghe hiểu → Nhại âm (Shadowing) → Hội thoại với AI |
| `/ipa` Bảng IPA | 44 âm, mô phỏng khẩu hình, mẹo cho người Việt, thu âm kiểm tra; tab Quy tắc ghép vần |
| `/tutor` Gia sư AI | 8 tình huống đóng vai, nói/gõ, Phụ đề Việt, Dịch nhanh, Gợi ý trả lời, khung Sửa lỗi & Gợi ý nói tự nhiên hơn |
| `/pronunciation` Phòng phát âm | Nghe mẫu, thu âm, tô màu từng từ xanh/đỏ, chấm %; cặp âm tối thiểu; tự nhập câu |
| `/review` Ôn tập SRS | Tự gom từ vựng sau mỗi bài và câu nói sai từ Gia sư AI; đánh giá Quên/Khó/Tốt/Dễ (SM-2 rút gọn) |
| `/create` Tạo bài bằng AI | Nhập chủ đề + trình độ → AI soạn bài học 4 bước, lưu lại để học |
| `/settings` Cài đặt AI | Nhập khoá Gemini, chọn mô hình, kiểm tra kết nối |
| `/progress` Tiến độ | Biểu đồ thời gian nói và XP 7 ngày, tiến độ theo cấp, 8 huy hiệu |

Giao diện tự chuyển ngôn ngữ: Mất gốc – A2 mặc định tiếng Việt, B1 – C1 mặc định tiếng Anh (có nút đổi tay).

## Cấu trúc mã

```
app/            các trang + app/api/chat/route.ts (gọi Gemini, trả JSON có sửa lỗi)
components/     Nav, Chat, Shadow (thu âm + chấm), Flashcard, ui
lib/data.ts     toàn bộ dữ liệu mẫu: cấp độ, 18 bài học, 44 âm IPA, 8 tình huống, câu hỏi test, huy hiệu
lib/store.ts    tiến độ người học (localStorage), thuật toán SRS, mở khoá bài, huy hiệu
lib/speech.ts   TTS/STT bằng Web Speech API + so khớp từng từ (LCS) để chấm phát âm
lib/mock-tutor.ts  gia sư mô phỏng khi chưa có khoá Gemini
lib/gemini.ts   lõi gọi Gemini phía server (dùng chung cho mọi API AI)
lib/ai-client.ts  lưu khoá/mô hình ở trình duyệt, gọi /api/ai/*
```

## Giới hạn hiện tại và hướng mở rộng

- Tiến độ lưu trên trình duyệt (localStorage). Muốn đồng bộ nhiều thiết bị: thay `load()`/`set()` trong `lib/store.ts` bằng Firebase Auth + Firestore.
- Chấm phát âm hiện ở mức từ (máy có nhận ra đúng từ hay không). Chấm đến từng âm tiết/âm vị cần Azure Speech Pronunciation Assessment.
- Dữ liệu mẫu: 3 bài/cấp (18 bài), 5 từ/bài. Mục tiêu 300 từ cốt lõi và 50 mẫu câu sinh tồn của Giai đoạn 0 cần bổ sung thêm vào `lib/data.ts` theo cùng cấu trúc.
- Web Speech API nhận diện giọng nói chạy tốt trên Chrome/Edge (máy tính, Android); Safari/iOS hỗ trợ hạn chế.
- Chưa dùng Shadcn/UI để giữ dự án gọn; có thể thêm bằng `npx shadcn@latest init` khi cần.
