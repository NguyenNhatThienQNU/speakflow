import { NextResponse } from "next/server";
import { AiError, geminiJSON, getKey, getModel, normalizeAudioInput, S } from "@/lib/gemini";

export const runtime = "nodejs";

export interface TranscribeResponse {
  text: string;
  noSpeech: boolean;
}

const SYSTEM = `You are a highly accurate bilingual speech-to-text transcriber for Vietnamese learners practicing English conversation.
Listen carefully to the audio and transcribe verbatim what the speaker actually said into "text".
- The speaker may speak English, Vietnamese, or a mix of both languages. Transcribe each language accurately using proper spelling and punctuation.
- Keep what they actually said — do NOT translate Vietnamese into English and do NOT rewrite or correct their grammar.
- If the audio is silent or contains only background noise with no clear words, set "noSpeech": true and "text": "".`;

export async function POST(req: Request) {
  const key = getKey(req);
  if (!key) return NextResponse.json({ error: "Chưa có khoá Gemini. Vào Cài đặt AI để thêm." }, { status: 401 });

  try {
    const body = (await req.json()) as { audioBase64?: string; mimeType?: string; scenarioTitle?: string };
    const audio = normalizeAudioInput(body.audioBase64, body.mimeType);

    const out = await geminiJSON<TranscribeResponse>({
      key,
      model: getModel(req),
      temperature: 0.1,
      system: SYSTEM,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: audio.mimeType, data: audio.data } },
            { text: body.scenarioTitle ? `Conversation topic: "${body.scenarioTitle}". Transcribe faithfully.` : "Transcribe faithfully." },
          ],
        },
      ],
      schema: S.obj({
        text: S.str,
        noSpeech: S.bool,
      }),
    });
    return NextResponse.json(out);
  } catch (e) {
    const err = e as AiError;
    return NextResponse.json({ error: err.message || "Không thể nhận diện giọng nói." }, { status: err.status || 500 });
  }
}
