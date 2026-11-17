"use client";
import { useState } from "react";
import { IPA, IPA_GROUPS, type IpaSound } from "@/lib/data";
import { actions, useApp } from "@/lib/store";
import { speak } from "@/lib/speech";
import Shadow from "@/components/Shadow";
import { SpeakBtn } from "@/components/ui";

const RULES = [
  { title: "Đuôi -ed", items: [
    { rule: "/ɪd/ sau âm /t/, /d/", ex: "wanted, needed" },
    { rule: "/t/ sau âm vô thanh /p k f s ʃ tʃ θ/", ex: "stopped, looked, washed" },
    { rule: "/d/ sau các âm còn lại", ex: "played, lived, cleaned" },
  ] },
  { title: "Đuôi -s / -es", items: [
    { rule: "/ɪz/ sau /s z ʃ ʒ tʃ dʒ/", ex: "buses, watches, oranges" },
    { rule: "/s/ sau âm vô thanh /p t k f θ/", ex: "cats, books, maps" },
    { rule: "/z/ sau các âm còn lại", ex: "dogs, pens, plays" },
  ] },
  { title: "Chữ “e” câm (Magic E)", items: [
    { rule: "Nguyên âm + phụ âm + e → nguyên âm đọc như tên chữ cái", ex: "hat → hate, kit → kite, hop → hope, cut → cute" },
  ] },
  { title: "Âm câm thường gặp", items: [
    { rule: "k câm trước n", ex: "know, knife, knee" },
    { rule: "w câm trước r", ex: "write, wrong, wrist" },
    { rule: "b câm sau m", ex: "climb, comb, thumb" },
    { rule: "gh câm", ex: "night, light, daughter" },
  ] },
  { title: "Trọng âm cơ bản", items: [
    { rule: "Danh từ/tính từ 2 âm tiết: thường nhấn âm 1", ex: "ˈteacher, ˈhappy, ˈtable" },
    { rule: "Động từ 2 âm tiết: thường nhấn âm 2", ex: "beˈgin, reˈpeat, deˈcide" },
    { rule: "Đuôi -tion, -sion, -ic: nhấn âm ngay trước", ex: "inforˈmation, deˈcision, ecoˈnomic" },
  ] },
];

