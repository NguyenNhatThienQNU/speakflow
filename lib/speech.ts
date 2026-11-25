"use client";
// Web Speech API + MediaRecorder Audio Capture (cho Gemini Audio)
import { useCallback, useEffect, useRef, useState } from "react";
import { actions } from "./store";
export { compareSentence, normalize, type CompareResult, type WordResult } from "./speech-compare";

export function speak(text: string, opts: { rate?: number; lang?: string } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts.lang ?? "en-US";
  u.rate = opts.rate ?? 0.95;
  const voices = window.speechSynthesis.getVoices();
  const v =
    voices.find((x) => x.lang === u.lang && /Google|Microsoft|Samantha|Aria|Jenny/i.test(x.name)) ??
    voices.find((x) => x.lang === u.lang) ??
    voices.find((x) => x.lang.startsWith(u.lang.slice(0, 2)));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any;

function sttErrorMessage(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Bạn chưa cho phép dùng micro. Hãy bật quyền micro trên thanh địa chỉ trình duyệt.";
    case "audio-capture":
      return "Không tìm thấy micro hoặc micro đang bận.";
    case "no-speech":
      return "Không nghe thấy giọng nói, thử nói to và rõ hơn nhé.";
    case "network":
      return "Lỗi mạng khi nhận diện giọng nói trình duyệt. Hãy thử chế độ AI Nghe chuẩn.";
    default:
      return `Lỗi nhận diện (${code})`;
  }
}

export function useRecognizer(lang = "en-US") {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<AnyRec>(null);
  const startedAt = useRef(0);
  const lastFinalRef = useRef("");
  const lastInterimRef = useRef("");

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
    recRef.current?.abort?.();

    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 5;

    lastFinalRef.current = "";
    lastInterimRef.current = "";
    setTranscript("");
    setAlternatives([]);
    setInterim("");
    setError(null);

    rec.onresult = (e: AnyRec) => {
      const finParts: string[] = [];
      const tmpParts: string[] = [];
      const altCount = 4;
      const altBuckets: string[][] = Array.from({ length: altCount }, () => []);

      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        const primary = r[0]?.transcript?.trim();
        if (!primary) continue;
        if (r.isFinal) {
          finParts.push(primary);
          for (let a = 0; a < altCount; a++) {
            const altText = r[a + 1]?.transcript?.trim() ?? primary;
            altBuckets[a].push(altText);
          }
        } else {
          tmpParts.push(primary);
        }
      }

      const fin = finParts.join(" ").replace(/\s+/g, " ").trim();
      const tmp = tmpParts.join(" ").replace(/\s+/g, " ").trim();
      lastInterimRef.current = tmp;

      if (fin) {
        lastFinalRef.current = fin;
        setTranscript(fin);
        const alts = altBuckets
          .map((b) => b.join(" ").replace(/\s+/g, " ").trim())
          .filter((x) => x && x !== fin);
        setAlternatives([...new Set(alts)]);
      }
      setInterim(tmp);
    };

    rec.onerror = (e: AnyRec) => {
      if (e.error === "aborted") return;
      setError(sttErrorMessage(String(e.error)));
    };

    rec.onend = () => {
      setListening(false);
      // Nếu người dùng bấm dừng trước khi isFinal bật, giữ lại phần interim đã nghe được
      if (!lastFinalRef.current && lastInterimRef.current) {
        setTranscript(lastInterimRef.current);
      }
      setInterim("");
      if (startedAt.current > 0) {
        actions.logSpeaking((Date.now() - startedAt.current) / 1000);
        startedAt.current = 0;
      }
    };

    recRef.current = rec;
    startedAt.current = Date.now();
    setListening(true);
    rec.start();
  }, [lang]);

  const stop = useCallback(() => recRef.current?.stop?.(), []);
  const reset = useCallback(() => {
    lastFinalRef.current = "";
    lastInterimRef.current = "";
    setTranscript("");
    setAlternatives([]);
    setInterim("");
    setError(null);
  }, []);

  return { supported, listening, transcript, alternatives, interim, error, start, stop, reset };
}

// ---------------- Thu âm trực tiếp bằng MediaRecorder (cho Gemini Audio) ----------------

const PREFERRED_MIMES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
];

const GEMINI_AUDIO_MIMES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/aac",
  "audio/flac",
]);

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";
  return PREFERRED_MIMES.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

function micErrorMessage(err: unknown): string {
  const name = err instanceof Error ? err.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Bạn chưa cho phép dùng micro. Hãy bấm biểu tượng ổ khóa trên thanh địa chỉ để bật micro.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Không tìm thấy micro trên thiết bị của bạn.";
  }
  if (name === "NotReadableError") {
    return "Micro đang được ứng dụng khác sử dụng.";
  }
  return "Không thể khởi động micro. Hãy kiểm tra lại thiết bị.";
}

export interface AudioRecorderOptions {
  autoStopMs?: number;
  maxWaitNoSpeechMs?: number;
  maxDurationMs?: number;
}

