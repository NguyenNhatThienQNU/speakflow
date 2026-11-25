import { NextResponse } from "next/server";
import { AiError, geminiJSON, getKey, getModel, normalizeAudioInput, S } from "@/lib/gemini";

export const runtime = "nodejs";

export interface AssessAudioResponse {
  heard: string;
  noSpeech: boolean;
  summaryVi: string;
  issues: { word: string; heard: string; ipa: string; tipVi: string }[];
  drill: { en: string; vi: string };
  encouragementVi: string;
}

const SYSTEM = `You are an expert English speech recognizer and pronunciation coach for Vietnamese learners.
Listen carefully to the audio recording and compare it honestly against the TARGET English text.

TRANSCRIPTION RULES:
1. Put strictly what English words/sounds you actually hear in "heard" (plain English text, no IPA, no extra notes).
2. NEVER copy TARGET into "heard" if the speaker said a different word or mispronounced a minimal pair (e.g. ship vs sheep, sit vs seat, think vs sink, three vs tree, bed vs bad, cat vs cut, walk vs work, fan vs van, light vs right).
3. If the speaker said the target word with a mild Vietnamese accent that is still clearly recognizable as that English word, put that word in "heard" and describe any subtle ending/vowel polish inside "issues".
4. If the recording is silent, breathing, or pure background noise with no intelligible speech, set "noSpeech": true and "heard": "".
5. If the speaker spoke Vietnamese instead of English, put what they said in "heard" and explain gently in Vietnamese in "summaryVi".

COACHING RULES (all explanation fields in natural, friendly VIETNAMESE):
- Focus on real audible features typical of Vietnamese learners: dropped final consonants (/t d s z k p/), /θ ð/ pronounced as /t d z/, /ʃ/ vs /s/, /r/ vs /z/, short vs long vowels (/ɪ/ vs /iː/, /æ/ vs /e/), and word stress.
- "summaryVi": 1–2 short sentences evaluating clarity and accuracy.
- "issues": at most 3 items for words with audible mistakes or accent issues (empty [] if clear and accurate). Each item: "word", "heard" (what it sounded like), "ipa" (correct IPA), "tipVi" (concrete mouth/tongue/airflow instruction in Vietnamese).
- "drill": one short English practice phrase targeting the main issue (or natural follow-up), with Vietnamese translation "vi".
- "encouragementVi": 1 short encouraging sentence in Vietnamese.`;

export async function POST(req: Request) {
  const key = getKey(req);
  if (!key) return NextResponse.json({ error: "Chưa có khoá Gemini. Vào Cài đặt AI để thêm." }, { status: 401 });

  try {
    const body = (await req.json()) as { audioBase64?: string; mimeType?: string; target?: string; level?: string };
    const target = (body.target ?? "").trim();
    if (!target) return NextResponse.json({ error: "Thiếu câu mẫu cần kiểm tra." }, { status: 400 });
    const audio = normalizeAudioInput(body.audioBase64, body.mimeType);

    const out = await geminiJSON<AssessAudioResponse>({
      key,
      model: getModel(req),
      temperature: 0.15,
      system: SYSTEM,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: audio.mimeType, data: audio.data } },
            { text: `TARGET: "${target}"${body.level ? `\nLEARNER LEVEL: ${body.level}` : ""}` },
          ],
        },
      ],
      schema: S.obj({
        heard: S.str,
        noSpeech: S.bool,
        summaryVi: S.str,
        issues: S.arr(S.obj({ word: S.str, heard: S.str, ipa: S.str, tipVi: S.str })),
        drill: S.obj({ en: S.str, vi: S.str }),
        encouragementVi: S.str,
      }),
    });
    return NextResponse.json(out);
  } catch (e) {
    const err = e as AiError;
    return NextResponse.json({ error: err.message || "Không thể phân tích âm thanh." }, { status: err.status || 500 });
  }
}
