"use client";
// Lưu tiến độ học trên trình duyệt (localStorage).
// Khi gắn Firebase/PostgreSQL chỉ cần thay load()/save() bên dưới.
import { useSyncExternalStore } from "react";
import { LESSONS, LEVELS, SCENARIOS, type LevelId, type Lesson, type Scenario, type Vocab } from "./data";

export interface SrsCard {
  id: string;
  kind: "vocab" | "mistake";
  front: string;
  back: string;
  ipa?: string;
  ex?: string;
  exVi?: string;
  due: number; // timestamp ms
  interval: number; // ngày
  ease: number;
  reps: number;
}

export interface AppState {
  level: LevelId;
  placementDone: boolean;
  uiLang: "auto" | "vi" | "en";
  xp: number;
  streak: number;
  lastStudy: string | null;
  completed: string[];
  cards: SrsCard[];
  speakLog: Record<string, number>; // ngày → giây nói
  xpLog: Record<string, number>;
  badges: string[];
  aiMsgs: number;
  ipaPracticed: string[];
  bestPron: number;
  /** Bài học do AI soạn theo chủ đề người học chọn */
  customLessons: Lesson[];
  customScenarios: Scenario[];
}

const KEY = "speakflow-v1";
const DEFAULT: AppState = {
  level: "pre", placementDone: false, uiLang: "auto", xp: 0, streak: 0, lastStudy: null,
  completed: [], cards: [], speakLog: {}, xpLog: {}, badges: [], aiMsgs: 0, ipaPracticed: [], bestPron: 0,
  customLessons: [], customScenarios: [],
};

let state: AppState = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...JSON.parse(raw) };
  } catch { /* bỏ qua */ }
}

function set(updater: (s: AppState) => AppState) {
  load();
  state = checkBadges(updater(state));
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* bỏ qua */ }
  listeners.forEach((l) => l());
}

export function useApp(): AppState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => { load(); return state; },
    () => DEFAULT,
  );
}

// ---------------- tiện ích ngày ----------------
export const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function touchStreak(s: AppState): AppState {
  const t = today();
  if (s.lastStudy === t) return s;
  const streak = s.lastStudy && dayDiff(s.lastStudy, t) === 1 ? s.streak + 1 : 1;
  return { ...s, streak, lastStudy: t };
}

