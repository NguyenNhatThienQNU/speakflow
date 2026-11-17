import { NextResponse } from "next/server";
import { AiError, geminiJSON, getKey, getModel, S } from "@/lib/gemini";
import { levelById, type LevelId, type Scenario } from "@/lib/data";

/** Người học mô tả một tình huống bất kỳ → AI dựng kịch bản đóng vai */
export async function POST(req: Request) {
  const key = getKey(req);
  if (!key) return NextResponse.json({ error: "Chưa có khoá Gemini. Vào Cài đặt để thêm." }, { status: 401 });
  const { description, level } = (await req.json()) as { description: string; level: LevelId };
  const lv = levelById(level);
  const pair = S.obj({ en: S.str, vi: S.str });
  try {
    const g = await geminiJSON<Omit<Scenario, "id" | "level">>({
      key, model: getModel(req), temperature: 0.8,
      system: `Turn a Vietnamese learner's description of a real-life situation into an English speaking roleplay at level ${lv.code}.
Return: icon (one emoji), title (English), titleVi, aiRole (who the AI plays, in English, with a name and attitude), goalVi (what the learner must achieve, Vietnamese),
opener (the AI character's first line, in English, suitable for ${lv.code}) + openerVi, and 3 hints (possible learner replies at ${lv.code}) with Vietnamese.`,
      contents: description,
      schema: S.obj({ icon: S.str, title: S.str, titleVi: S.str, aiRole: S.str, goalVi: S.str, opener: S.str, openerVi: S.str, hints: S.arr(pair) }),
    });
    const scenario: Scenario = { ...g, id: `custom-${Date.now().toString(36)}`, level };
    return NextResponse.json({ scenario });
  } catch (e) {
    const err = e as AiError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