export function useAudioRecorder(opts: AudioRecorderOptions = {}) {
  const autoStopMs = opts.autoStopMs ?? 1500;
  const maxWaitNoSpeechMs = opts.maxWaitNoSpeechMs ?? 6000;
  const maxDurationMs = opts.maxDurationMs ?? 20000;

  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mrRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const urlRef = useRef<string | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef(0);
  const manualStopRef = useRef(false);
  const autoSilentRef = useRef(false);
  const hasSpokenRef = useRef(false);
  const peakRmsRef = useRef(0);
  const hasMeterRef = useRef(false);

  const cleanupAudioGraph = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    setLevel(0);
  }, []);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined";
    setSupported(ok);
    return () => {
      if (mrRef.current && mrRef.current.state !== "inactive") {
        try { mrRef.current.stop(); } catch { /* ignore */ }
      }
      cleanupAudioGraph();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [cleanupAudioGraph]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    if (mrRef.current && mrRef.current.state !== "inactive") {
      mrRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setSupported(false);
      return;
    }
    window.speechSynthesis?.cancel();

    if (mrRef.current && mrRef.current.state !== "inactive") {
      try { mrRef.current.stop(); } catch { /* ignore */ }
    }
    cleanupAudioGraph();

    setError(null);
    setAudioBlob(null);
    manualStopRef.current = false;
    autoSilentRef.current = false;
    hasSpokenRef.current = false;
    peakRmsRef.current = 0;
    hasMeterRef.current = false;
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mrRef.current = mr;

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      mr.onstop = () => {
        const duration = Date.now() - startedAtRef.current;
        setListening(false);
        cleanupAudioGraph();
        if (startedAtRef.current > 0) {
          actions.logSpeaking(duration / 1000);
          startedAtRef.current = 0;
        }

        const blob = new Blob(chunksRef.current, { type: mr.mimeType || mimeType || "audio/webm" });
        const silentMeter = hasMeterRef.current && !hasSpokenRef.current && peakRmsRef.current < 0.004;
        const tooQuiet = autoSilentRef.current || duration < 200 || silentMeter || blob.size < 400;
        if (tooQuiet) {
          setError("Chưa nghe thấy giọng nói. Hãy kiểm tra micro và nói to, rõ hơn nhé.");
          return;
        }

        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const nextUrl = URL.createObjectURL(blob);
        urlRef.current = nextUrl;
        setAudioUrl(nextUrl);
        setAudioBlob(blob);
      };

      // Theo dõi mức âm lượng + tự dừng khi nói xong (Adaptive VAD)
      const AudioCtx = window.AudioContext || (window as AnyRec).webkitAudioContext;
      if (AudioCtx) {
        hasMeterRef.current = true;
        const ctx: AudioContext = new AudioCtx();
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        ctxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);

        let noiseFloor = 0.015;
        let speechTicks = 0;
        let lastSpeechAt = Date.now();

        timerRef.current = setInterval(() => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buf.length);
          if (rms > peakRmsRef.current) peakRmsRef.current = rms;
          setLevel(Math.min(1, rms * 6));

          const now = Date.now();
          const elapsed = now - startedAtRef.current;
          if (elapsed < 300) {
            noiseFloor = Math.min(noiseFloor, Math.max(0.004, rms));
          }
          const speechThresh = Math.max(0.02, noiseFloor * 2.2);

          if (rms > speechThresh) {
            speechTicks++;
            if (speechTicks >= 2) {
              hasSpokenRef.current = true;
              lastSpeechAt = now;
            }
          } else {
            speechTicks = 0;
          }

          if (hasSpokenRef.current && now - lastSpeechAt >= autoStopMs && mr.state === "recording") {
            mr.stop();
          } else if (!hasSpokenRef.current && elapsed >= maxWaitNoSpeechMs && mr.state === "recording") {
            autoSilentRef.current = true;
            mr.stop();
          } else if (elapsed >= maxDurationMs && mr.state === "recording") {
            mr.stop();
          }
        }, 50);
      }

      startedAtRef.current = Date.now();
      setListening(true);
      mr.start(100);
    } catch (err) {
      cleanupAudioGraph();
      setListening(false);
      setError(micErrorMessage(err));
    }
  }, [autoStopMs, cleanupAudioGraph, maxDurationMs, maxWaitNoSpeechMs]);

  const reset = useCallback(() => {
    setError(null);
    setAudioBlob(null);
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setAudioUrl(null);
  }, []);

  return { supported, listening, level, audioBlob, audioUrl, error, start, stop, reset };
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function convertBlobToWavBase64(blob: Blob): Promise<string> {
  const AudioCtx = window.AudioContext || (window as AnyRec).webkitAudioContext;
  const ctx: AudioContext = new AudioCtx();
  try {
    const arr = await blob.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arr);
    const targetRate = 16000;
    const len = Math.max(1, Math.ceil(decoded.duration * targetRate));
    const offline = new OfflineAudioContext(1, len, targetRate);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start(0);
    const rendered = await offline.startRendering();
    const samples = rendered.getChannelData(0);

    const wavBuf = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(wavBuf);
    const writeStr = (off: number, s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const clamped = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    }
    return bytesToBase64(new Uint8Array(wavBuf));
  } finally {
    ctx.close().catch(() => {});
  }
}

export async function prepareGeminiAudio(blob: Blob): Promise<{ audioBase64: string; mimeType: string }> {
  const baseMime = (blob.type || "audio/webm").split(";")[0].trim().toLowerCase();
  if (GEMINI_AUDIO_MIMES.has(baseMime)) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { audioBase64: bytesToBase64(bytes), mimeType: baseMime };
  }
  const wavBase64 = await convertBlobToWavBase64(blob);
  return { audioBase64: wavBase64, mimeType: "audio/wav" };
}
