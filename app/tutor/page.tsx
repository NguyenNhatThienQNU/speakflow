"use client";
import { useState } from "react";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { LEVELS, SCENARIOS, levelById, type LevelId, type Scenario } from "@/lib/data";
import { actions, useApp } from "@/lib/store";
import { aiPost, useAiReady } from "@/lib/ai-client";
import { useT } from "@/lib/i18n";
import Chat from "@/components/Chat";

const IDEAS = ["Gọi điện đặt bàn nhà hàng", "Khám bệnh ở phòng khám nước ngoài", "Phụ huynh hỏi giáo viên về con", "Trả hàng bị lỗi ở cửa hàng", "Thuyết trình dự án KHKT với giám khảo"];

export default function TutorPage() {
  const s = useApp();
  const t = useT();
  const ai = useAiReady();
  const all: Scenario[] = [...s.customScenarios.filter((x) => x.id.startsWith("custom-")), ...SCENARIOS];
  const [scId, setScId] = useState(() => (SCENARIOS.find((x) => x.level === s.level) ?? SCENARIOS[0]).id);
  const sc = all.find((x) => x.id === scId) ?? SCENARIOS[0];
  const [level, setLevel] = useState<LevelId | null>(null);
  const talkLevel = level ?? sc.level;

  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function createScenario() {
    if (!desc.trim()) return;
    setBusy(true); setErr("");
    try {
      const { scenario } = await aiPost<{ scenario: Scenario }>("/api/ai/scenario", { description: desc, level: talkLevel });
      actions.addScenario(scenario);
      setScId(scenario.id); setLevel(scenario.level); setDesc("");
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">{t("Gia sư AI hội thoại", "AI Roleplay Tutor")}</h1>
        <p className="text-sm text-slate-500">{t("Chọn tình huống có sẵn hoặc tự mô tả tình huống bạn cần luyện. AI đóng vai, sửa lỗi và gợi ý câu tự nhiên hơn ngay dưới tin nhắn của bạn.", "Pick a scenario or describe your own. The AI stays in character and corrects you under every message.")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {/* Tự tạo tình huống bằng AI */}
          <div className="card space-y-2 bg-gradient-to-br from-violet-50 to-sky-50 p-3">
            <p className="flex items-center gap-1.5 text-sm font-bold text-violet-700"><Sparkles size={15} /> {t("Tự tạo tình huống", "Create your own")}</p>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} disabled={!ai.ready}
              placeholder={ai.ready ? "VD: Tôi đi khám răng ở Úc, cần mô tả bị đau răng hàm" : "Cần khoá Gemini — vào Cài đặt AI"}
              className="w-full resize-none rounded-lg bg-white p-2 text-sm outline-none ring-1 ring-violet-200 focus:ring-2 focus:ring-violet-400" />
            <div className="flex flex-wrap gap-1">
              {IDEAS.map((x) => <button key={x} onClick={() => setDesc(x)} disabled={!ai.ready} className="chip bg-white text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-violet-50">{x}</button>)}
            </div>
            <button onClick={createScenario} disabled={busy || !desc.trim() || !ai.ready} className="btn w-full bg-violet-600 text-white hover:bg-violet-700">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} {t("AI dựng tình huống", "Build with AI")} ({levelById(talkLevel).code})
            </button>
            {err && <p className="text-xs text-rose-600">{err}</p>}
          </div>

          {all.map((x) => {
            const lv = levelById(x.level);
            const custom = x.id.startsWith("custom-");
            return (
              <div key={x.id} className={`card flex w-full items-center gap-3 p-3 transition hover:shadow-md ${x.id === scId ? "ring-2 ring-sky-500" : ""}`}>
                <button onClick={() => { setScId(x.id); setLevel(null); }} className="flex flex-1 items-center gap-3 text-left">
                  <span className="text-2xl">{x.icon}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{x.titleVi}</span>
                    <span className="block text-xs text-slate-500">{custom ? "✨ " : ""}{x.title}</span>
                  </span>
                </button>
                <span className={`chip bg-gradient-to-r ${lv.color} text-white`}>{lv.code}</span>
                {custom && <button onClick={() => { actions.removeScenario(x.id); if (scId === x.id) setScId(SCENARIOS[0].id); }} className="text-slate-300 hover:text-rose-500" aria-label="Xoá"><Trash2 size={15} /></button>}
              </div>
            );
          })}
          <div className="card p-3">
            <label className="text-xs font-bold text-slate-500">{t("Độ khó của AI", "AI difficulty")}</label>
            <select value={talkLevel} onChange={(e) => setLevel(e.target.value as LevelId)} className="mt-1 w-full rounded-lg bg-slate-100 p-2 text-sm">
              {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.code} — {l.nameVi}</option>)}
            </select>
          </div>
        </div>
        <Chat key={sc.id + talkLevel} scenario={sc} level={talkLevel} />
      </div>
    </div>
  );
}
