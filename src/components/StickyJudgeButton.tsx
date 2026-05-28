"use client";
import { Sparkles } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { getJudgeProvider } from "@/lib/judge";

export function StickyJudgeButton() {
  const isJudging = useGameStore((s) => s.isJudging);
  const setIsJudging = useGameStore((s) => s.setIsJudging);
  const setJudgeResult = useGameStore((s) => s.setJudgeResult);
  const state = useGameStore((s) => s.state);

  const run = async () => {
    setIsJudging(true);
    try {
      const provider = getJudgeProvider();
      const res = await provider.judge({ state });
      setJudgeResult(res);
      setTimeout(() => {
        document.getElementById("judge-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (e) {
      console.error(e);
    } finally {
      setIsJudging(false);
    }
  };

  return (
    <div className="sticky bottom-0 z-30 px-3 pb-3 pt-2 bg-gradient-to-t from-background to-transparent">
      <button
        onClick={run}
        disabled={isJudging}
        className="w-full bg-gradient-to-br from-accent to-amber-600 text-black rounded-2xl py-4 font-bold text-base shadow-xl shadow-accent/20 active:opacity-80 flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <Sparkles size={18} />
        {isJudging ? "판단 중..." : "이번 턴 판단"}
      </button>
    </div>
  );
}
