"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Loader2, Trash2, Play, Check } from "lucide-react";
import { LEVELS, levelById, type LevelId, type Lesson, type Scenario } from "@/lib/data";
import { actions, useApp } from "@/lib/store";
import { aiPost, useAiReady } from "@/lib/ai-client";

const TOPICS: Record<string, string[]> = {
  "Đời sống": ["Đi siêu thị", "Thuê nhà, gặp chủ nhà", "Đi khám bệnh", "Gọi đồ ăn qua điện thoại"],
  "Du lịch": ["Làm thủ tục ở sân bay", "Đặt tour tham quan", "Lạc mất hành lý", "Hỏi đường đến biển Quy Nhơn"],
  "Công việc": ["Giới thiệu bản thân với đồng nghiệp mới", "Xin nghỉ phép", "Báo cáo tiến độ", "Nói chuyện với khách hàng nước ngoài"],
  "Trường học": ["Thuyết trình dự án KHKT", "Họp phụ huynh", "Hỏi giáo viên về bài tập", "Phỏng vấn học bổng"],
  "Chuyên sâu": ["Tranh biện về mạng xã hội", "Bàn về biến đổi khí hậu", "Đàm phán hợp đồng", "Small talk ở hội thảo"],
};

export default function CreatePage() {
  const s = useApp();
  const ai = useAiReady();
  const router = useRouter();
  const [level, setLevel] = useState<LevelId>(s.level);
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function generate() {
    if (!topic.trim()) return;
    setBusy(true); setErr("");
    try {
      const { lesson, scenario } = await aiPost<{ lesson: Lesson; scenario: Scenario }>("/api/ai/lesson", { level, topic });
      actions.addCustomLesson(lesson, scenario);
      router.push(`/lesson/${lesson.id}`);
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold"><Sparkles className="text-violet-500" /> Tạo bài học bằng AI</h1>
        <p className="text-sm text-slate-500">Nhập chủ đề bạn cần — AI soạn trọn một bài 4 bước (6 cụm từ, đoạn nghe, 3 câu nhại âm, tình huống hội thoại) đúng trình độ.</p>
      </div>

      {!ai.ready && (
        <div className="card flex flex-col items-start gap-2 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
          <p className="flex-1">Tính năng này cần khoá Gemini (miễn phí).</p>
          <Link href="/settings" className="btn-primary">Thêm khoá Gemini</Link>
        </div>
      )}

      <div className="card space-y-4 p-5">
        <div>
          <p className="mb-2 text-sm font-bold">1. Trình độ</p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button key={l.id} onClick={() => setLevel(l.id)}
                className={`chip px-3 py-1.5 text-sm ${level === l.id ? `bg-gradient-to-r ${l.color} text-white` : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
                {l.nameVi} · {l.code}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">2. Chủ đề</p>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="VD: Đi chợ hải sản ở Quy Nhơn, mặc cả giá cua"
            className="w-full rounded-xl bg-slate-100 p-3 outline-none focus:ring-2 focus:ring-violet-400" />
          <div className="mt-3 space-y-2">
            {Object.entries(TOPICS).map(([g, list]) => (
              <div key={g} className="flex flex-wrap items-center gap-1.5">
                <span className="w-20 text-xs font-bold text-slate-400">{g}</span>
                {list.map((x) => <button key={x} onClick={() => setTopic(x)} className={`chip ring-1 ${topic === x ? "bg-violet-600 text-white ring-violet-600" : "bg-white text-slate-600 ring-slate-200 hover:bg-violet-50"}`}>{x}</button>)}
              </div>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={!ai.ready || busy || !topic.trim()} className="btn w-full bg-violet-600 py-3 text-white hover:bg-violet-700">
          {busy ? <><Loader2 size={17} className="animate-spin" /> AI đang soạn bài (10–20 giây)...</> : <><Sparkles size={17} /> Soạn bài học {levelById(level).code}</>}
        </button>
        {err && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{err}</p>}
      </div>

      {s.customLessons.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-3 font-bold">Bài học AI đã soạn ({s.customLessons.length})</h2>
          <div className="space-y-2">
            {s.customLessons.map((l) => {
              const lv = levelById(l.level);
              const done = s.completed.includes(l.id);
              return (
                <div key={l.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="text-2xl">{l.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold">{l.titleVi}</p>
                    <p className="text-xs text-slate-500">{l.title} · {l.vocab.length} cụm từ</p>
                  </div>
                  <span className={`chip bg-gradient-to-r ${lv.color} text-white`}>{lv.code}</span>
                  {done && <Check size={16} className="text-emerald-500" />}
                  <Link href={`/lesson/${l.id}`} className="btn-primary !px-3 !py-2"><Play size={14} /></Link>
                  <button onClick={() => { if (confirm("Xoá bài học này?")) actions.removeCustomLesson(l.id); }} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
