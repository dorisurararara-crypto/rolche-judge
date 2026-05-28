"use client";
import { Compass } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { buildRoadmap } from "@/lib/roadmap";

export function PlanButton() {
  const isPlanning = useGameStore((s) => s.isPlanning);
  const setIsPlanning = useGameStore((s) => s.setIsPlanning);
  const setRoadmap = useGameStore((s) => s.setRoadmap);
  const state = useGameStore((s) => s.state);

  const run = () => {
    setIsPlanning(true);
    // 룰베이스라 동기지만 UX 위해 살짝 지연
    setTimeout(() => {
      setRoadmap(buildRoadmap(state));
      setIsPlanning(false);
      setTimeout(() => {
        document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }, 120);
  };

  return (
    <div className="sticky bottom-0 z-30 px-3 pb-3 pt-2 bg-gradient-to-t from-background via-background to-transparent">
      <button
        onClick={run}
        disabled={isPlanning}
        className="w-full bg-gradient-to-br from-accent to-amber-600 text-black rounded-2xl py-4 font-bold text-base shadow-xl shadow-accent/20 active:opacity-80 flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <Compass size={18} />
        {isPlanning ? "로드맵 짜는 중..." : "운영 로드맵 받기"}
      </button>
    </div>
  );
}
