"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Lightbulb, Languages, Volume2, Sparkles, CheckCircle2, AlertCircle, Loader2, RotateCcw, Headphones } from "lucide-react";
import type { Scenario, LevelId } from "@/lib/data";
import { actions } from "@/lib/store";
import { speak, prepareGeminiAudio, useAudioRecorder, useRecognizer } from "@/lib/speech";
import { AudioLevelBar, MicBtn } from "./ui";
import Link from "next/link";
import { aiPost, useAiReady } from "@/lib/ai-client";

interface Correction { hasError: boolean; corrected: string; natural: string; explanationVi: string }
interface Msg { role: "ai" | "user" | "error"; text: string; vi?: string; correction?: Correction; showVi?: boolean }

export default function Chat({ scenario, level, onUserTurn, height = "h-[60vh]" }: {
  scenario: Scenario; level: LevelId; onUserTurn?: (count: number) => void; height?: string;
}) {
  const beginner = level === "pre" || level === "a1" || level === "a2";
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(scenario.hints);
  const [showHints, setShowHints] = useState(false);
  const [autoVi, setAutoVi] = useState(beginner);
  const [voice, setVoice] = useState(true);
  const [mock, setMock] = useState(false);
  const ai = useAiReady();
  const audioRec = useAudioRecorder({ autoStopMs: 1700, maxWaitNoSpeechMs: 7000, maxDurationMs: 35000 });
  const [browserLang, setBrowserLang] = useState<"en-US" | "vi-VN">("en-US");
  const rec = useRecognizer(browserLang);
  const [pickedMode, setPickedMode] = useState<"ai" | "browser" | null>(null);
  const canUseAiAudio = ai.ready && audioRec.supported;
  const micMode: "ai" | "browser" = pickedMode === "browser" ? "browser" : canUseAiAudio ? "ai" : "browser";
  const [transcribing, setTranscribing] = useState(false);
  const [sttErr, setSttErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const userTurns = msgs.filter((m) => m.role === "user").length;

  useEffect(() => {
    setMsgs([{ role: "ai", text: scenario.opener, vi: scenario.openerVi }]);
    setSuggestions(scenario.hints);
    setShowHints(false);
  }, [scenario]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs, loading]);

  // Nói xong → tự điền vào ô nhập (trình duyệt)
  useEffect(() => { if (rec.transcript && micMode === "browser") setInput(rec.transcript); }, [rec.transcript, micMode]);

  // Nói xong → Gemini Audio chép lời (hỗ trợ song ngữ Anh + Việt)
  useEffect(() => {
    const blob = audioRec.audioBlob;
    if (!blob || micMode !== "ai") return;
    let cancelled = false;
    (async () => {
      setTranscribing(true);
      setSttErr("");
      try {
        const payload = await prepareGeminiAudio(blob);
        const res = await aiPost<{ text: string; noSpeech: boolean }>("/api/ai/transcribe", {
          ...payload,
          scenarioTitle: scenario.title,
        });
        if (cancelled) return;
        if (res.noSpeech || !res.text?.trim()) {
          setSttErr("Chưa nghe rõ giọng nói. Bạn thử nói gần micro và rõ hơn nhé.");
        } else {
          setInput((prev) => (prev.trim() ? `${prev.trim()} ${res.text.trim()}` : res.text.trim()));
        }
      } catch (e) {
        if (!cancelled) setSttErr((e as Error).message);
      } finally {
        if (!cancelled) setTranscribing(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRec.audioBlob]);

  async function send(text = input) {
    const userText = text.trim();
    if (!userText || loading) return;
    const history = msgs.filter((m) => m.role !== "error").map((m) => ({ role: m.role as "ai" | "user", text: m.text }));
    setMsgs((m) => [...m.filter((x) => x.role !== "error"), { role: "user", text: userText }]);
    setInput(""); rec.reset(); audioRec.reset(); setSttErr(""); setShowHints(false); setLoading(true);
    actions.countAiMsg(); actions.addXP(5);
    onUserTurn?.(userTurns + 1);
    try {
      const data = await aiPost<{ reply: string; replyVi: string; correction: Correction; suggestions: { en: string; vi: string }[]; mock?: boolean }>(
        "/api/chat", { scenarioId: scenario.id, scenario, level, history, userText });
      setMock(!!data.mock);
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], correction: data.correction };
        return [...copy, { role: "ai", text: data.reply, vi: data.replyVi }];
      });
      if (data.correction?.hasError) actions.addMistake(userText, data.correction.natural || data.correction.corrected, data.correction.explanationVi);
      if (data.suggestions?.length) setSuggestions(data.suggestions);
      if (voice) speak(data.reply);
    } catch (e) {
      // Gỡ tin nhắn vừa gửi về ô nhập để người học gửi lại
      setMsgs((m) => [...m.slice(0, -1), { role: "error", text: (e as Error).message }]);
      setInput(userText);
    } finally { setLoading(false); }
  }

  const toggleVi = (i: number) => setMsgs((m) => m.map((x, k) => (k === i ? { ...x, showVi: !x.showVi } : x)));

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Thanh công cụ */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs">
        <span className="font-bold text-slate-700">{scenario.icon} {scenario.title}</span>
        <span className="hidden text-slate-500 sm:inline">— 🎯 {scenario.goalVi}</span>
        <div className="ml-auto flex gap-1.5">
          <Toggle on={autoVi} onClick={() => setAutoVi(!autoVi)} icon={<Languages size={14} />} label="Phụ đề Việt" />
          <Toggle on={voice} onClick={() => setVoice(!voice)} icon={<Headphones size={14} />} label="Đọc to" />
          <button onClick={() => { setMsgs([{ role: "ai", text: scenario.opener, vi: scenario.openerVi }]); setSuggestions(scenario.hints); }}
            className="chip bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"><RotateCcw size={13} /> Làm lại</button>
        </div>
      </div>
      {mock && (
        <p className="bg-amber-50 px-4 py-1.5 text-[11px] text-amber-700">
          Đang chạy chế độ mô phỏng (chưa có khoá Gemini). <Link href="/settings" className="font-semibold underline">Thêm khoá ở Cài đặt AI</Link> để Gemini hội thoại và sửa lỗi thật.
        </p>
      )}

      {/* Tin nhắn */}
      <div className={`${height} space-y-4 overflow-y-auto p-4`}>
        {msgs.map((m, i) => m.role === "error" ? (
          <div key={i} className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            ⚠️ {m.text} <Link href="/settings" className="font-semibold underline">Mở Cài đặt AI</Link>
          </div>
        ) : m.role === "ai" ? (
          <div key={i} className="flex max-w-[88%] animate-pop gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-sm text-white">AI</div>
            <div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5">
                <p className="text-[15px]">{m.text}</p>
                {(autoVi || m.showVi) && m.vi && <p className="mt-1 border-t border-slate-200 pt-1 text-sm italic text-slate-500">{m.vi}</p>}
              </div>
              <div className="mt-1 flex gap-1">
                <button onClick={() => speak(m.text)} className="chip text-slate-500 hover:bg-slate-100"><Volume2 size={13} /> Nghe</button>
                <button onClick={() => speak(m.text, { rate: 0.6 })} className="chip text-slate-500 hover:bg-slate-100">🐢 Chậm</button>
                {!autoVi && m.vi && <button onClick={() => toggleVi(i)} className="chip text-slate-500 hover:bg-slate-100"><Languages size={13} /> Dịch nhanh</button>}
              </div>
            </div>
          </div>
        ) : (
          <div key={i} className="ml-auto flex max-w-[88%] animate-pop flex-col items-end">
            <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2.5 text-[15px] text-white">{m.text}</div>
            {m.correction && <CorrectionBox c={m.correction} original={m.text} />}
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> AI đang trả lời...</div>}
        <div ref={endRef} />
      </div>

      {/* Gợi ý */}
      {showHints && (
        <div className="space-y-1.5 border-t border-slate-100 bg-amber-50/60 p-3">
          <p className="text-xs font-bold text-amber-700">💡 Gợi ý trả lời — bấm để dùng</p>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s.en)} className="block w-full rounded-xl bg-white px-3 py-2 text-left text-sm ring-1 ring-amber-200 hover:bg-amber-50">
              <span className="font-medium">{s.en}</span> <span className="text-slate-500">— {s.vi}</span>
            </button>
          ))}
        </div>
      )}

      {/* Ô nhập */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2">
          <MicBtn
            listening={micMode === "ai" ? audioRec.listening : rec.listening}
            disabled={transcribing || loading}
            onStart={() => {
              setSttErr("");
              if (micMode === "ai") audioRec.start();
              else rec.start();
            }}
            onStop={() => {
              if (micMode === "ai") audioRec.stop();
              else rec.stop();
            }}
          />
          <button onClick={() => setShowHints(!showHints)} className={`icon-btn ${showHints ? "bg-amber-100 text-amber-600" : ""}`} title="Gợi ý trả lời"><Lightbulb size={18} /></button>
          <input
            value={
              transcribing
                ? "✨ AI đang nhận diện giọng nói..."
                : micMode === "ai" && audioRec.listening
                ? "🎙️ Đang nghe (nói tiếng Anh hoặc tiếng Việt)..."
                : micMode === "browser" && rec.listening
                ? rec.interim || "🎙️ Đang nghe..."
                : input
            }
            readOnly={transcribing || audioRec.listening || rec.listening}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={beginner ? "Nhập hoặc bấm micro để nói tiếng Anh / Việt..." : "Type or speak English / Vietnamese..."}
            className="min-w-0 flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-[15px] outline-none ring-sky-400 focus:ring-2"
          />
          <button onClick={() => send()} disabled={!input.trim() || loading || transcribing} className="btn-primary h-11 w-11 !p-0"><Send size={18} /></button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            {micMode === "ai" && audioRec.listening && <AudioLevelBar level={audioRec.level} />}
            {transcribing && <Loader2 size={13} className="animate-spin text-violet-600" />}
            <span>
              {micMode === "ai"
                ? "✨ Micro AI nghe cả tiếng Anh & tiếng Việt — tự dừng khi nói xong"
                : `⚡ Micro trình duyệt (${browserLang === "en-US" ? "Tiếng Anh" : "Tiếng Việt"})`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {micMode === "browser" && (
              <button
                type="button"
                onClick={() => setBrowserLang(browserLang === "en-US" ? "vi-VN" : "en-US")}
                className="chip bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                {browserLang === "en-US" ? "🇺🇸 EN" : "🇻🇳 VI"}
              </button>
            )}
            {canUseAiAudio && (
              <button
                type="button"
                disabled={audioRec.listening || rec.listening || transcribing}
                onClick={() => setPickedMode(micMode === "ai" ? "browser" : "ai")}
                className="chip bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
              >
                {micMode === "ai" ? "Đổi sang trình duyệt" : "✨ Dùng AI nghe chuẩn"}
              </button>
            )}
          </div>
        </div>
      </div>
      {(sttErr || (micMode === "ai" ? audioRec.error : rec.error)) && (
        <p className="px-4 pb-2 text-xs text-rose-500">{sttErr || (micMode === "ai" ? audioRec.error : rec.error)}</p>
      )}
      {(micMode === "ai" ? !audioRec.supported && !rec.supported : !rec.supported) && (
        <p className="px-4 pb-2 text-xs text-amber-600">Trình duyệt chưa hỗ trợ thu âm — hãy dùng Chrome/Edge/Safari, hoặc nhập bằng bàn phím.</p>
      )}
    </div>
  );
}

