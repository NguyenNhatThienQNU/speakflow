"use client";
import { useState } from "react";
import { Shuffle, PenLine } from "lucide-react";
import { LESSONS, LEVELS, type LevelId } from "@/lib/data";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import Shadow from "@/components/Shadow";

const MINIMAL_PAIRS = [
  ["ship", "sheep"], ["sit", "seat"], ["think", "sink"], ["three", "tree"], ["they", "day"],
  ["light", "right"], ["fan", "van"], ["bed", "bad"], ["cat", "cut"], ["walk", "work"],
];

export default function PronunciationPage() {
  const s = useApp();
  const t = useT();
  const [level, setLevel] = useState<LevelId>(s.level);
  const pool = LESSONS.filter((l) => l.level === level).flatMap((l) => l.shadowing);
  const [i, setI] = useState(0);
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const item = useCustom && custom.trim() ? { en: custom.trim(), vi: t("Câu tự nhập", "Your own sentence") } : pool[i % pool.length];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">{t("Phòng luyện phát âm", "Pronunciation Lab")}</h1>
        <p className="text-sm text-slate-500">{t("Nghe giọng mẫu → thu âm → hệ thống tô màu từng từ: xanh = chuẩn, đỏ = cần luyện lại. Điểm cao nhất của bạn:", "Listen → record → each word is coloured green (correct) or red (practise again). Your best score:")} <b>{s.bestPron}%</b></p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button key={l.id} onClick={() => { setLevel(l.id); setI(0); setUseCustom(false); }}
            className={`chip px-3 py-1.5 text-sm ${level === l.id && !useCustom ? `bg-gradient-to-r ${l.color} text-white` : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{l.code}</button>
        ))}
        <button onClick={() => setUseCustom(true)} className={`chip px-3 py-1.5 text-sm ${useCustom ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}><PenLine size={14} /> {t("Tự nhập câu", "Custom")}</button>
      </div>

      {useCustom && (
        <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Nhập câu tiếng Anh bạn muốn luyện, ví dụ: I'd like to book a table for two."
          className="w-full rounded-xl bg-white p-3 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-sky-400" />
      )}

      {item && <Shadow en={item.en} vi={item.vi} big />}

      {!useCustom && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{t("Câu", "Sentence")} {(i % pool.length) + 1}/{pool.length}</span>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setI(Math.floor(Math.random() * pool.length))}><Shuffle size={16} /></button>
            <button className="btn-primary" onClick={() => setI(i + 1)}>{t("Câu tiếp", "Next")}</button>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-bold">{t("Cặp âm tối thiểu (Minimal pairs)", "Minimal pairs")}</h2>
        <p className="mb-3 text-sm text-slate-500">{t("Những cặp từ người Việt hay đọc nhầm. Nghe từng từ, sau đó thu âm để kiểm tra máy có phân biệt được không.", "Pairs Vietnamese learners often confuse. Listen, then record to check.")}</p>
        <div className="grid gap-3 xl:grid-cols-2">
          {MINIMAL_PAIRS.slice(0, 6).map(([a, b]) => (
            <div key={a} className="grid grid-cols-2 gap-2">
              <Shadow en={a} />
              <Shadow en={b} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
