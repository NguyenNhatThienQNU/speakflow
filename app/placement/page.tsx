"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Headphones, BookOpen, Mic, ArrowRight, Volume2, Check, X } from "lucide-react";
import { LEVELS, PLACEMENT_QUESTIONS, PLACEMENT_READ, levelById, type LevelId } from "@/lib/data";
import { actions } from "@/lib/store";
import { speak } from "@/lib/speech";
import Shadow from "@/components/Shadow";
import { ProgressBar } from "@/components/ui";

type Phase = "intro" | "quiz" | "read" | "result";

// Câu hỏi sắp theo độ khó tăng dần; sai 3 câu liên tiếp → dừng phần trắc nghiệm (thích ứng)
const QUESTIONS = [...PLACEMENT_QUESTIONS].sort(
  (a, b) => LEVELS.findIndex((l) => l.id === a.level) - LEVELS.findIndex((l) => l.id === b.level),
);

export default function PlacementPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [ri, setRi] = useState(0);
  const [readScores, setReadScores] = useState<Record<number, number>>({});

  const q = QUESTIONS[qi];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === q.answer;
    setAnswers((a) => ({ ...a, [qi]: ok }));
    setWrongStreak((w) => (ok ? 0 : w + 1));
  }

  function nextQ() {
    setPicked(null);
    if (qi + 1 >= QUESTIONS.length || wrongStreak >= 3) setPhase("read");
    else setQi(qi + 1);
  }

  const result: LevelId = useMemo(() => {
    for (const lv of LEVELS) {
      const idx = QUESTIONS.map((x, i) => (x.level === lv.id ? i : -1)).filter((i) => i >= 0);
      const correct = idx.filter((i) => answers[i]).length;
      const quizOk = idx.length === 0 || correct / idx.length >= 0.5;
      const ri2 = PLACEMENT_READ.findIndex((r) => r.level === lv.id);
      const readOk = ri2 < 0 || (readScores[ri2] ?? 0) >= 60;
      if (!(quizOk && readOk)) return lv.id;
    }
    return "c1";
  }, [answers, readScores]);

  const totalQ = Object.keys(answers).length;
  const correctQ = Object.values(answers).filter(Boolean).length;

  if (phase === "intro")
    return (
      <div className="card mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-extrabold">Test đầu vào xếp lớp</h1>
        <p className="mt-1 text-slate-500">Khoảng 5 phút. Câu hỏi khó dần — nếu bạn sai liên tiếp, bài test sẽ tự dừng để không làm mất thời gian.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[[Headphones, "Nghe", "5 câu nghe hiểu"], [BookOpen, "Từ vựng ngữ cảnh", "7 câu điền từ"], [Mic, "Đọc to", "5 câu mẫu"]].map(([Icon, a, b]) => {
            const I = Icon as typeof Headphones;
            return (
              <div key={a as string} className="rounded-2xl bg-slate-50 p-4">
                <I className="text-sky-500" /><p className="mt-2 font-bold">{a as string}</p><p className="text-sm text-slate-500">{b as string}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-slate-500">💡 Phần đọc to cần micro và trình duyệt Chrome/Edge. Mới bắt đầu hoàn toàn? Bạn có thể <button className="text-sky-600 underline" onClick={() => { actions.setLevel("pre"); location.href = "/"; }}>bỏ qua và học từ Mất gốc</button>.</p>
        <button onClick={() => setPhase("quiz")} className="btn-primary mt-6 w-full">Bắt đầu <ArrowRight size={16} /></button>
      </div>
    );

  if (phase === "quiz")
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-3"><ProgressBar value={(qi / QUESTIONS.length) * 100} /><span className="text-xs font-bold">{qi + 1}/{QUESTIONS.length}</span></div>
        <div className="card p-6">
          <span className="chip bg-sky-50 text-sky-600">{q.kind === "listen" ? "🎧 Nghe" : "📖 Từ vựng ngữ cảnh"}</span>
          {q.kind === "listen" && (
            <div className="my-4 flex gap-2">
              <button onClick={() => speak(q.audio!, { rate: 0.9 })} className="btn-primary"><Volume2 size={16} /> Nghe</button>
              <button onClick={() => speak(q.audio!, { rate: 0.65 })} className="btn-outline">🐢 Nghe chậm</button>
            </div>
          )}
          <p className="mt-3 text-lg font-semibold">{q.prompt}</p>
          <div className="mt-4 grid gap-2">
            {q.options.map((o, i) => {
              const st = picked === null ? "hover:bg-sky-50" : i === q.answer ? "bg-emerald-50 ring-emerald-400" : picked === i ? "bg-rose-50 ring-rose-400" : "opacity-50";
              return (
                <button key={i} onClick={() => choose(i)} className={`flex items-center justify-between rounded-xl p-3 text-left ring-1 ring-slate-200 ${st}`}>
                  {o}{picked !== null && i === q.answer && <Check size={16} className="text-emerald-600" />}{picked === i && i !== q.answer && <X size={16} className="text-rose-500" />}
                </button>
              );
            })}
          </div>
          {picked !== null && q.kind === "listen" && <p className="mt-3 text-sm text-slate-500">Lời thoại: “{q.audio}”</p>}
        </div>
        <button disabled={picked === null} onClick={nextQ} className="btn-primary w-full">Tiếp <ArrowRight size={16} /></button>
      </div>
    );

  if (phase === "read")
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="card p-5">
          <h2 className="text-lg font-bold">Phần 3: Đọc to {ri + 1}/{PLACEMENT_READ.length}</h2>
          <p className="text-sm text-slate-500">Bấm micro và đọc to câu dưới đây. Có thể thử lại nhiều lần — hệ thống lấy điểm cao nhất.</p>
        </div>
        <Shadow key={ri} en={PLACEMENT_READ[ri].en} big onScore={(sc) => setReadScores((m) => ({ ...m, [ri]: Math.max(m[ri] ?? 0, sc) }))} />
        <div className="flex gap-2">
          <button className="btn-ghost flex-1" onClick={() => (ri + 1 < PLACEMENT_READ.length ? setRi(ri + 1) : setPhase("result"))}>Bỏ qua câu này</button>
          <button className="btn-primary flex-1" disabled={readScores[ri] === undefined} onClick={() => (ri + 1 < PLACEMENT_READ.length ? setRi(ri + 1) : setPhase("result"))}>Tiếp <ArrowRight size={16} /></button>
        </div>
      </div>
    );

  const lv = levelById(result);
  const avgRead = Object.values(readScores).length ? Math.round(Object.values(readScores).reduce((a, b) => a + b, 0) / Object.values(readScores).length) : 0;
  return (
    <div className="card mx-auto max-w-lg animate-pop p-8 text-center">
      <p className="text-sm text-slate-500">Kết quả xếp lớp</p>
      <div className={`mx-auto mt-3 grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br ${lv.color} text-3xl font-black text-white shadow-lg`}>{lv.code}</div>
      <h1 className="mt-3 text-2xl font-extrabold">{lv.nameVi} · {lv.nameEn}</h1>
      <p className="mt-1 text-sm text-slate-600">{lv.descVi}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-sky-50 p-3"><p className="text-xl font-extrabold text-sky-600">{correctQ}/{totalQ}</p>Nghe + Từ vựng</div>
        <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xl font-extrabold text-emerald-600">{avgRead}%</p>Đọc to</div>
      </div>
      <Link href="/" onClick={() => { actions.setLevel(result); actions.addXP(20); }} className="btn-primary mt-6 w-full">Bắt đầu lộ trình {lv.code} <ArrowRight size={16} /></Link>
    </div>
  );
}
