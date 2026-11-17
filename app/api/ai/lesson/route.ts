import { NextResponse } from "next/server";
import { AiError, geminiJSON, getKey, getModel, S } from "@/lib/gemini";
import { levelById, type LevelId, type Lesson, type Scenario } from "@/lib/data";

const LEVEL_SPEC: Record<LevelId, string> = {
  pre: "TRUE BEGINNER (Pre-A1): 1–6 word phrases, survival language, very slow and simple dialogue (2–3 lines).",
  a1: "A1: short everyday sentences, present simple, dialogue of 2–4 short lines.",
  a2: "A2: common phrases, past simple allowed, dialogue of 3–4 lines.",
  b1: "B1: natural conversation with a small problem to solve, phrasal verbs, dialogue of 3–5 lines.",
  b2: "B2: fluent workplace/social language, collocations, hedging, dialogue of 3–5 lines.",
  c1: "C1: idioms, advanced phrasal verbs, nuanced register (formal vs informal), argumentative dialogue of 3–5 lines.",
};

type Gen = Omit<Lesson, "id" | "level" | "scenarioId" | "minutes"> & { scenario: Omit<Scenario, "id" | "level" | "icon"> };

export async function POST(req: Request) {
  const key = getKey(req);
  if (!key) return NextResponse.json({ error: "Chưa có khoá Gemini. Vào Cài đặt để thêm." }, { status: 401 });
  const { level, topic } = (await req.json()) as { level: LevelId; topic: string };
  const lv = levelById(level);
  const pair = S.obj({ en: S.str, vi: S.str });
  try {
    const g = await geminiJSON<Gen>({
      key, model: getModel(req), temperature: 0.9,
      system: `You design 12-minute English SPEAKING lessons for Vietnamese learners. Level: ${lv.code}. ${LEVEL_SPEC[level]}
Produce ONE lesson about the learner's topic, following a 4-step structure:
1) vocab: exactly 6 useful chunks/phrases (not single rare words) with British IPA in slashes, Vietnamese meaning, an example sentence and its Vietnamese translation.
2) listening: a short realistic dialogue ("who" = role name in English), one comprehension question in English + Vietnamese, exactly 3 options, "answer" = index 0–2 of the correct option. Vary the position of the correct answer.
3) shadowing: exactly 3 natural sentences learners should repeat aloud, with Vietnamese.
4) scenario: a roleplay for an AI tutor: title (English), titleVi, aiRole (who the AI plays, in English), goalVi (learner's goal in Vietnamese), opener (AI's first line, English) + openerVi, and 3 hints (possible learner replies) with Vietnamese.
Also: title (English), titleVi, and "icon" = a single emoji.
Use natural, modern English. Vietnamese must be natural and accurate.`,
      contents: `Topic: ${topic}`,
      schema: S.obj({
        title: S.str, titleVi: S.str, icon: S.str,
        vocab: S.arr(S.obj({ en: S.str, ipa: S.str, vi: S.str, ex: S.str, exVi: S.str })),
        listening: S.obj({
          lines: S.arr(S.obj({ who: S.str, en: S.str, vi: S.str })),
          q: S.str, qVi: S.str, options: S.arr(S.str), answer: S.int,
        }),
        shadowing: S.arr(pair),
        scenario: S.obj({
          title: S.str, titleVi: S.str, aiRole: S.str, goalVi: S.str, opener: S.str, openerVi: S.str,
          hints: S.arr(pair),
        }),
      }),
    });
    const id = `ai-${Date.now().toString(36)}`;
    const scenario: Scenario = { ...g.scenario, id: `${id}-sc`, level, icon: g.icon || "✨" };
    const lesson: Lesson = {
      id, level, icon: g.icon || "✨", minutes: 12, title: g.title, titleVi: g.titleVi,
      vocab: g.vocab.slice(0, 8), listening: { ...g.listening, answer: Math.min(Math.max(0, g.listening.answer), g.listening.options.length - 1) },
      shadowing: g.shadowing.slice(0, 4), scenarioId: scenario.id,
    };
    return NextResponse.json({ lesson, scenario });
  } catch (e) {
    const err = e as AiError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
