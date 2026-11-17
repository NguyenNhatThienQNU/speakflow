"use client";
// Phía trình duyệt: lưu cài đặt AI và gọi các API /api/ai/*
import { useEffect, useState, useSyncExternalStore } from "react";

export interface AiSettings { key: string; model: string }
const KEY = "speakflow-ai";
const DEFAULT: AiSettings = { key: "", model: "gemini-3.5-flash-lite" };
let cache: AiSettings | null = null;
const subs = new Set<() => void>();

function read(): AiSettings {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT;
  try { cache = { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { cache = DEFAULT; }
  return cache!;
}

export function saveAiSettings(s: AiSettings) {
  cache = s;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* bỏ qua */ }
  subs.forEach((f) => f());
}

export function useAiSettings() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, read, () => DEFAULT);
}

/** Server có sẵn khoá (biến môi trường) hay không */
let serverStatus: Promise<{ serverKey: boolean; model: string }> | null = null;
export function useAiReady() {
  const s = useAiSettings();
  const [serverKey, setServerKey] = useState(false);
  useEffect(() => {
    serverStatus ??= fetch("/api/ai/status").then((r) => r.json()).catch(() => ({ serverKey: false, model: "" }));
    serverStatus.then((x) => setServerKey(x.serverKey));
  }, []);
  return { ready: serverKey || !!s.key, serverKey, userKey: !!s.key };
}

export async function aiPost<T>(path: string, body: unknown): Promise<T> {
  const s = read();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (s.key) headers["x-user-gemini-key"] = s.key;
  if (s.model) headers["x-user-gemini-model"] = s.model;
  const r = await fetch(path, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.error) throw new Error(data.error || `Lỗi ${r.status}`);
  return data as T;
}
