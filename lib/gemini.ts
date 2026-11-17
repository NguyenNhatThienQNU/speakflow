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
      // Tắt "suy nghĩ" ở các model Flash để phản hồi nhanh (hội thoại cần độ trễ thấp)
      ...(/flash/.test(opts.model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  };
  const r = await fetch(`${base}/v1beta/models/${opts.model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": opts.key },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    let msg = txt;
    try { msg = JSON.parse(txt)?.error?.message ?? txt; } catch { /* giữ nguyên */ }
    if (r.status === 400 && /API key/i.test(msg)) throw new AiError("Khoá Gemini không hợp lệ. Kiểm tra lại ở trang Cài đặt.", 401);
    if (r.status === 403) throw new AiError("Khoá Gemini bị từ chối (403). Kiểm tra khoá hoặc quyền của dự án Google AI Studio.", 403);
    if (r.status === 429) throw new AiError("Đã vượt giới hạn lượt gọi Gemini miễn phí. Đợi một lát rồi thử lại.", 429);
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

// Một vài mẩu schema dùng lại
export const S = {
  str: { type: "STRING" },
  bool: { type: "BOOLEAN" },
  int: { type: "INTEGER" },
  obj: (properties: Record<string, unknown>, required = Object.keys(properties)) => ({ type: "OBJECT", properties, required }),
  arr: (items: unknown) => ({ type: "ARRAY", items }),
};
