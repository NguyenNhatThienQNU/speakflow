"use client";
import { useEffect, useRef, useState } from "react";
import { compareSentence, prepareGeminiAudio, speak, useAudioRecorder, useRecognizer, type WordResult } from "@/lib/speech";
import { actions } from "@/lib/store";
import { AudioLevelBar, MicBtn, SpeakBtn, UnsupportedNote } from "./ui";
import { Sparkles, Loader2, Headphones } from "lucide-react";
import Link from "next/link";
import { aiPost, useAiReady } from "@/lib/ai-client";

interface PronFeedback {
  summaryVi: string;
  issues: { word: string; heard: string; ipa: string; tipVi: string }[];
  drill: { en: string; vi: string };
  encouragementVi: string;
}

interface AssessAudioResponse extends PronFeedback {
  heard: string;
  noSpeech: boolean;
}

/** Một câu luyện nhại âm: nghe mẫu → thu âm (AI nghe trực tiếp hoặc trình duyệt) → tô màu đúng/sai + nhận xét */
export default function Shadow({ en, vi, onScore, big = false }: { en: string; vi?: string; onScore?: (score: number) => void; big?: boolean }) {
  const ai = useAiReady();
  const audioRec = useAudioRecorder({ autoStopMs: 1400, maxWaitNoSpeechMs: 6000, maxDurationMs: 18000 });
  const browserRec = useRecognizer("en-US");

  const [pickedMode, setPickedMode] = useState<"ai" | "browser" | null>(null);
  const canUseAiAudio = ai.ready && audioRec.supported;
  const mode: "ai" | "browser" = pickedMode === "browser" ? "browser" : canUseAiAudio ? "ai" : "browser";

  const [spokenText, setSpokenText] = useState("");
  const [result, setResult] = useState<{ words: WordResult[]; score: number } | null>(null);
  const [tries, setTries] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [fb, setFb] = useState<PronFeedback | null>(null);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbErr, setFbErr] = useState("");
  const [playingOwn, setPlayingOwn] = useState(false);
  const ownAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setResult(null);
    setSpokenText("");
    setTries(0);
    setFb(null);
    setFbErr("");
    setAnalyzing(false);
    audioRec.reset();
    browserRec.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [en]);

  useEffect(() => {
    return () => {
      ownAudioRef.current?.pause();
    };
  }, []);

  // Xử lý âm thanh thật qua Gemini Audio
  useEffect(() => {
    const blob = audioRec.audioBlob;
    if (!blob || mode !== "ai") return;
    let cancelled = false;
    (async () => {
      setAnalyzing(true);
      setFbErr("");
      try {
        const payload = await prepareGeminiAudio(blob);
        const res = await aiPost<AssessAudioResponse>("/api/ai/assess-audio", { ...payload, target: en });
        if (cancelled) return;
        if (res.noSpeech || !res.heard?.trim()) {
          setFbErr("Chưa nghe rõ giọng nói trong đoạn thu âm. Bạn thử nói gần micro và rõ hơn nhé.");
          return;
        }
        const cmp = compareSentence(en, res.heard);
        setSpokenText(cmp.bestSpoken);
        setResult(cmp);
        setTries((t) => t + 1);
        actions.pronScore(cmp.score);
        if (cmp.score >= 80) actions.addXP(5);
        onScore?.(cmp.score);
        setFb({
          summaryVi: res.summaryVi,
          issues: res.issues ?? [],
          drill: res.drill,
          encouragementVi: res.encouragementVi,
        });
      } catch (e) {
        if (!cancelled) setFbErr((e as Error).message);
      } finally {
        if (!cancelled) setAnalyzing(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRec.audioBlob]);

  // Xử lý dự phòng bằng Web Speech API trình duyệt
  useEffect(() => {
    if (!browserRec.transcript || mode !== "browser") return;
    const cmp = compareSentence(en, browserRec.transcript, browserRec.alternatives);
    setSpokenText(cmp.bestSpoken);
    setResult(cmp);
    setFb(null);
    setTries((t) => t + 1);
    actions.pronScore(cmp.score);
    if (cmp.score >= 80) actions.addXP(5);
    onScore?.(cmp.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserRec.transcript]);

  async function askAi() {
    if (!result) return;
    setFbLoading(true);
    setFbErr("");
    setFb(null);
    try {
      setFb(await aiPost<PronFeedback>("/api/ai/pronounce", {
        target: en,
        spoken: spokenText,
        missed: result.words.filter((w) => !w.ok).map((w) => w.word),
      }));
    } catch (e) {
      setFbErr((e as Error).message);
    } finally {
      setFbLoading(false);
    }
  }

  function playOwnVoice() {
    if (!audioRec.audioUrl) return;
    ownAudioRef.current?.pause();
    const audio = new Audio(audioRec.audioUrl);
    ownAudioRef.current = audio;
    setPlayingOwn(true);
    audio.onended = () => setPlayingOwn(false);
    audio.onerror = () => setPlayingOwn(false);
    audio.play().catch(() => setPlayingOwn(false));
  }

  const listening = mode === "ai" ? audioRec.listening : browserRec.listening;
  const activeErr = mode === "ai" ? audioRec.error : browserRec.error;
  const unsupported = mode === "ai" ? !audioRec.supported && !browserRec.supported : !browserRec.supported;

  const startRec = () => {
    setFbErr("");
    if (mode === "ai") audioRec.start();
    else browserRec.start();
  };
  const stopRec = () => {
    if (mode === "ai") audioRec.stop();
    else browserRec.stop();
  };

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
        <MicBtn listening={listening} disabled={analyzing} onStart={startRec} onStop={stopRec} size={big ? "lg" : "md"} />
        {mode === "ai" && audioRec.audioUrl && !listening && (
          <button
            type="button"
            onClick={playOwnVoice}
            className="btn-outline !px-2.5 !py-1.5 text-xs"
            title="Nghe lại giọng thu âm của bạn"
          >
            <Headphones size={14} className={playingOwn ? "text-sky-600" : ""} /> {playingOwn ? "Đang phát..." : "Nghe lại"}
          </button>
        )}

        <div className="flex min-w-[140px] flex-1 items-center gap-2 text-xs text-slate-500">
          {analyzing ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-violet-600">
              <Loader2 size={14} className="animate-spin" /> AI đang nghe và chấm phát âm...
            </span>
          ) : listening ? (
            <span className="inline-flex items-center gap-2 text-rose-600">
              {mode === "ai" && <AudioLevelBar level={audioRec.level} />}
              <span>
                {mode === "browser" && browserRec.interim
                  ? `“${browserRec.interim}”`
                  : "Đang nghe... nói xong dừng 1.5s hoặc bấm ■"}
              </span>
            </span>
          ) : tries && spokenText ? (
            <span>Bạn nói: “{spokenText}”</span>
          ) : (
            <span>Nghe mẫu → bấm micro → đọc theo</span>
          )}
        </div>

        {canUseAiAudio && (
          <button
            type="button"
            disabled={listening || analyzing}
            onClick={() => setPickedMode(mode === "ai" ? "browser" : "ai")}
            className="chip bg-slate-100 text-[11px] text-slate-600 hover:bg-slate-200 disabled:opacity-50"
            title="Đổi chế độ nhận diện: AI nghe trực tiếp (chuẩn xác) hoặc Trình duyệt (tức thì)"
          >
            {mode === "ai" ? "✨ AI nghe chuẩn" : "⚡ Trình duyệt"}
          </button>
        )}
      </div>

      {(result || fbErr) && (
        <div className="mt-3">
          {result && !fb && !analyzing && (
            ai.ready ? (
              <button onClick={askAi} disabled={fbLoading} className="chip bg-violet-50 px-3 py-1.5 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100">
                {fbLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} AI nhận xét phát âm
              </button>
            ) : result.score < 100 ? (
              <p className="text-[11px] text-slate-400">💡 <Link href="/settings" className="underline">Thêm khoá Gemini</Link> để bật AI nghe giọng thật và sửa phát âm.</p>
            ) : null
          )}
          {fbErr && <p className="mt-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-600">{fbErr}</p>}
          {fb && (
            <div className="mt-2 animate-pop space-y-2 rounded-xl bg-violet-50/60 p-3 text-sm ring-1 ring-violet-100">
              <p className="font-medium text-violet-900">{fb.summaryVi}</p>
              {fb.issues.map((x, i) => (
                <div key={i} className="rounded-lg bg-white p-2.5">
                  <p><b>{x.word}</b> <span className="font-mono text-sky-600">{x.ipa}</span>{x.heard && <span className="text-slate-400"> · nghe thành “{x.heard}”</span>}</p>
                  <p className="text-slate-600">{x.tipVi}</p>
                </div>
              ))}
              {fb.drill?.en && (
                <div className="flex items-center gap-2 rounded-lg bg-white p-2.5">
                  <button type="button" onClick={() => speak(fb.drill.en, { rate: 0.75 })} className="icon-btn !h-7 !w-7 shrink-0">🔊</button>
                  <p><span className="text-xs font-bold text-violet-600">Luyện thêm:</span> {fb.drill.en} <span className="text-slate-500">— {fb.drill.vi}</span></p>
                </div>
              )}
              <p className="text-xs text-emerald-700">{fb.encouragementVi}</p>
            </div>
          )}
        </div>
      )}
      {activeErr && <p className="mt-2 text-xs text-rose-500">{activeErr}</p>}
      {unsupported && <div className="mt-2"><UnsupportedNote /></div>}
    </div>
  );
}
