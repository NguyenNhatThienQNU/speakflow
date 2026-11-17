"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Lock, Play, Flame, Zap, Layers, Mic, MessageCircle, ClipboardCheck, AudioLines, Clock, Sparkles } from "lucide-react";
import { LEVELS, lessonsByLevel, type LevelId } from "@/lib/data";
import { isUnlocked, today, useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { ProgressBar } from "@/components/ui";

export default function Dashboard() {
  const s = useApp();
  const t = useT();
  const [view, setView] = useState<LevelId>(s.level);
  useEffect(() => setView(s.level), [s.level]);

  const level = LEVELS.find((l) => l.id === view)!;
  const lessons = lessonsByLevel(view);
  const done = lessons.filter((l) => s.completed.includes(l.id)).length;
  const due = s.cards.filter((c) => c.due <= Date.now()).length;
  const speakMin = Math.round((s.speakLog[today()] ?? 0) / 60);
  const next = lessons.find((l) => !s.completed.includes(l.id) && isUnlocked(s, l.id));

  return (
    <div className="space-y-6">
      {!s.placementDone && (
        <div className="card flex flex-col items-start gap-3 bg-gradient-to-r from-sky-500 to-emerald-500 p-5 text-white sm:flex-row sm:items-center">
          <ClipboardCheck size={32} />
          <div className="flex-1">
            <p className="text-lg font-bold">Bạn chưa biết mình ở trình độ nào?</p>
            <p className="text-sm text-white/90">Làm bài test đầu vào 5 phút (Nghe + Từ vựng + Đọc to 5 câu) để hệ thống xếp lớp tự động.</p>
          </div>
          <Link href="/placement" className="btn bg-white text-sky-700 hover:bg-sky-50">Làm test ngay</Link>
        </div>
      )}

      {/* Thống kê nhanh */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={<Flame className="text-orange-500" />} label={t("Chuỗi ngày học", "Day streak")} value={`${s.streak} ${t("ngày", "days")}`} />
        <Stat icon={<Zap className="text-amber-500" />} label={t("Điểm kinh nghiệm", "Experience")} value={`${s.xp} XP`} />
        <Stat icon={<Layers className="text-rose-500" />} label={t("Thẻ cần ôn", "Cards due")} value={String(due)} href="/review" />
        <Stat icon={<Clock className="text-sky-500" />} label={t("Thời gian nói hôm nay", "Speaking today")} value={`${speakMin} ${t("phút", "min")}`} />
      </section>

      {/* Chọn cấp độ */}
      <section className="card p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold md:text-2xl">{t("Lộ trình học", "Learning Path")}</h1>
          <span className="text-xs text-slate-500">{t("Trình độ của bạn", "Your level")}: <b>{LEVELS.find((l) => l.id === s.level)!.code}</b></span>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
          {LEVELS.map((l, i) => (
            <button key={l.id} onClick={() => setView(l.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${view === l.id ? `bg-gradient-to-r ${l.color} text-white shadow` : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {l.nameVi} <span className="opacity-80">{l.code}</span>
              {i < LEVELS.length - 1 && <span className="hidden text-slate-400 sm:inline">{view === l.id ? "" : "›"}</span>}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{level.stage} · {level.nameEn}</p>
          <p className="mt-1 text-sm text-slate-700">{level.descVi}</p>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={(done / lessons.length) * 100} />
            <span className="shrink-0 text-xs font-bold text-slate-600">{done}/{lessons.length}</span>
          </div>
        </div>
      </section>

      {/* Bản đồ chặng */}
      <section className="card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#e0f2fe,transparent_40%),radial-gradient(circle_at_80%_90%,#d1fae5,transparent_40%)]" />
        <div className="relative mx-auto flex max-w-md flex-col items-center gap-2">
          {view === "pre" && (
            <MapNode href="/ipa" icon="👄" title="Bảng IPA 44 âm" sub="Khẩu hình · nghe mẫu · thu âm" state="open" offset={0} />
          )}
          {lessons.map((l, i) => {
            const completed = s.completed.includes(l.id);
            const unlocked = isUnlocked(s, l.id);
            const offset = [0, 1, 0, -1][(i + (view === "pre" ? 1 : 0)) % 4];
            return (
              <MapNode key={l.id} href={unlocked ? `/lesson/${l.id}` : undefined} icon={l.icon}
                title={t(l.titleVi, l.title)} sub={`${t(l.title, l.titleVi)} · ${l.minutes} ${t("phút", "min")}`}
                state={completed ? "done" : unlocked ? (next?.id === l.id ? "current" : "open") : "locked"} offset={offset} />
            );
          })}
          <div className="mt-2 text-center text-xs text-slate-500">
            🏁 {t("Hoàn thành tất cả để nhận huy hiệu Lên cấp", "Finish all to earn the Level-up badge")}
          </div>
        </div>
      </section>

      {/* Bài học AI soạn */}
      <section className="card flex flex-col gap-3 bg-gradient-to-r from-violet-50 to-sky-50 p-5 sm:flex-row sm:items-center">
        <Sparkles className="text-violet-500" size={30} />
        <div className="flex-1">
          <p className="font-bold">{t("Muốn luyện chủ đề riêng?", "Want your own topic?")}</p>
          <p className="text-sm text-slate-600">{t("AI soạn ngay một bài học 4 bước theo chủ đề và trình độ bạn chọn.", "AI builds a 4-step lesson on any topic at your level.")}
            {s.customLessons.length > 0 && <> {t("Bạn đang có", "You have")} <b>{s.customLessons.length}</b> {t("bài AI.", "AI lessons.")}</>}</p>
        </div>
        <Link href="/create" className="btn bg-violet-600 text-white hover:bg-violet-700"><Sparkles size={16} /> {t("Tạo bài bằng AI", "Create with AI")}</Link>
      </section>

      {/* Truy cập nhanh */}
      <section className="grid gap-3 md:grid-cols-3">
        <Quick href="/tutor" icon={<MessageCircle />} title={t("Gia sư AI hội thoại", "AI Roleplay Tutor")} desc={t("Đóng vai tình huống thực tế, sửa lỗi tức thì", "Real-life roleplay with instant feedback")} />
        <Quick href="/pronunciation" icon={<Mic />} title={t("Phòng luyện phát âm", "Pronunciation Lab")} desc={t("Thu âm, tô màu từng từ đúng/sai", "Record and see each word scored")} />
        <Quick href="/ipa" icon={<AudioLines />} title={t("Bảng phiên âm IPA", "IPA Chart")} desc={t("44 âm kèm khẩu hình và mẹo cho người Việt", "44 sounds with mouth shapes")} />
      </section>
    </div>
  );
}

function Stat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <div className="card flex items-center gap-3 p-4 transition hover:shadow-md">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-50">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-extrabold">{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function MapNode({ href, icon, title, sub, state, offset }: { href?: string; icon: string; title: string; sub: string; state: "done" | "current" | "open" | "locked"; offset: number }) {
  const ring = state === "done" ? "ring-emerald-400 bg-emerald-50" : state === "current" ? "ring-sky-500 bg-sky-50 ring-4 animate-pulse" : state === "open" ? "ring-sky-300 bg-white" : "ring-slate-200 bg-slate-100 grayscale";
  const body = (
    <div className="flex flex-col items-center gap-1.5" style={{ transform: `translateX(${offset * 70}px)` }}>
      <div className={`relative grid h-20 w-20 place-items-center rounded-full text-3xl shadow-md ring-2 transition hover:scale-105 ${ring}`}>
        {icon}
        <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white shadow ring-1 ring-slate-200">
          {state === "done" ? <Check size={15} className="text-emerald-500" /> : state === "locked" ? <Lock size={13} className="text-slate-400" /> : <Play size={13} className="text-sky-500" fill="currentColor" />}
        </span>
      </div>
      <p className="max-w-[180px] text-center text-sm font-bold leading-tight">{title}</p>
      <p className="max-w-[200px] text-center text-[11px] text-slate-500">{sub}</p>
      <div className="h-6 w-0.5 bg-slate-200" />
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : <div className="cursor-not-allowed opacity-70" title="Hoàn thành bài trước để mở khóa">{body}</div>;
}

function Quick({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href} className="card group flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white">{icon}</div>
      <div>
        <p className="font-bold group-hover:text-sky-700">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </Link>
  );
}
