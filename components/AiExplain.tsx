"use client";
import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import Link from "next/link";
import { aiPost, useAiReady } from "@/lib/ai-client";
import { useApp } from "@/lib/store";
import { levelById } from "@/lib/data";
import { speak } from "@/lib/speech";

interface Explain {
  ipa: string; meaningVi: string; usageVi: string; register: string;
  examples: { en: string; vi: string }[]; collocations: string[]; confusedWith: string;
}

/** Nút “Hỏi AI”: giải thích sâu một từ/cụm từ (nghĩa, cách dùng, sắc thái, ví dụ, collocation) */
export default function AiExplain({ text, small = false }: { text: string; small?: boolean }) {
  const s = useApp();
  const ai = useAiReady();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Explain | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function go(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(true);
    if (data || !ai.ready) return;
    setLoading(true); setErr("");
    try { setData(await aiPost<Explain>("/api/ai/explain", { text, level: levelById(s.level).code })); }
    catch (er) { setErr((er as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <>
      <button onClick={go} className={`chip bg-violet-50 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100 ${small ? "!px-2 !py-0.5 text-[11px]" : ""}`} title="Hỏi AI về từ này">
        <Sparkles size={12} /> Hỏi AI
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
          <div className="card max-h-[85vh] w-full max-w-lg animate-pop overflow-y-auto p-5 text-left" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-violet-600"><Sparkles size={13} /> AI giải thích</p>
                <p className="text-2xl font-extrabold">{text}</p>
                {data && <p className="font-mono text-sky-600">{data.ipa} <span className="chip ml-1 bg-slate-100 font-sans text-slate-600">{data.register}</span></p>}
              </div>
              <button onClick={() => setOpen(false)} className="icon-btn"><X size={16} /></button>
            </div>
            {!ai.ready && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Cần khoá Gemini để dùng tính năng này. <Link href="/settings" className="font-semibold underline">Mở Cài đặt AI</Link></p>}
            {loading && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> AI đang soạn giải thích...</p>}
            {err && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{err}</p>}
            {data && (
              <div className="space-y-3 text-sm">
                <p className="text-base font-semibold text-emerald-700">{data.meaningVi}</p>
                <p className="text-slate-700">{data.usageVi}</p>
                <div className="space-y-1.5">
                  {data.examples.map((x, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl bg-slate-50 p-2.5">
                      <button onClick={() => speak(x.en)} className="icon-btn !h-7 !w-7 shrink-0">🔊</button>
                      <div><p className="font-medium">{x.en}</p><p className="text-slate-500">{x.vi}</p></div>
                    </div>
                  ))}
                </div>
                {data.collocations.length > 0 && (
                  <div><p className="mb-1 text-xs font-bold uppercase text-slate-400">Hay đi cùng</p>
                    <div className="flex flex-wrap gap-1.5">{data.collocations.map((c) => <button key={c} onClick={() => speak(c)} className="chip bg-sky-50 text-sky-700">{c}</button>)}</div>
                  </div>
                )}
                {data.confusedWith && <p className="rounded-xl bg-amber-50 p-3 text-amber-900">⚠️ {data.confusedWith}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