// ---------------- hành động ----------------
export const actions = {
  addXP(n: number) {
    set((s) => {
      const s2 = touchStreak(s);
      return { ...s2, xp: s2.xp + n, xpLog: { ...s2.xpLog, [today()]: (s2.xpLog[today()] ?? 0) + n } };
    });
  },
  logSpeaking(seconds: number) {
    if (seconds <= 0) return;
    set((s) => ({ ...s, speakLog: { ...s.speakLog, [today()]: (s.speakLog[today()] ?? 0) + Math.round(seconds) } }));
  },
  setLevel(level: LevelId, placementDone = true) {
    set((s) => ({ ...s, level, placementDone }));
  },
  setUiLang(uiLang: AppState["uiLang"]) { set((s) => ({ ...s, uiLang })); },
  completeLesson(id: string, vocab: Vocab[]) {
    set((s) => {
      if (s.completed.includes(id)) return s;
      const existing = new Set(s.cards.map((c) => c.id));
      const newCards: SrsCard[] = vocab
        .filter((v) => !existing.has("v:" + v.en))
        .map((v) => ({ id: "v:" + v.en, kind: "vocab", front: v.en, back: v.vi, ipa: v.ipa, ex: v.ex, exVi: v.exVi,
          due: Date.now(), interval: 0, ease: 2.5, reps: 0 }));
      return { ...s, completed: [...s.completed, id], cards: [...s.cards, ...newCards] };
    });
  },
  addMistake(wrong: string, right: string, note: string) {
    set((s) => {
      const id = "m:" + right.toLowerCase().slice(0, 80);
      if (s.cards.some((c) => c.id === id)) return s;
      return { ...s, cards: [...s.cards, { id, kind: "mistake", front: wrong, back: right, ex: note,
        due: Date.now(), interval: 0, ease: 2.5, reps: 0 }] };
    });
  },
  /** grade: 0 = Quên, 1 = Khó, 2 = Tốt, 3 = Dễ  (SM-2 rút gọn) */
  reviewCard(id: string, grade: 0 | 1 | 2 | 3) {
    set((s) => ({
      ...s,
      cards: s.cards.map((c) => {
        if (c.id !== id) return c;
        let { interval, ease, reps } = c;
        if (grade === 0) { reps = 0; interval = 0; ease = Math.max(1.3, ease - 0.2); }
        else {
          reps += 1;
          if (grade === 1) { interval = Math.max(1, interval * 1.2); ease = Math.max(1.3, ease - 0.15); }
          else if (grade === 2) { interval = reps === 1 ? 1 : reps === 2 ? 3 : interval * ease; }
          else { interval = reps === 1 ? 4 : interval * ease * 1.3; ease += 0.15; }
        }
        const due = grade === 0 ? Date.now() + 60_000 : Date.now() + interval * 86400000;
        return { ...c, interval, ease, reps, due };
      }),
    }));
  },
  countAiMsg() { set((s) => ({ ...s, aiMsgs: s.aiMsgs + 1 })); },
  practiceIpa(symbol: string) {
    set((s) => (s.ipaPracticed.includes(symbol) ? s : { ...s, ipaPracticed: [...s.ipaPracticed, symbol] }));
  },
  pronScore(score: number) { set((s) => ({ ...s, bestPron: Math.max(s.bestPron, score) })); },
  addCustomLesson(lesson: Lesson, scenario: Scenario) {
    set((s) => ({ ...s, customLessons: [lesson, ...s.customLessons], customScenarios: [scenario, ...s.customScenarios] }));
  },
  addScenario(sc: Scenario) { set((s) => ({ ...s, customScenarios: [sc, ...s.customScenarios] })); },
  removeScenario(id: string) { set((s) => ({ ...s, customScenarios: s.customScenarios.filter((x) => x.id !== id) })); },
  removeCustomLesson(id: string) {
    set((s) => {
      const l = s.customLessons.find((x) => x.id === id);
      return { ...s, customLessons: s.customLessons.filter((x) => x.id !== id), customScenarios: s.customScenarios.filter((x) => x.id !== l?.scenarioId) };
    });
  },
  reset() { set(() => DEFAULT); },
};

function checkBadges(s: AppState): AppState {
  const b = new Set(s.badges);
  if (s.completed.length >= 1) b.add("first");
  if (s.streak >= 3) b.add("streak3");
  if (s.streak >= 7) b.add("streak7");
  if (s.xp >= 500) b.add("xp500");
  if (s.aiMsgs >= 20) b.add("talker");
  if (s.ipaPracticed.length >= 20) b.add("ipa");
  if (s.bestPron >= 90) b.add("pron90");
  for (const lv of LEVELS) {
    const ids = LESSONS.filter((l) => l.level === lv.id).map((l) => l.id);
    if (ids.length && ids.every((id) => s.completed.includes(id))) b.add("levelup");
  }
  return b.size === s.badges.length ? s : { ...s, badges: [...b] };
}

// ---------------- mở khóa bài học ----------------
export function isUnlocked(s: AppState, lessonId: string): boolean {
  if (lessonId.startsWith("ai-")) return true; // bài AI tự tạo luôn mở
  const idx = LESSONS.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return true;
  const lesson = LESSONS[idx];
  const li = LEVELS.findIndex((l) => l.id === lesson.level);
  const ui = LEVELS.findIndex((l) => l.id === s.level);
  if (li < ui) return true; // cấp thấp hơn trình độ đã xếp: mở sẵn để ôn
  const firstOfUserLevel = LESSONS.find((l) => l.level === s.level)?.id;
  if (lessonId === firstOfUserLevel) return true;
  return s.completed.includes(LESSONS[idx - 1].id);
}

/** Ngôn ngữ giao diện: Mất gốc–A2 mặc định tiếng Việt, B1–C1 tiếng Anh */
export function useUiLang(): "vi" | "en" {
  const s = useApp();
  if (s.uiLang !== "auto") return s.uiLang;
  return LEVELS.find((l) => l.id === s.level)!.ui;
}

// ---------------- tra cứu kể cả bài/tình huống do AI tạo ----------------
export function findLesson(s: AppState, id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id) ?? s.customLessons.find((l) => l.id === id);
}
export function findScenario(s: AppState, id: string): Scenario {
  return SCENARIOS.find((x) => x.id === id) ?? s.customScenarios.find((x) => x.id === id) ?? SCENARIOS[0];
}
