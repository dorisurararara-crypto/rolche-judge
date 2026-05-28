"use client";
import { useGameStore } from "@/store/useGameStore";
import { computeInterest, countAllUnits, directionScore, dominantDirection } from "@/lib/economy";

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
  const dir = directionScore(s);
  const dominant = dominantDirection(dir);
  const counts = countAllUnits(s);

  const fieldCount = s.board.filter((b) => b.unit).length;
  const benchCount = s.bench.filter((b) => b.unit).length;
  const shopFilled = s.shop.filter((sl) => sl.unitId).length;
  const itemCount = s.benchItems.length + s.board.flatMap((b) => b.unit?.items ?? []).length + s.bench.flatMap((b) => b.unit?.items ?? []).length;
  const twoStarReady = counts.filter((c) => c.canUpgradeToTwoStar).length;

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-3 pt-2 pb-2">
      <div className="text-base font-bold flex items-center gap-2">
        <span className="text-accent">{s.round}</span>
        <span className="text-zinc-500">·</span>
        <span>Lv{s.level}</span>
        <span className="text-zinc-500">·</span>
        <span className="text-accent">{s.gold}골</span>
        <span className="text-zinc-500">·</span>
        <span className={s.hp < 40 ? "text-red-400" : ""}>HP{s.hp}</span>
      </div>
      <div className="text-[11px] text-zinc-400 flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
        <span>{BOARD_LABEL[s.boardState]}</span>
        <span>·</span>
        <span>{interest.tier}골 이자</span>
        <span>·</span>
        <span>방향 {dominant}</span>
        <span>·</span>
        <span>필드 {fieldCount}</span>
        <span>·</span>
        <span>대기 {benchCount}</span>
        <span>·</span>
        <span>상점 {shopFilled}/5</span>
        <span>·</span>
        <span>아이템 {itemCount}</span>
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
