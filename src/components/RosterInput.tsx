"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { findUnit } from "@/lib/data/units";
import { countRoster } from "@/lib/economy";
import { UnitPicker } from "./UnitPicker";

export function RosterInput() {
  const roster = useGameStore((s) => s.state.roster);
  const addUnit = useGameStore((s) => s.addRosterUnit);
  const removeUnit = useGameStore((s) => s.removeRosterUnit);
  const cycleStars = useGameStore((s) => s.cycleRosterStars);
  const [pickerOpen, setPickerOpen] = useState(false);

  const counts = countRoster(roster);
  const twoStarReady = counts.filter((c) => c.canUpgradeToTwoStar);

  return (
    <section className="bg-surface rounded-2xl p-3 border border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold">보유 유닛 (탭해서 추가)</h3>
        <span className="text-[10px] text-zinc-500">유닛 탭 = 별 변경</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {roster.map((u) => {
          const def = findUnit(u.unitId);
          if (!def) return null;
          const starColor = u.stars === 3 ? "text-amber-400" : u.stars === 2 ? "text-yellow-200" : "text-zinc-400";
          return (
            <div
              key={u.instanceId}
              className={`flex items-center gap-1 rounded-lg bg-surface-2 ring-cost-${def.cost} pl-2 pr-1 py-1.5`}
            >
              <button onClick={() => cycleStars(u.instanceId)} className="flex items-center gap-1 active:opacity-70">
                <span className={`text-xs font-semibold cost-${def.cost}`}>{def.nameKo}</span>
                <span className={`text-[11px] ${starColor}`}>{"★".repeat(u.stars)}</span>
              </button>
              <button onClick={() => removeUnit(u.instanceId)} className="p-0.5 active:bg-surface rounded">
                <X size={11} className="text-zinc-500" />
              </button>
            </div>
          );
        })}
        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1 rounded-lg bg-accent/20 text-accent px-2.5 py-1.5 text-xs font-semibold active:bg-accent/30 border border-accent/30"
        >
          <Plus size={13} /> 유닛 추가
        </button>
      </div>

      {roster.length === 0 && (
        <div className="text-xs text-zinc-500 text-center py-2 mt-1">
          지금 들고 있는 핵심 유닛을 추가해주세요 (위치·전부 X, 캐리·핵심만 OK)
        </div>
      )}

      {twoStarReady.length > 0 && (
        <div className="text-[11px] text-emerald-400 mt-2">
          2성각: {twoStarReady.map((c) => findUnit(c.unitId)?.nameKo ?? c.unitId).join(", ")}
        </div>
      )}

      <UnitPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(unitId, stars) => {
          addUnit(unitId, stars);
          setPickerOpen(false);
        }}
        title="보유 유닛 추가"
      />
    </section>
  );
}
