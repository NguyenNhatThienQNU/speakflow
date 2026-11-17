"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { aiPost, saveAiSettings, useAiReady, useAiSettings } from "@/lib/ai-client";

const MODELS = [
  { id: "gemini-3.5-flash-lite", vi: "Gemini 3.5 Flash-Lite — siêu nhanh, ổn định (khuyên dùng)" },
  { id: "gemini-3.1-flash-lite", vi: "Gemini 3.1 Flash-Lite — tốc độ cao, phản hồi tức thì" },
  { id: "gemini-3.8-flash", vi: "Gemini 3.8 Flash — thông minh hơn" },
];

export default function SettingsPage() {
  const s = useAiSettings();
  const { serverKey } = useAiReady();
  const [key, setKey] = useState(s.key);
  const [model, setModel] = useState(s.model);
  const [show, setShow] = useState(false);
  const [test, setTest] = useState<{ state: "idle" | "loading" | "ok" | "err"; msg?: string }>({ state: "idle" });

  useEffect(() => { setKey(s.key); setModel(s.model); }, [s.key, s.model]);

  async function saveAndTest() {
    saveAiSettings({ key: key.trim(), model });
    setTest({ state: "loading" });
    try {
      const r = await aiPost<{ greeting: string; vi: string; ms: number }>("/api/ai/ping", {});
      setTest({ state: "ok", msg: `“${r.greeting}” — ${r.vi} (${(r.ms / 1000).toFixed(1)} giây)` });
    } catch (e) {
      setTest({ state: "err", msg: (e as Error).message });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Cài đặt AI (Gemini)</h1>
        <p className="text-sm text-slate-500">Khoá Gemini bật toàn bộ tính năng AI: Gia sư hội thoại, AI nhận xét phát âm, AI soạn bài học theo chủ đề và AI giải thích từ vựng.</p>
      </div>

      {serverKey && (
        <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          ✅ Máy chủ đã có sẵn khoá Gemini (biến môi trường <code>GEMINI_API_KEY</code>). Bạn không cần nhập thêm — ô dưới đây chỉ dùng khi muốn dùng khoá riêng.
        </p>
      )}

      <div className="card space-y-4 p-5">
        <label className="block">
          <span className="text-sm font-bold">Khoá Gemini API</span>
          <div className="mt-1 flex gap-2">
            <div className="relative flex-1">
              <KeyRound size={16} className="absolute left-3 top-3 text-slate-400" />
              <input type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="AIza..."
                className="w-full rounded-xl bg-slate-100 py-2.5 pl-9 pr-3 font-mono text-sm outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
            <button onClick={() => setShow(!show)} className="icon-btn !h-11 !w-11" aria-label="Hiện/ẩn khoá">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-bold">Mô hình</span>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-100 p-2.5 text-sm">
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.vi}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button onClick={saveAndTest} disabled={test.state === "loading"} className="btn-primary">
            {test.state === "loading" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Lưu & kiểm tra kết nối
          </button>
          {s.key && <button onClick={() => { saveAiSettings({ key: "", model }); setKey(""); setTest({ state: "idle" }); }} className="btn-ghost">Xoá khoá</button>}
        </div>
        {test.state === "ok" && <p className="flex gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 size={18} className="shrink-0" /> Kết nối thành công! {test.msg}</p>}
        {test.state === "err" && <p className="flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><XCircle size={18} className="shrink-0" /> {test.msg}</p>}
      </div>

      <div className="card p-5 text-sm">
        <h2 className="mb-2 font-bold">Cách lấy khoá miễn phí (2 phút)</h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-slate-700">
          <li>Mở <a className="inline-flex items-center gap-1 text-sky-600 underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey <ExternalLink size={12} /></a> và đăng nhập tài khoản Google.</li>
          <li>Bấm <b>Create API key</b>, chọn một dự án (hoặc tạo mới).</li>
          <li>Sao chép khoá (bắt đầu bằng <code>AIza</code>), dán vào ô trên rồi bấm <b>Lưu & kiểm tra kết nối</b>.</li>
        </ol>
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          Khoá nhập ở đây chỉ lưu trong trình duyệt của máy này và được gửi kèm mỗi lần gọi AI. Khi đưa web lên mạng cho nhiều học sinh dùng, nên đặt khoá ở biến môi trường <code>GEMINI_API_KEY</code> trên Vercel (học sinh không cần nhập, khoá không lộ ra trình duyệt).
        </p>
      </div>
    </div>
  );
}
