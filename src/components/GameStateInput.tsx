"use client";
import { useGameStore } from "@/store/useGameStore";
import { recommendedLevel } from "@/lib/economy";
import type { RoundCode, BoardState } from "@/lib/types";
import { Minus, Plus } from "lucide-react";

const ROUNDS: RoundCode[] = ["2-1", "2-5", "3-2", "3-5", "4-1", "4-2", "4-5", "5-1", "5-5", "6-1"];
const STAR_ROUNDS = new Set<RoundCode>(["2-1", "3-2", "4-1"]);
const LEVELS = [4, 5, 6, 7, 8, 9, 10];
const HP_BUCKETS: { label: string; value: number }[] = [
  { label: "80+", value: 85 },
  { label: "60~79", value: 70 },
  { label: "40~59", value: 50 },
  { label: "20~39", value: 30 },
  { label: "19↓", value: 15 },
];
const BOARDS: { value: BoardState; label: string }[] = [
  { value: "strong", label: "강함" },
  { value: "ambiguous", label: "애매" },
  { value: "weak", label: "약함" },
  { value: "winStreak", label: "연승" },
  { value: "loseStreak", label: "연패" },
];

export function GameStateInput() {
  const state = useGameStore((s) => s.state);
  const setRound = useGameStore((s) => s.setRound);
  const setLevel = useGameStore((s) => s.setLevel);
  const setGold = useGameStore((s) => s.setGold);
  const bumpGold = useGameStore((s) => s.bumpGold);
  const setHp = useGameStore((s) => s.setHp);
  const setBoardState = useGameStore((s) => s.setBoardState);

  const recLevel = recommendedLevel(state.round);

  return (
    <section className="bg-surface rounded-2xl p-3 border border-border space-y-3">
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="text-xs text-zinc-400">라운드</label>
          <span className="text-[10px] text-zinc-500">자주 쓰는 라운드 ★</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROUNDS.map((r) => (
            <button
              key={r}
              onClick={() => setRound(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                state.round === r ? "bg-accent text-black" : "bg-surface-2 text-zinc-300"
              }`}
            >
              {r}
              {STAR_ROUNDS.has(r) && <span className="ml-0.5 text-accent-2">★</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="text-xs text-zinc-400">레벨</label>
          <span className="text-[10px] text-zinc-500">추천 Lv{recLevel}</span>
        </div>
        <div className="flex gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition ${
                state.level === l
                  ? "bg-accent text-black"
                  : l === recLevel
                    ? "bg-surface-2 text-accent-2 ring-1 ring-accent-2/40"
                    : "bg-surface-2 text-zinc-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1.5 block">골드</label>
        <div className="flex items-stretch gap-1.5">
          <button
            onClick={() => bumpGold(-5)}
            className="px-2 bg-surface-2 rounded-l-xl text-xs font-bold active:bg-surface w-12"
          >
            −5
          </button>
          <button
            onClick={() => bumpGold(-1)}
            className="px-2 bg-surface-2 text-zinc-300 active:bg-surface w-12"
          >
            <Minus size={14} className="mx-auto" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={state.gold}
            onChange={(e) => setGold(parseInt(e.target.value) || 0)}
            className="flex-1 bg-surface-2 text-center text-lg font-bold outline-none focus:ring-2 ring-accent/40"
          />
          <button
            onClick={() => bumpGold(1)}
            className="px-2 bg-surface-2 text-zinc-300 active:bg-surface w-12"
          >
            <Plus size={14} className="mx-auto" />
          </button>
          <button
            onClick={() => bumpGold(5)}
            className="px-2 bg-surface-2 rounded-r-xl text-xs font-bold active:bg-surface w-12"
          >
            +5
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="text-xs text-zinc-400">체력</label>
          <input
            type="number"
            inputMode="numeric"
            value={state.hp}
            onChange={(e) => setHp(parseInt(e.target.value) || 0)}
            className="bg-surface-2 rounded-lg px-2 py-1 text-xs w-16 text-right outline-none focus:ring-2 ring-accent/40"
          />
        </div>
        <div className="flex gap-1.5">
          {HP_BUCKETS.map((b) => (
            <button
              key={b.label}
              onClick={() => setHp(b.value)}
              className={`flex-1 py-1.5 rounded-full text-[11px] font-medium transition ${
                Math.abs(state.hp - b.value) <= 10 ? "bg-accent text-black" : "bg-surface-2 text-zinc-300"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1.5 block">보드 상태</label>
        <div className="flex gap-1.5">
          {BOARDS.map((b) => (
            <button
              key={b.value}
              onClick={() => setBoardState(b.value)}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition ${
                state.boardState === b.value ? "bg-accent text-black" : "bg-surface-2 text-zinc-300"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
