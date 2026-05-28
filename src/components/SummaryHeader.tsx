"use client";
import { useGameStore } from "@/store/useGameStore";
import { computeInterest, countRoster } from "@/lib/economy";
import { CHECKPOINTS } from "@/lib/types";

const BOARD_LABEL: Record<string, string> = {
  strong: "강함",
  ambiguous: "애매",
  weak: "약함",
  winStreak: "연승",
  loseStreak: "연패",
};

export function SummaryHeader() {
  const s = useGameStore((st) => st.state);
  const interest = computeInterest(s.gold);
  const counts = countRoster(s.roster);
  const twoStarReady = counts.filter((c) => c.canUpgradeToTwoStar).length;
  const isCp = CHECKPOINTS.includes(s.round);

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-3 pt-2 pb-2">
      <div className="text-base font-bold flex items-center gap-2 flex-wrap">
        <span className="text-accent">{isCp ? `⭐${s.round}` : s.round}</span>
        <span className="text-zinc-600">·</span>
        <span>Lv{s.level}</span>
        <span className="text-zinc-600">·</span>
        <span className="text-accent">{s.gold}골</span>
        <span className="text-zinc-600">·</span>
        <span className={s.hp < 40 ? "text-red-400" : ""}>HP{s.hp}</span>
      </div>
      <div className="text-[11px] text-zinc-400 flex flex-wrap gap-x-2 mt-1">
        <span>{BOARD_LABEL[s.boardState]}</span>
        <span>·</span>
        <span>{interest.tier}골 이자</span>
        <span>·</span>
        <span>유닛 {s.roster.length}</span>
        {s.items.length > 0 && (
          <>
            <span>·</span>
            <span>아이템 {s.items.length}</span>
          </>
        )}
        {twoStarReady > 0 && (
          <>
            <span>·</span>
            <span className="text-emerald-400">2성각 {twoStarReady}</span>
          </>
        )}
      </div>
    </div>
  );
}
