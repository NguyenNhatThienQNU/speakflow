import { NextResponse } from "next/server";
import { AiError, geminiJSON, getKey, getModel, S } from "@/lib/gemini";

export interface Explain {
  ipa: string;
  meaningVi: string;
  usageVi: string;
  register: string;
  examples: { en: string; vi: string }[];
  collocations: string[];
  confusedWith: string;
}

export async function POST(req: Request) {
  const key = getKey(req);
  if (!key) return NextResponse.json({ error: "Chưa có khoá Gemini. Vào Cài đặt để thêm." }, { status: 401 });
  const { text, level } = (await req.json()) as { text: string; level: string };
  try {
    const out = await geminiJSON<Explain>({
      key, model: getModel(req), temperature: 0.5,
      system: `You explain English words/phrases to Vietnamese learners at level ${level}.
All explanations in VIETNAMESE except examples and collocations.
- ipa: British IPA in slashes.
- usageVi: when and how to use it, 1–2 sentences.
- register: one of "trang trọng", "trung tính", "thân mật", "tiếng lóng".
- examples: 3 natural example sentences suitable for level ${level}, each with Vietnamese translation.
- collocations: 3–5 common collocations.
- confusedWith: a word Vietnamese learners often confuse it with and the difference (Vietnamese), or "" if none.`,
      contents: text,
      schema: S.obj({
        ipa: S.str, meaningVi: S.str, usageVi: S.str, register: S.str,
        examples: S.arr(S.obj({ en: S.str, vi: S.str })),
        collocations: S.arr(S.str), confusedWith: S.str,
      }),
    });
    return NextResponse.json(out);
  } catch (e) {
    const err = e as AiError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