const TYPE_COLOR: Record<string, string> = {
  short: "bg-sky-50 text-sky-700 ring-sky-200",
  long: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  diphthong: "bg-teal-50 text-teal-700 ring-teal-200",
  voiceless: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  voiced: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

export default function IpaPage() {
  const s = useApp();
  const [sel, setSel] = useState<IpaSound>(IPA[0]);
  const [tab, setTab] = useState<"chart" | "rules">("chart");

  function pick(x: IpaSound) {
    setSel(x);
    speak(x.word, { rate: 0.7 });
    actions.practiceIpa(x.symbol);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Bảng phiên âm IPA — 44 âm</h1>
          <p className="text-sm text-slate-500">Bấm vào từng âm để xem khẩu hình, nghe từ ví dụ và thu âm luyện tập. Đã luyện: <b>{s.ipaPracticed.length}/44</b></p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
          <button onClick={() => setTab("chart")} className={`rounded-lg px-3 py-1.5 ${tab === "chart" ? "bg-white shadow" : "text-slate-500"}`}>Bảng âm</button>
          <button onClick={() => setTab("rules")} className={`rounded-lg px-3 py-1.5 ${tab === "rules" ? "bg-white shadow" : "text-slate-500"}`}>Quy tắc ghép vần</button>
        </div>
      </div>

      {tab === "chart" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {IPA_GROUPS.map((g) => (
              <div key={g.type} className="card p-4">
                <p className="mb-2 text-sm font-bold text-slate-600">{g.vi} <span className="font-normal text-slate-400">· {g.en}</span></p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {IPA.filter((x) => x.type === g.type).map((x) => (
                    <button key={x.symbol} onClick={() => pick(x)}
                      className={`relative flex flex-col items-center rounded-xl p-2 ring-1 transition hover:-translate-y-0.5 ${TYPE_COLOR[x.type]} ${sel.symbol === x.symbol ? "ring-2 ring-sky-500" : ""}`}>
                      <span className="font-mono text-xl font-bold">/{x.symbol}/</span>
                      <span className="text-[11px] opacity-80">{x.word}</span>
                      {s.ipaPracticed.includes(x.symbol) && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-5xl font-extrabold text-sky-600">/{sel.symbol}/</span>
                <SpeakBtn text={sel.word} slow />
              </div>
              <Mouth sound={sel} />
              <dl className="mt-3 space-y-2 text-sm">
                <div><dt className="text-xs font-bold uppercase text-slate-400">Từ ví dụ</dt><dd><b>{sel.word}</b> <span className="font-mono text-sky-600">{sel.wordIpa}</span></dd></div>
                <div><dt className="text-xs font-bold uppercase text-slate-400">Vị trí lưỡi / môi</dt><dd>{sel.mouth.tongue}</dd></div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-900"><dt className="text-xs font-bold uppercase">Mẹo cho người Việt</dt><dd>{sel.tipVi}</dd></div>
              </dl>
            </div>
            <Shadow en={sel.word} vi={`Đọc to từ “${sel.word}” để kiểm tra âm /${sel.symbol}/`} />
          </aside>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {RULES.map((r) => (
            <div key={r.title} className="card p-5">
              <h2 className="mb-3 font-bold">{r.title}</h2>
              <ul className="space-y-2">
                {r.items.map((it, i) => (
                  <li key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                    <p>{it.rule}</p>
                    <p className="mt-1 flex flex-wrap gap-1.5">
                      {it.ex.split(/,\s*/).map((w) => (
                        <button key={w} onClick={() => speak(w.replace(/[ˈ→]/g, " ").split(" ").pop() ?? w, { rate: 0.75 })} className="chip bg-white text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50">🔊 {w}</button>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Mô phỏng khẩu hình đơn giản: độ mở hàm + hình dạng môi */
function Mouth({ sound }: { sound: IpaSound }) {
  const { lips, jaw } = sound.mouth;
  const w = lips === "round" ? 46 : lips === "spread" ? 110 : lips === "open" ? 90 : 80;
  const h = 8 + jaw * 16 + (lips === "round" ? 10 : 0);
  const label = { round: "Môi tròn, chu ra", spread: "Môi bành sang hai bên", open: "Mở miệng rộng", neutral: "Môi thả lỏng" }[lips];
  return (
    <div className="mt-3 rounded-2xl bg-gradient-to-b from-orange-50 to-rose-50 p-4">
      <svg viewBox="0 0 200 120" className="mx-auto h-32 w-full">
        <ellipse cx="100" cy="60" rx={w / 2 + 14} ry={h / 2 + 12} fill="#f9a8a8" className="transition-all duration-300" />
        <ellipse cx="100" cy="60" rx={w / 2} ry={Math.max(3, h / 2)} fill="#7f1d1d" className="transition-all duration-300" />
        {jaw > 0 && <rect x={100 - w / 2 + 6} y={60 - h / 2} width={Math.max(0, w - 12)} height={Math.min(8, h / 3)} rx="2" fill="#fff" className="transition-all duration-300" />}
        {jaw > 1 && <ellipse cx="100" cy={60 + h / 2 - 4} rx={w / 3} ry={Math.max(2, h / 5)} fill="#f87171" className="transition-all duration-300" />}
        {/\bgiữa hai hàm răng|giữa răng/.test(sound.mouth.tongue + sound.tipVi) && <ellipse cx="100" cy="62" rx="14" ry="6" fill="#ef4444" />}
      </svg>
      <p className="text-center text-xs font-semibold text-rose-700">{label} · Độ mở hàm {"●".repeat(jaw + 1)}{"○".repeat(3 - jaw)}</p>
    </div>
  );
}
