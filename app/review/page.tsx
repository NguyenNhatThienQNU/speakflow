"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PartyPopper } from "lucide-react";
import { actions, useApp, type SrsCard } from "@/lib/store";
import { useT } from "@/lib/i18n";
import Flashcard from "@/components/Flashcard";
import AiExplain from "@/components/AiExplain";

const GRADES = [
  { g: 0 as const, vi: "Quên", en: "Again", cls: "bg-rose-500" },
  { g: 1 as const, vi: "Khó", en: "Hard", cls: "bg-amber-500" },
  { g: 2 as const, vi: "Tốt", en: "Good", cls: "bg-sky-500" },
  { g: 3 as const, vi: "Dễ", en: "Easy", cls: "bg-emerald-500" },
];

function preview(c: SrsCard, g: 0 | 1 | 2 | 3) {
  if (g === 0) return "1 phút";
  const reps = c.reps + 1;
  const d = g === 1 ? Math.max(1, c.interval * 1.2) : g === 2 ? (reps === 1 ? 1 : reps === 2 ? 3 : c.interval * c.ease) : reps === 1 ? 4 : c.interval * c.ease * 1.3;
  return d < 30 ? `${Math.round(d)} ngày` : `${Math.round(d / 30)} tháng`;
}

export default function ReviewPage() {
  const s = useApp();
  const t = useT();
  const [filter, setFilter] = useState<"all" | "vocab" | "mistake">("all");
  const [sessionDone, setSessionDone] = useState(0);
  const due = useMemo(
    () => s.cards.filter((c) => c.due <= Date.now() && (filter === "all" || c.kind === filter)).sort((a, b) => a.due - b.due),
    [s.cards, filter],
  );
  const card = due[0];
  const mistakes = s.cards.filter((c) => c.kind === "mistake").length;

  function grade(g: 0 | 1 | 2 | 3) {
    actions.reviewCard(card.id, g);
    actions.addXP(g === 0 ? 1 : 3);
    setSessionDone((n) => n + 1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">{t("Ôn tập thông minh (SRS)", "Smart Review (SRS)")}</h1>
        <p className="text-sm text-slate-500">{t("Từ vựng mới và các câu bạn nói sai được tự động gom lại, nhắc ôn theo chu kỳ lặp lại ngắt quãng.", "New words and your mistakes are collected automatically and scheduled with spaced repetition.")}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center"><p className="text-2xl font-extrabold">{s.cards.length}</p><p className="text-xs text-slate-500">{t("Tổng số thẻ", "Total cards")}</p></div>
        <div className="card p-4 text-center"><p className="text-2xl font-extrabold text-rose-500">{s.cards.filter((c) => c.due <= Date.now()).length}</p><p className="text-xs text-slate-500">{t("Đến hạn ôn", "Due now")}</p></div>
        <div className="card p-4 text-center"><p className="text-2xl font-extrabold text-amber-500">{mistakes}</p><p className="text-xs text-slate-500">{t("Câu từng nói sai", "Past mistakes")}</p></div>
      </div>

      <div className="flex gap-2">
        {(["all", "vocab", "mistake"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`chip px-3 py-1.5 text-sm ${filter === f ? "bg-sky-500 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
            {{ all: t("Tất cả", "All"), vocab: t("Từ vựng", "Vocabulary"), mistake: t("Lỗi sai", "Mistakes") }[f]}
          </button>
        ))}
        {sessionDone > 0 && <span className="ml-auto text-sm text-slate-500">{t("Đã ôn", "Reviewed")}: <b>{sessionDone}</b></span>}
      </div>

      {card ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-slate-500">{t("Còn", "Remaining")} {due.length} {t("thẻ", "cards")}</p>
          {card.kind === "mistake" ? (
            <Flashcard tag="Lỗi sai" front={card.front} back={card.back} ex={card.ex} />
          ) : (
            <Flashcard tag="Từ vựng" front={card.front} back={card.back} ipa={card.ipa} ex={card.ex} exVi={card.exVi} />
          )}
          {card.kind === "vocab" && <div className="text-center"><AiExplain text={card.front} /></div>}
          {card.kind === "mistake" && <p className="text-center text-xs text-slate-500">{t("Mặt trước là câu bạn từng nói. Hãy tự sửa trong đầu rồi lật thẻ để kiểm tra.", "Front: what you said. Fix it in your head, then flip.")}</p>}
          <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
            {GRADES.map(({ g, vi, en, cls }) => (
              <button key={g} onClick={() => grade(g)} className={`btn ${cls} flex-col !gap-0 text-white hover:brightness-110`}>
                {t(vi, en)}<span className="text-[10px] font-normal opacity-90">{preview(card, g)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center">
          <PartyPopper className="mx-auto text-emerald-500" size={48} />
          <p className="mt-3 text-lg font-bold">{s.cards.length ? t("Bạn đã ôn hết thẻ đến hạn hôm nay!", "All caught up for today!") : t("Chưa có thẻ nào", "No cards yet")}</p>
          <p className="text-sm text-slate-500">{s.cards.length ? t("Quay lại sau để ôn tiếp nhé.", "Come back later.") : t("Hoàn thành một bài học hoặc trò chuyện với Gia sư AI để tạo thẻ.", "Finish a lesson or chat with the AI tutor to create cards.")}</p>
          <Link href="/" className="btn-primary mt-4">{t("Học bài mới", "Start a lesson")}</Link>
        </div>
      )}
    </div>
  );
}
