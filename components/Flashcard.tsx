"use client";
import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { SpeakBtn } from "./ui";

export default function Flashcard({ front, back, ipa, ex, exVi, tag }: { front: string; back: string; ipa?: string; ex?: string; exVi?: string; tag?: string }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => setFlipped(false), [front]);
  return (
    <div className="flip mx-auto w-full max-w-md cursor-pointer select-none" onClick={() => setFlipped(!flipped)}>
      <div className={`flip-inner relative h-64 ${flipped ? "flipped" : ""}`}>
        {/* Mặt trước: tiếng Anh */}
        <div className="flip-face card absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          {tag && <span className="chip absolute left-4 top-4 bg-sky-50 text-sky-600">{tag}</span>}
          <p className="text-3xl font-extrabold">{front}</p>
          {ipa && <p className="font-mono text-lg text-sky-600">{ipa}</p>}
          <div className="mt-2 flex gap-2"><SpeakBtn text={front} /><SpeakBtn text={front} slow /></div>
          <p className="absolute bottom-4 flex items-center gap-1 text-xs text-slate-400"><RotateCw size={12} /> Chạm để lật thẻ</p>
        </div>
        {/* Mặt sau: tiếng Việt + ví dụ */}
        <div className="flip-face flip-back card absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-50 to-emerald-50 p-6 text-center">
          <p className="text-2xl font-bold text-emerald-700">{back}</p>
          {ex && (
            <div className="mt-2 rounded-xl bg-white/80 p-3 text-sm">
              <p className="flex items-center gap-2 font-medium">“{ex}” {/[a-z]/i.test(ex) && <SpeakBtn text={ex} className="!h-7 !w-7" />}</p>
              {exVi && <p className="mt-1 text-slate-500">{exVi}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
