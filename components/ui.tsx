"use client";
import { Mic, Square, Volume2, Turtle } from "lucide-react";
import { speak } from "@/lib/speech";

export function SpeakBtn({ text, slow = false, className = "", label }: { text: string; slow?: boolean; className?: string; label?: string }) {
  const Icon = slow ? Turtle : Volume2;
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); speak(text, { rate: slow ? 0.6 : 0.95 }); }}
      className={label ? `btn-outline ${className}` : `icon-btn ${className}`} title={slow ? "Nghe chậm" : "Nghe mẫu"} aria-label={slow ? "Nghe chậm" : "Nghe mẫu"}>
      <Icon size={17} />{label}
    </button>
  );
}

export function MicBtn({ listening, onStart, onStop, size = "md" }: { listening: boolean; onStart: () => void; onStop: () => void; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-16 w-16" : "h-11 w-11";
  return (
    <button type="button" onClick={listening ? onStop : onStart}
      className={`grid ${dim} place-items-center rounded-full text-white shadow-md transition ${listening ? "recording bg-rose-500" : "bg-gradient-to-br from-sky-500 to-emerald-500 hover:brightness-110"}`}
      aria-label={listening ? "Dừng thu âm" : "Bắt đầu thu âm"}>
      {listening ? <Square size={size === "lg" ? 24 : 18} fill="white" /> : <Mic size={size === "lg" ? 28 : 20} />}
    </button>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function UnsupportedNote() {
  return (
    <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
      Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy mở bằng <b>Google Chrome</b> hoặc <b>Microsoft Edge</b> trên máy tính/Android.
    </p>
  );
}
