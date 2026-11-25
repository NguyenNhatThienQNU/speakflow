// Lõi gọi Gemini API (chạy phía server). Dùng chung cho mọi tính năng AI.
// Khoá lấy theo thứ tự: biến môi trường GEMINI_API_KEY → khoá người dùng nhập ở trang Cài đặt (header x-user-gemini-key).

export class AiError extends Error {
  constructor(message: string, public status = 500) { super(message); }
}

function clean(val: string | null | undefined): string | null {
  if (!val) return null;
  const c = val.replace(/[^\x20-\x7E]/g, "").trim();
  return c || null;
}

export function getKey(req: Request): string | null {
  return clean(process.env.GEMINI_API_KEY) || clean(req.headers.get("x-user-gemini-key"));
}

export function getModel(req: Request): string {
  return clean(req.headers.get("x-user-gemini-model")) || clean(process.env.GEMINI_MODEL) || "gemini-3.5-flash-lite";
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
export interface Content { role: "user" | "model"; parts: Part[] }

const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

async function callGenerate(base: string, model: string, key: string, body: Record<string, unknown>) {
  return fetch(`${base}/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
  });
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Gọi Gemini và nhận về JSON đúng schema */
export async function geminiJSON<T>(opts: {
  key: string;
  model: string;
  system: string;
  contents: Content[] | string;
  schema: Record<string, unknown>;
  temperature?: number;
}): Promise<T> {
  const base = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
  const contents: Content[] = typeof opts.contents === "string" ? [{ role: "user", parts: [{ text: opts.contents }] }] : opts.contents;
  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      responseMimeType: "application/json",
      responseSchema: opts.schema,
    },
  };

  const tryOrder = [...new Set([opts.model, ...FALLBACK_MODELS])];
  let r = await callGenerate(base, tryOrder[0], opts.key, body);
  // Nếu gặp 503 (quá tải tạm thời) hoặc 404 (model không khả dụng), thử model dự phòng rồi thử lại nhanh 1 lần
  if ((r.status === 503 || r.status === 404) && tryOrder.length > 1) {
    r = await callGenerate(base, tryOrder[1], opts.key, body);
  }
  if (r.status === 503) {
    await wait(600);
    r = await callGenerate(base, tryOrder[0], opts.key, body);
  }
  if (!r.ok) {
    const txt = await r.text();
    let msg = txt;
    try { msg = JSON.parse(txt)?.error?.message ?? txt; } catch { /* giữ nguyên */ }
    if (r.status === 400 && /API key/i.test(msg)) throw new AiError("Khoá Gemini không hợp lệ. Kiểm tra lại ở trang Cài đặt.", 401);
    if (r.status === 403) throw new AiError("Khoá Gemini bị từ chối (403). Kiểm tra khoá hoặc quyền của dự án Google AI Studio.", 403);
    if (r.status === 429) throw new AiError("Đã vượt giới hạn lượt gọi Gemini miễn phí. Đợi một lát rồi thử lại.", 429);
    if (r.status === 503) throw new AiError("Máy chủ Gemini đang bận tạm thời. Bạn bấm thử lại sau vài giây nhé.", 503);
    throw new AiError(`Gemini lỗi ${r.status}: ${msg.slice(0, 200)}`, r.status);
  }
  const data = await r.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) {
    const reason = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason || "không có nội dung";
    throw new AiError(`Gemini không trả lời (${reason}).`, 502);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // Đôi khi model bọc JSON trong ```json ... ```
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
    throw new AiError("Gemini trả về dữ liệu không đúng định dạng JSON.", 502);
  }
}

const ALLOWED_AUDIO_MIMES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/aac",
  "audio/flac",
]);

/** Kiểm tra và chuẩn hoá dữ liệu âm thanh base64 gửi lên */
export function normalizeAudioInput(audioBase64?: string, mimeType?: string): { data: string; mimeType: string } {
  const data = (audioBase64 ?? "").trim();
  if (!data) throw new AiError("Không nhận được dữ liệu âm thanh.", 400);
  if (data.length > 4_000_000) throw new AiError("Đoạn thu âm quá dài (tối đa ~3MB). Hãy đọc ngắn hơn nhé.", 413);
  const cleanMime = (mimeType ?? "audio/webm").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_AUDIO_MIMES.has(cleanMime)) throw new AiError(`Định dạng âm thanh không hỗ trợ (${cleanMime}).`, 400);
  return { data, mimeType: cleanMime };
}

// Một vài mẩu schema dùng lại
export const S = {
  str: { type: "STRING" },
  bool: { type: "BOOLEAN" },
  int: { type: "INTEGER" },
  obj: (properties: Record<string, unknown>, required = Object.keys(properties)) => ({ type: "OBJECT", properties, required }),
  arr: (items: unknown) => ({ type: "ARRAY", items }),
};