function CorrectionBox({ c, original }: { c: Correction; original: string }) {
  const same = c.natural.trim().toLowerCase() === original.trim().toLowerCase();
  if (!c.hasError && same) {
    return <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={13} /> {c.explanationVi || "Chuẩn rồi!"}</p>;
  }
  return (
    <div className="mt-1.5 w-full max-w-md rounded-xl bg-white p-3 text-left text-sm shadow-sm ring-1 ring-slate-200">
      <p className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-500"><Sparkles size={13} className="text-amber-500" /> Sửa lỗi & Gợi ý nói tự nhiên hơn</p>
      {c.hasError && (
        <p className="flex gap-1.5"><AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-500" /><span><span className="font-semibold text-rose-600">Sửa:</span> {c.corrected}</span></p>
      )}
      {c.natural && c.natural !== c.corrected && (
        <p className="mt-1 flex gap-1.5"><Sparkles size={15} className="mt-0.5 shrink-0 text-emerald-500" /><span><span className="font-semibold text-emerald-600">Tự nhiên hơn:</span> {c.natural}</span>
          <button onClick={() => speak(c.natural)} className="ml-auto text-sky-500"><Volume2 size={15} /></button></p>
      )}
      <p className="mt-1.5 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">🇻🇳 {c.explanationVi}</p>
    </div>
  );
}

function Toggle({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`chip ring-1 ${on ? "bg-sky-500 text-white ring-sky-500" : "bg-white text-slate-600 ring-slate-200"}`}>
      {icon} {label}
    </button>
  );
}
