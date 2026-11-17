import { NextResponse } from "next/server";
import { AiError, geminiJSON, getKey, getModel, S } from "@/lib/gemini";

export interface PronFeedback {
  summaryVi: string;
  issues: { word: string; heard: string; ipa: string; tipVi: string }[];
  drill: { en: string; vi: string };
  encouragementVi: string;
}

export async function POST(req: Request) {
  const key = getKey(req);
  if (!key) return NextResponse.json({ error: "Chưa có khoá Gemini. Vào Cài đặt để thêm." }, { status: 401 });
  const { target, spoken, missed } = (await req.json()) as { target: string; spoken: string; missed: string[] };
  try {
    const out = await geminiJSON<PronFeedback>({
      key, model: getModel(req), temperature: 0.4,
      system: `You are a pronunciation coach for Vietnamese learners of English.
You receive a TARGET sentence, what the speech recogniser HEARD, and the words it did not match.
Infer the most likely pronunciation problems typical of Vietnamese speakers (dropped final consonants like /t d s z k/, /θ ð/ → t/d/z, /ʃ/ vs /s/, /r/ vs /z/, missing linking, flat word stress, long vs short vowels).
Be concrete and kind. All explanations in VIETNAMESE. Give IPA for each problem word.
"issues": at most 4 items, most important first; empty if the reading was perfect.
"drill": one short English practice phrase targeting the main problem, with Vietnamese meaning.`,
      contents: `TARGET: "${target}"\nHEARD: "${spoken}"\nUNMATCHED WORDS: ${missed.length ? missed.join(", ") : "(none)"}`,
      schema: S.obj({
        summaryVi: S.str,
        issues: S.arr(S.obj({ word: S.str, heard: S.str, ipa: S.str, tipVi: S.str })),
        drill: S.obj({ en: S.str, vi: S.str }),
        encouragementVi: S.str,
      }),
    });
    return NextResponse.json(out);
  } catch (e) {
    const err = e as AiError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
