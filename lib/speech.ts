"use client";
// Web Speech API: TTS (đọc mẫu) + STT (nhận diện giọng nói) — miễn phí, chạy tốt nhất trên Chrome/Edge.
import { useCallback, useEffect, useRef, useState } from "react";
import { actions } from "./store";

export function speak(text: string, opts: { rate?: number; lang?: string } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts.lang ?? "en-US";
  u.rate = opts.rate ?? 0.95;
  const voices = window.speechSynthesis.getVoices();
  const v =
    voices.find((v) => v.lang === u.lang && /Google|Microsoft|Samantha|Aria|Jenny/i.test(v.name)) ??
    voices.find((v) => v.lang === u.lang) ??
    voices.find((v) => v.lang.startsWith(u.lang.slice(0, 2)));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any;

export function useRecognizer(lang = "en-US") {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<AnyRec>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    const W = window as AnyRec;
    if (!(W.SpeechRecognition || W.webkitSpeechRecognition)) setSupported(false);
    return () => recRef.current?.abort?.();
  }, []);

  const start = useCallback(() => {
    const W = window as AnyRec;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    window.speechSynthesis?.cancel();
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    setTranscript(""); setInterim(""); setError(null);
    rec.onresult = (e: AnyRec) => {
      let fin = "", tmp = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript; else tmp += r[0].transcript;
      }
      if (fin) setTranscript(fin.trim());
      setInterim(tmp);
    };
    rec.onerror = (e: AnyRec) => {
      setError(e.error === "not-allowed" ? "Bạn chưa cho phép dùng micro." : e.error === "no-speech" ? "Không nghe thấy giọng nói, thử lại nhé." : String(e.error));
    };
    rec.onend = () => {
      setListening(false); setInterim("");
      actions.logSpeaking((Date.now() - startedAt.current) / 1000);
    };
    recRef.current = rec;
    startedAt.current = Date.now();
    setListening(true);
    rec.start();
  }, [lang]);

  const stop = useCallback(() => recRef.current?.stop?.(), []);
  const reset = useCallback(() => { setTranscript(""); setInterim(""); setError(null); }, []);

  return { supported, listening, transcript, interim, error, start, stop, reset };
}

// ---------------- So khớp câu đọc với câu mẫu ----------------
export const normalize = (s: string) =>
  s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();

export interface WordResult { word: string; ok: boolean }

/** Gióng hàng theo LCS: từ có trong câu nói → xanh, thiếu/sai → đỏ */
export function compareSentence(target: string, spoken: string): { words: WordResult[]; score: number } {
  const display = target.split(/\s+/);
  const t = display.map((w) => normalize(w));
  const s = normalize(spoken).split(" ").filter(Boolean);
  const n = t.length, m = s.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = t[i] === s[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ok = new Array(n).fill(false);
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (t[i] === s[j]) { ok[i] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const words = display.map((w, k) => ({ word: w, ok: ok[k] || t[k] === "" }));
  const valid = t.filter(Boolean).length || 1;
  const hits = ok.filter(Boolean).length;
  const extra = Math.max(0, m - hits);
  const score = Math.max(0, Math.round((hits / valid) * 100 - extra * 3));
  return { words, score: Math.min(100, score) };
}
