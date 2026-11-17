"use client";
import { useEffect, useState } from "react";
import { compareSentence, useRecognizer, type WordResult } from "@/lib/speech";
import { actions } from "@/lib/store";
import { MicBtn, SpeakBtn, UnsupportedNote } from "./ui";
import { Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { aiPost, useAiReady } from "@/lib/ai-client";
import { speak } from "@/lib/speech";

interface PronFeedback {
  summaryVi: string;
  issues: { word: string; heard: string; ipa: string; tipVi: string }[];
  drill: { en: string; vi: string };
  encouragementVi: string;
}

/** Một câu luyện nhại âm: nghe mẫu → thu âm → tô màu từng từ đúng (xanh) / sai (đỏ) */
export default function Shadow({ en, vi, onScore, big = false }: { en: string; vi?: string; onScore?: (score: number) => void; big?: boolean }) {
  const rec = useRecognizer();
  const [result, setResult] = useState<{ words: WordResult[]; score: number } | null>(null);
  const [tries, setTries] = useState(0);
  const ai = useAiReady();
  const [fb, setFb] = useState<PronFeedback | null>(null);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbErr, setFbErr] = useState("");

  useEffect(() => { setResult(null); setTries(0); setFb(null); setFbErr(""); }, [en]);

  async function askAi() {
    if (!result) return;
    setFbLoading(true); setFbErr(""); setFb(null);
    try {
      setFb(await aiPost<PronFeedback>("/api/ai/pronounce", {
        target: en, spoken: rec.transcript, missed: result.words.filter((w) => !w.ok).map((w) => w.word),
      }));
    } catch (e) { setFbErr((e as Error).message); }
    finally { setFbLoading(false); }
  }

  useEffect(() => {
    if (!rec.transcript) return;
    const r = compareSentence(en, rec.transcript);
    setResult(r);
    setFb(null);
    setTries((t) => t + 1);
    actions.pronScore(r.score);
    if (r.score >= 80) actions.addXP(5);
    onScore?.(r.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.transcript]);

  const color = (s: number) => (s >= 85 ? "text-emerald-600 bg-emerald-50" : s >= 60 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50");

  return (
    <div className={`rounded-2xl bg-white p-4 ring-1 ring-slate-200 ${big ? "md:p-8" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className={`${big ? "text-2xl md:text-3xl" : "text-lg"} font-semibold leading-snug`}>
            {result
              ? result.words.map((w, i) => (
                  <span key={i} className={`${w.ok ? "text-emerald-600" : "text-rose-500 underline decoration-wavy decoration-rose-300"} mr-1.5`}>{w.word}</span>
                ))
              : en}
          </p>
          {vi && <p className="mt-1 text-sm text-slate-500">{vi}</p>}
        </div>
        {result && <span className={`chip ${color(result.score)} text-sm`}>{result.score}%</span>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SpeakBtn text={en} />
        <SpeakBtn text={en} slow />
        <MicBtn listening={rec.listening} onStart={rec.start} onStop={rec.stop} size={big ? "lg" : "md"} />
        <span className="text-xs text-slate-500">
          {rec.listening ? "🎙️ Đang nghe... đọc to câu trên" : tries ? `Bạn nói: “${rec.transcript}”` : "Nghe mẫu → bấm micro → đọc theo"}
        </span>
      </div>
      {result && (
        <div className="mt-3">
          {ai.ready ? (
            <button onClick={askAi} disabled={fbLoading} className="chip bg-violet-50 px-3 py-1.5 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100">
              {fbLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} AI nhận xét phát âm
            </button>
          ) : result.score < 100 ? (
            <p className="text-[11px] text-slate-400">💡 <Link href="/settings" className="underline">Thêm khoá Gemini</Link> để AI chỉ ra lỗi phát âm cụ thể.</p>
          ) : null}
          {fbErr && <p className="mt-2 text-xs text-rose-600">{fbErr}</p>}
          {fb && (
            <div className="mt-2 animate-pop space-y-2 rounded-xl bg-violet-50/60 p-3 text-sm ring-1 ring-violet-100">
              <p className="font-medium text-violet-900">{fb.summaryVi}</p>
              {fb.issues.map((x, i) => (
                <div key={i} className="rounded-lg bg-white p-2.5">
                  <p><b>{x.word}</b> <span className="font-mono text-sky-600">{x.ipa}</span>{x.heard && <span className="text-slate-400"> · máy nghe thành “{x.heard}”</span>}</p>
                  <p className="text-slate-600">{x.tipVi}</p>
                </div>
              ))}
              {fb.drill?.en && (
                <div className="flex items-center gap-2 rounded-lg bg-white p-2.5">
                  <button onClick={() => speak(fb.drill.en, { rate: 0.75 })} className="icon-btn !h-7 !w-7 shrink-0">🔊</button>
                  <p><span className="text-xs font-bold text-violet-600">Luyện thêm:</span> {fb.drill.en} <span className="text-slate-500">— {fb.drill.vi}</span></p>
                </div>
              )}
              <p className="text-xs text-emerald-700">{fb.encouragementVi}</p>
            </div>
          )}
        </div>
      )}
      {rec.error && <p className="mt-2 text-xs text-rose-500">{rec.error}</p>}
      {!rec.supported && <div className="mt-2"><UnsupportedNote /></div>}
    </div>
  );
}
