"use client";
import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { UnitPicker } from "./UnitPicker";
import { UnitChip } from "./UnitChip";
import { countAllUnits } from "@/lib/economy";
import { findUnit } from "@/lib/data/units";

export function BenchGrid() {
  const bench = useGameStore((s) => s.state.bench);
  const setBenchUnit = useGameStore((s) => s.setBenchUnit);
  const sellBenchUnit = useGameStore((s) => s.sellBenchUnit);
  const promoteUnitStars = useGameStore((s) => s.promoteUnitStars);
  const state = useGameStore((s) => s.state);
  const counts = countAllUnits(state);

  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const [actionIdx, setActionIdx] = useState<number | null>(null);

  const upgradeable = counts.filter((c) => c.canUpgradeToTwoStar);

  return (
    <section className="bg-surface rounded-2xl p-3 border border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold">대기석 (9칸)</h3>
        {upgradeable.length > 0 && (
          <span className="text-[11px] text-emerald-400">
            2성각:{" "}
            {upgradeable
              .slice(0, 3)
              .map((c) => findUnit(c.unitId)?.nameKo ?? c.unitId)
              .join(", ")}
            {upgradeable.length > 3 && " 외"}
          </span>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {bench.map((b) => (
          <UnitChip
            key={b.index}
            unit={b.unit}
            size="sm"
            onClick={() => (b.unit ? setActionIdx(b.index) : setPickerIdx(b.index))}
          />
        ))}
      </div>

      <UnitPicker
        open={pickerIdx !== null}
        onClose={() => setPickerIdx(null)}
        onPick={(unitId, stars) => {
          if (pickerIdx !== null) setBenchUnit(pickerIdx, unitId, stars);
          setPickerIdx(null);
        }}
        title="대기석에 추가"
      />

      {actionIdx !== null && bench[actionIdx]?.unit && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setActionIdx(null)}
        >
          <div
            className="bg-surface w-full sm:max-w-md rounded-t-3xl border-t border-border p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center text-xs text-zinc-500 mb-2">
              {findUnit(bench[actionIdx].unit!.unitId)?.nameKo} ({"★".repeat(bench[actionIdx].unit!.stars)})
            </div>
            <button
              onClick={() => {
                promoteUnitStars("bench", actionIdx);
                setActionIdx(null);
              }}
              className="w-full bg-surface-2 active:bg-background rounded-xl py-3 text-sm"
            >
              별 +1
            </button>
            <button
              onClick={() => {
                setBenchUnit(actionIdx, undefined);
                setActionIdx(null);
              }}
              className="w-full bg-surface-2 active:bg-background rounded-xl py-3 text-sm"
            >
              비우기
            </button>
            <button
              onClick={() => {
                sellBenchUnit(actionIdx);
                setActionIdx(null);
              }}
              className="w-full bg-red-900/40 text-red-200 active:bg-red-900/60 rounded-xl py-3 text-sm font-semibold"
            >
              판매
            </button>
            <button
              onClick={() => setActionIdx(null)}
              className="w-full text-zinc-500 py-2 text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
