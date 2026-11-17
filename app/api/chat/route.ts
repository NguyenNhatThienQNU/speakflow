import { NextResponse } from "next/server";
import { levelById, scenarioById, type LevelId, type Scenario } from "@/lib/data";
import { mockReply } from "@/lib/mock-tutor";
import { AiError, geminiJSON, getKey, getModel, S, type Content } from "@/lib/gemini";

export const runtime = "nodejs";

interface Body {
  scenarioId: string;
  /** Tình huống do người dùng tự tạo hoặc do AI soạn (không có trong dữ liệu mẫu) */
  scenario?: Scenario;
  level: LevelId;
  history: { role: "ai" | "user"; text: string }[];
  userText: string;
}

export interface TutorResponse {
  reply: string;
  replyVi: string;
  correction: { hasError: boolean; corrected: string; natural: string; explanationVi: string };
  suggestions: { en: string; vi: string }[];
  mock?: boolean;
}

const LEVEL_GUIDE: Record<LevelId, string> = {
  pre: "The learner is a TRUE BEGINNER (Pre-A1). Use 3–8 word sentences, only the most common words, present simple. One short question per turn.",
  a1: "The learner is A1. Use short simple sentences (max 12 words), everyday vocabulary, present simple/continuous.",
  a2: "The learner is A2. Use simple sentences, common phrases, past simple allowed. Max 2 sentences.",
  b1: "The learner is B1. Natural conversational English, some phrasal verbs, max 3 sentences. Introduce small complications in the scenario.",
  b2: "The learner is B2. Natural, fluent English with collocations, follow-up questions that push for detail and justification.",
  c1: "The learner is C1. Sophisticated, nuanced English with idioms and advanced phrasal verbs. Challenge their arguments rigorously, vary register.",
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const sc: Scenario = body.scenario ?? scenarioById(body.scenarioId) ?? scenarioById("meet");
  const lv = levelById(body.level);
  const key = getKey(req);

  if (!key) return NextResponse.json({ ...mockReply(sc.id, body.history.length, body.userText, sc.hints), mock: true });

  const system = `You are an English speaking tutor for Vietnamese learners, playing a roleplay.
ROLE: You are ${sc.aiRole}. Scenario: "${sc.title}". Learner goal: ${sc.goalVi}
LEVEL: ${LEVEL_GUIDE[body.level]} (${lv.code})
RULES:
- Stay in character and respond to what the learner actually said. Keep the conversation going with ONE question or prompt at the end.
- If the learner writes in Vietnamese or is stuck, gently help them say it in English (inside "reply"), then continue.
- Never write Vietnamese in "reply".
- Analyse ONLY the learner's latest message for grammar, word choice and naturalness. Ignore missing final punctuation and capitalisation of the first word (it may come from speech recognition).
- "corrected": the grammatically correct version (same meaning). If there is no real error, repeat it unchanged and set hasError=false.
- "natural": how a native speaker would naturally say it at this level (may equal corrected).
- "explanationVi": short, friendly explanation IN VIETNAMESE of the main error, or a specific compliment if correct. Max 2 sentences.
- "replyVi": natural Vietnamese translation of your reply.
- "suggestions": 3 possible next answers for the learner at their level, each with Vietnamese translation.`;

  const contents: Content[] = [
    ...body.history.map((m) => ({ role: (m.role === "ai" ? "model" : "user") as Content["role"], parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: body.userText }] },
  ];
  // Gemini yêu cầu lượt đầu tiên là "user"
  if (contents[0]?.role === "model") contents.unshift({ role: "user", parts: [{ text: "(Start the roleplay.)" }] });

  try {
    const out = await geminiJSON<TutorResponse>({
      key, model: getModel(req), system, contents, temperature: 0.8,
      schema: S.obj({
        reply: S.str,
        replyVi: S.str,
        correction: S.obj({ hasError: S.bool, corrected: S.str, natural: S.str, explanationVi: S.str }),
        suggestions: S.arr(S.obj({ en: S.str, vi: S.str })),
      }),
    });
    return NextResponse.json(out);
  } catch (e) {
    const err = e as AiError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
