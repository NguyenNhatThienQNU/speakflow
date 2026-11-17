import { NextResponse } from "next/server";
import { AiError, geminiJSON, getKey, getModel, S } from "@/lib/gemini";

export async function POST(req: Request) {
  const key = getKey(req);
  if (!key) return NextResponse.json({ ok: false, error: "Chưa có khoá Gemini." }, { status: 401 });
  try {
    const t0 = Date.now();
    const r = await geminiJSON<{ greeting: string; vi: string }>({
      key, model: getModel(req),
      system: "You greet Vietnamese English learners warmly in one short English sentence.",
      contents: "Say hello to a new learner.",
      schema: S.obj({ greeting: S.str, vi: S.str }),
    });
    return NextResponse.json({ ok: true, ms: Date.now() - t0, ...r });
  } catch (e) {
    const err = e as AiError;
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status || 500 });
  }
}
