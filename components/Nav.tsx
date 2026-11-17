"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Mic, MessageCircle, Layers, BarChart3, ClipboardCheck, AudioLines, Flame, Zap, Languages, Sparkles, Settings } from "lucide-react";
import { useAiReady } from "@/lib/ai-client";
import { actions, useApp, useUiLang } from "@/lib/store";
import { levelById } from "@/lib/data";

const ITEMS = [
  { href: "/", icon: Map, vi: "Lộ trình", en: "Path" },
  { href: "/ipa", icon: AudioLines, vi: "Bảng IPA", en: "IPA" },
  { href: "/tutor", icon: MessageCircle, vi: "Gia sư AI", en: "AI Tutor" },
  { href: "/pronunciation", icon: Mic, vi: "Phát âm", en: "Pronounce" },
  { href: "/review", icon: Layers, vi: "Ôn tập", en: "Review" },
  { href: "/progress", icon: BarChart3, vi: "Tiến độ", en: "Progress" },
];

export default function Nav() {
  const path = usePathname();
  const s = useApp();
  const lang = useUiLang();
  const ai = useAiReady();
  const due = s.cards.filter((c) => c.due <= Date.now()).length;
  const lv = levelById(s.level);
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/lesson") : path.startsWith(href));
  const nextLang = lang === "vi" ? "en" : "vi";

  return (
    <>
      {/* Thanh bên — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white/90 p-5 backdrop-blur md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-lg font-black text-white">S</span>
          <span>
            <span className="block text-lg font-extrabold leading-none">SpeakFlow</span>
            <span className="text-xs text-slate-500">Mất gốc → C1</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {ITEMS.map(({ href, icon: Icon, vi, en }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active(href) ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <Icon size={19} /> {lang === "vi" ? vi : en}
              {href === "/review" && due > 0 && <span className="ml-auto chip bg-rose-100 text-rose-600">{due}</span>}
            </Link>
          ))}
          <Link href="/placement"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active("/placement") ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <ClipboardCheck size={19} /> {lang === "vi" ? "Test đầu vào" : "Placement test"}
          </Link>
          <Link href="/create"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active("/create") ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Sparkles size={19} /> {lang === "vi" ? "Tạo bài bằng AI" : "AI lesson maker"}
          </Link>
          <Link href="/settings"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active("/settings") ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Settings size={19} /> {lang === "vi" ? "Cài đặt AI" : "AI settings"}
            <span className={`ml-auto h-2 w-2 rounded-full ${ai.ready ? "bg-emerald-500" : "bg-amber-400"}`} title={ai.ready ? "AI đã bật" : "Chưa có khoá Gemini"} />
          </Link>
        </nav>
        <div className="mt-auto space-y-3">
          <div className="flex gap-2">
            <span className="chip bg-orange-50 text-orange-600"><Flame size={14} /> {s.streak}</span>
            <span className="chip bg-amber-50 text-amber-600"><Zap size={14} /> {s.xp} XP</span>
            <span className={`chip bg-gradient-to-r ${lv.color} text-white`}>{lv.code}</span>
          </div>
          <button onClick={() => actions.setUiLang(nextLang)} className="btn-ghost w-full text-xs">
            <Languages size={15} /> {lang === "vi" ? "Giao diện: Tiếng Việt" : "Interface: English"}
          </button>
        </div>
      </aside>

      {/* Thanh trên — mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-white">S</span>
          SpeakFlow
        </Link>
        <div className="flex items-center gap-2">
          <span className="chip bg-orange-50 text-orange-600"><Flame size={14} /> {s.streak}</span>
          <span className="chip bg-amber-50 text-amber-600"><Zap size={14} /> {s.xp}</span>
          <Link href="/settings" className={`chip ${ai.ready ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`} aria-label="Cài đặt AI"><Sparkles size={14} /> AI</Link>
          <button onClick={() => actions.setUiLang(nextLang)} className="chip bg-slate-100 text-slate-600" aria-label="Đổi ngôn ngữ">
            {lang.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Thanh dưới — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        {ITEMS.map(({ href, icon: Icon, vi, en }) => (
          <Link key={href} href={href}
            className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${active(href) ? "text-sky-600" : "text-slate-500"}`}>
            <Icon size={20} />
            {lang === "vi" ? vi : en}
            {href === "/review" && due > 0 && <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-rose-500" />}
          </Link>
        ))}
      </nav>
    </>
  );
}
