"use client";
import { BADGES, LEVELS, lessonsByLevel } from "@/lib/data";
import { actions, useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { ProgressBar } from "@/components/ui";

function last7() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { key: d.toLocaleDateString("en-CA"), label: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()] };
  });
}

export default function ProgressPage() {
  const s = useApp();
  const t = useT();
  const days = last7();
  const speak = days.map((d) => Math.round((s.speakLog[d.key] ?? 0) / 6) / 10); // phút, 1 chữ số thập phân
  const xp = days.map((d) => s.xpLog[d.key] ?? 0);
  const totalSpeak = Math.round(Object.values(s.speakLog).reduce((a, b) => a + b, 0) / 60);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">{t("Tiến độ & Thành tích", "Progress & Achievements")}</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["🔥", `${s.streak}`, t("Chuỗi ngày", "Streak")],
          ["⚡", `${s.xp}`, "XP"],
          ["🗣️", `${totalSpeak} ${t("phút", "min")}`, t("Tổng thời gian nói", "Total speaking")],
          ["📚", `${s.completed.length}`, t("Bài đã học", "Lessons done")],
        ].map(([i, v, l]) => (
          <div key={l} className="card p-4"><p className="text-2xl">{i}</p><p className="text-xl font-extrabold">{v}</p><p className="text-xs text-slate-500">{l}</p></div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Bars title={t("Thời gian nói 7 ngày qua (phút)", "Speaking time, last 7 days (min)")} values={speak} labels={days.map((d) => d.label)} color="from-sky-500 to-cyan-400" />
        <Bars title={t("XP 7 ngày qua", "XP, last 7 days")} values={xp} labels={days.map((d) => d.label)} color="from-emerald-500 to-teal-400" />
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-bold">{t("Tiến độ theo cấp độ", "Progress by level")}</h2>
        <div className="space-y-3">
          {LEVELS.map((l) => {
            const ls = lessonsByLevel(l.id);
            const d = ls.filter((x) => s.completed.includes(x.id)).length;
            return (
              <div key={l.id} className="flex items-center gap-3">
                <span className={`chip w-16 justify-center bg-gradient-to-r ${l.color} text-white`}>{l.code}</span>
                <span className="hidden w-28 text-sm text-slate-600 sm:block">{l.nameVi}</span>
                <ProgressBar value={(d / ls.length) * 100} />
                <span className="w-10 text-right text-xs font-bold">{d}/{ls.length}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-bold">{t("Huy hiệu", "Badges")} ({s.badges.length}/{BADGES.length})</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BADGES.map((b) => {
            const has = s.badges.includes(b.id);
            return (
              <div key={b.id} className={`rounded-2xl p-4 text-center ring-1 ${has ? "bg-gradient-to-br from-amber-50 to-yellow-50 ring-amber-200" : "bg-slate-50 opacity-60 grayscale ring-slate-200"}`}>
                <p className="text-3xl">{b.icon}</p>
                <p className="mt-1 text-sm font-bold">{b.vi}</p>
                <p className="text-[11px] text-slate-500">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-right">
        <button onClick={() => { if (confirm("Xóa toàn bộ tiến độ học trên trình duyệt này?")) actions.reset(); }} className="text-xs text-slate-400 underline hover:text-rose-500">
          {t("Đặt lại tiến độ", "Reset progress")}
        </button>
      </div>
    </div>
  );
}

function Bars({ title, values, labels, color }: { title: string; values: number[]; labels: string[]; color: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-bold">{title}</h2>
      <div className="flex h-40 items-end gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-semibold text-slate-500">{v || ""}</span>
            <div className={`w-full rounded-t-lg bg-gradient-to-t ${color} transition-all`} style={{ height: `${(v / max) * 100}%`, minHeight: v ? 4 : 2 }} />
            <span className="text-[11px] text-slate-500">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
