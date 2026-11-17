"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Headphones, Mic, MessageCircle, Play, Check, X, Trophy } from "lucide-react";
import { LESSONS, levelById } from "@/lib/data";
import { actions, findLesson, findScenario, isUnlocked, useApp } from "@/lib/store";
import { speak } from "@/lib/speech";
import { useT } from "@/lib/i18n";
import Flashcard from "@/components/Flashcard";
import Shadow from "@/components/Shadow";
import Chat from "@/components/Chat";
import { ProgressBar } from "@/components/ui";
import AiExplain from "@/components/AiExplain";

const STEPS = [
  { icon: BookOpen, vi: "Từ vựng cụm", en: "Vocabulary" },
  { icon: Headphones, vi: "Nghe hiểu", en: "Listening" },
  { icon: Mic, vi: "Nhại âm", en: "Shadowing" },
  { icon: MessageCircle, vi: "Hội thoại", en: "Conversation" },
];

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const s = useApp();
  const t = useT();
  const lesson = findLesson(s, id);
  const [step, setStep] = useState(0);
  const [card, setCard] = useState(0);
  const [showVi, setShowVi] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [shadowScores, setShadowScores] = useState<Record<number, number>>({});
  const [turns, setTurns] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!lesson) return <p>Không tìm thấy bài học. <Link className="text-sky-600" href="/">Về lộ trình</Link></p>;
  if (!isUnlocked(s, lesson.id))
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="text-4xl">🔒</p>
        <p className="mt-2 font-bold">Bài học này chưa mở khóa</p>
        <p className="text-sm text-slate-500">Hoàn thành bài trước trong lộ trình để mở khóa.</p>
        <Link href="/" className="btn-primary mt-4">Về lộ trình</Link>
      </div>
    );

  const level = levelById(lesson.level);
  const scenario = findScenario(s, lesson.scenarioId);
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson = idx >= 0 ? LESSONS[idx + 1] : undefined;
  const avgShadow = Object.values(shadowScores).length
    ? Math.round(Object.values(shadowScores).reduce((a, b) => a + b, 0) / Object.values(shadowScores).length) : 0;

  const canNext = [true, picked !== null, Object.keys(shadowScores).length >= 1, turns >= 2][step];

  function finish() {
    const already = s.completed.includes(lesson!.id);
    actions.completeLesson(lesson!.id, lesson!.vocab);
    actions.addXP(already ? 10 : 50);
    setFinished(true);
  }

  async function playDialogue() {
    for (const line of lesson!.listening.lines) {
      await new Promise<void>((res) => {
        const u = new SpeechSynthesisUtterance(line.en);
        u.lang = "en-US"; u.rate = level.id === "pre" || level.id === "a1" ? 0.75 : 0.9;
        u.onend = () => res(); u.onerror = () => res();
        window.speechSynthesis.speak(u);
      });
    }
  }

  if (finished)
    return (
      <div className="card mx-auto max-w-lg animate-pop p-8 text-center">
        <Trophy className="mx-auto text-amber-500" size={56} />
        <h1 className="mt-3 text-2xl font-extrabold">{t("Hoàn thành bài học!", "Lesson complete!")}</h1>
        <p className="mt-1 text-slate-500">{lesson.titleVi} · {lesson.title}</p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-amber-50 p-3"><p className="text-xl font-extrabold text-amber-600">+50</p>XP</div>
          <div className="rounded-xl bg-sky-50 p-3"><p className="text-xl font-extrabold text-sky-600">{lesson.vocab.length}</p>{t("thẻ mới", "new cards")}</div>
          <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xl font-extrabold text-emerald-600">{avgShadow}%</p>{t("nhại âm", "shadowing")}</div>
        </div>
        <p className="mt-4 text-sm text-slate-500">{t("Từ vựng đã được thêm vào kho Ôn tập SRS.", "Words were added to your SRS review deck.")}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/" className="btn-ghost">{t("Về lộ trình", "Back to path")}</Link>
          {nextLesson && <button onClick={() => router.push(`/lesson/${nextLesson.id}`)} className="btn-primary">{t("Bài tiếp theo", "Next lesson")} <ArrowRight size={16} /></button>}
        </div>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={lesson.id.startsWith("ai-") ? "/create" : "/"} className="icon-btn"><ArrowLeft size={18} /></Link>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500">{level.code} · {level.nameVi} · {lesson.minutes} phút</p>
          <h1 className="text-xl font-extrabold md:text-2xl">{lesson.icon} {t(lesson.titleVi, lesson.title)} {lesson.id.startsWith("ai-") && <span className="chip bg-violet-100 align-middle text-violet-700">✨ AI soạn</span>}</h1>
        </div>
      </div>

      {/* Thanh 4 bước */}
      <div className="card p-3">
        <div className="grid grid-cols-4 gap-1">
          {STEPS.map(({ icon: Icon, vi, en }, i) => (
            <button key={i} onClick={() => i <= step && setStep(i)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold sm:flex-row sm:justify-center sm:text-sm ${i === step ? "bg-sky-50 text-sky-700" : i < step ? "text-emerald-600" : "text-slate-400"}`}>
              {i < step ? <Check size={17} /> : <Icon size={17} />} {t(vi, en)}
            </button>
          ))}
        </div>
        <ProgressBar value={((step + 1) / 4) * 100} className="mt-2" />
      </div>

      {/* Bước 1: Từ vựng */}
      {step === 0 && (
        <section className="space-y-4">
          <p className="text-center text-sm text-slate-500">{t("Thẻ", "Card")} {card + 1}/{lesson.vocab.length} — {t("chạm để lật, nghe và đọc theo", "tap to flip, listen and repeat")}</p>
          <Flashcard front={lesson.vocab[card].en} back={lesson.vocab[card].vi} ipa={lesson.vocab[card].ipa} ex={lesson.vocab[card].ex} exVi={lesson.vocab[card].exVi} />
          <div className="flex justify-center gap-2">
            <button className="btn-ghost" disabled={card === 0} onClick={() => setCard(card - 1)}><ArrowLeft size={16} /></button>
            <button className="btn-ghost" disabled={card === lesson.vocab.length - 1} onClick={() => setCard(card + 1)}><ArrowRight size={16} /></button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {lesson.vocab.map((v, i) => (
                  <tr key={i} onClick={() => setCard(i)} className={`cursor-pointer border-b border-slate-100 last:border-0 ${i === card ? "bg-sky-50" : "hover:bg-slate-50"}`}>
                    <td className="p-3 font-semibold">{v.en}</td>
                    <td className="hidden p-3 font-mono text-sky-600 sm:table-cell">{v.ipa}</td>
                    <td className="p-3 text-slate-600">{v.vi}</td>
                    <td className="p-3 text-right"><div className="flex items-center justify-end gap-1.5"><AiExplain text={v.en} small /><button onClick={(e) => { e.stopPropagation(); speak(v.en); }} className="icon-btn !h-8 !w-8"><Play size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bước 2: Nghe hiểu */}
      {step === 1 && (
        <section className="space-y-4">
          <div className="card space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={playDialogue} className="btn-primary"><Play size={16} /> {t("Nghe cả đoạn", "Play dialogue")}</button>
              <button onClick={() => setShowVi(!showVi)} className="btn-outline">{showVi ? t("Ẩn bản dịch", "Hide translation") : t("Hiện bản dịch", "Show translation")}</button>
            </div>
            <div className="space-y-2">
              {lesson.listening.lines.map((l, i) => (
                <div key={i} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="chip h-fit shrink-0 bg-white text-slate-600 ring-1 ring-slate-200">{l.who}</span>
                  <div className="flex-1">
                    <p className={picked === null ? "blur-[5px] transition hover:blur-0" : ""}>{l.en}</p>
                    {showVi && <p className="text-sm text-slate-500">{l.vi}</p>}
                  </div>
                  <button onClick={() => speak(l.en, { rate: 0.8 })} className="icon-btn !h-8 !w-8"><Play size={14} /></button>
                </div>
              ))}
            </div>
            {picked === null && <p className="text-xs text-slate-400">{t("Lời thoại được làm mờ — hãy nghe trước khi xem.", "Script is blurred — listen first.")}</p>}
          </div>
          <div className="card p-5">
            <p className="font-bold">{lesson.listening.q}</p>
            <p className="text-sm text-slate-500">{lesson.listening.qVi}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {lesson.listening.options.map((o, i) => {
                const right = i === lesson.listening.answer;
                const state = picked === null ? "" : right ? "bg-emerald-50 ring-emerald-400 text-emerald-700" : picked === i ? "bg-rose-50 ring-rose-400 text-rose-700" : "opacity-50";
                return (
                  <button key={i} disabled={picked !== null} onClick={() => { setPicked(i); if (right) actions.addXP(10); }}
                    className={`flex items-center justify-between rounded-xl bg-white p-3 text-left font-medium ring-1 ring-slate-200 ${state}`}>
                    {o} {picked !== null && right && <Check size={16} />} {picked === i && !right && <X size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Bước 3: Nhại âm */}
      {step === 2 && (
        <section className="space-y-3">
          <p className="rounded-xl bg-sky-50 p-3 text-sm text-sky-800">
            🎧 <b>Shadowing:</b> {t("nghe câu mẫu 2–3 lần, rồi bấm micro và đọc theo đúng nhịp, ngữ điệu. Từ xanh = đúng, đỏ = cần luyện lại.", "listen 2–3 times, then press the mic and repeat with the same rhythm. Green = correct, red = practise again.")}
          </p>
          {lesson.shadowing.map((sh, i) => (
            <Shadow key={i} en={sh.en} vi={sh.vi} onScore={(sc) => setShadowScores((m) => ({ ...m, [i]: Math.max(m[i] ?? 0, sc) }))} />
          ))}
        </section>
      )}

      {/* Bước 4: Hội thoại */}
      {step === 3 && (
        <section className="space-y-3">
          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            💬 {t("Đóng vai với Gia sư AI. Trả lời ít nhất 2 lượt để hoàn thành bài. Dùng các cụm từ vừa học nhé!", "Roleplay with the AI tutor. Reply at least twice to finish. Try to use today's phrases!")}
            <span className="mt-1 block text-xs">{t("Từ khóa", "Key phrases")}: {lesson.vocab.map((v) => v.en).join(" · ")}</span>
          </p>
          <Chat scenario={scenario} level={lesson.level} onUserTurn={setTurns} height="h-[45vh]" />
        </section>
      )}

      <div className="flex justify-between">
        <button className="btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {t("Quay lại", "Back")}</button>
        {step < 3 ? (
          <button className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>{t("Tiếp tục", "Continue")} <ArrowRight size={16} /></button>
        ) : (
          <button className="btn-primary" disabled={!canNext} onClick={finish}><Check size={16} /> {t("Hoàn thành bài học", "Finish lesson")}</button>
        )}
      </div>
      {!canNext && <p className="text-right text-xs text-slate-400">
        {[null, t("Chọn đáp án để tiếp tục", "Answer to continue"), t("Thu âm ít nhất 1 câu để tiếp tục", "Record at least one sentence"), t(`Còn ${2 - turns} lượt trả lời`, `${2 - turns} more replies needed`)][step]}
      </p>}
    </div>
  );
}
