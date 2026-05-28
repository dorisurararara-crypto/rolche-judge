"use client";
import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { SummaryHeader } from "@/components/SummaryHeader";
import { GameStateInput } from "@/components/GameStateInput";
import { RosterInput } from "@/components/RosterInput";
import { AugmentPicker } from "@/components/AugmentPicker";
import { RoadmapCard } from "@/components/RoadmapCard";
import { PlanButton } from "@/components/PlanButton";
import { useGameStore } from "@/store/useGameStore";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const resetGame = useGameStore((s) => s.resetGame);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">롤체 판단기 로딩 중...</div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <SummaryHeader />
      <main className="flex-1 px-3 py-3 space-y-3 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold leading-none">
              <span className="text-accent">롤체</span> 판단기
            </h1>
            <p className="text-[11px] text-zinc-500 mt-1">분기점에서 입력 → 게임 끝까지 운영 로드맵</p>
          </div>
          <button
            onClick={() => {
              if (confirm("게임 상태를 초기화할까요?")) resetGame();
            }}
            className="text-[11px] text-zinc-400 flex items-center gap-1 bg-surface px-2.5 py-1.5 rounded-lg active:bg-surface-2 shrink-0"
          >
            <RotateCcw size={11} /> 새 게임
          </button>
        </div>

        <GameStateInput />
        <RosterInput />
        <AugmentPicker />

        <div id="roadmap" className="scroll-mt-20">
          <RoadmapCard />
        </div>
      </main>
      <PlanButton />
    </div>
  );
}
