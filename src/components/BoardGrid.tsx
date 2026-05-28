"use client";
import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { UnitPicker } from "./UnitPicker";
import { UnitChip } from "./UnitChip";
import { findUnit } from "@/lib/data/units";

export function BoardGrid() {
  const board = useGameStore((s) => s.state.board);
  const setBoardUnit = useGameStore((s) => s.setBoardUnit);
  const sellBoardUnit = useGameStore((s) => s.sellBoardUnit);
  const promoteUnitStars = useGameStore((s) => s.promoteUnitStars);

  const [pickerSlot, setPickerSlot] = useState<string | null>(null);
  const [actionSlot, setActionSlot] = useState<string | null>(null);

  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3, 4, 5, 6];

  return (
    <section className="bg-surface rounded-2xl p-3 border border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold">체스판 (앞 ▲ 뒤 ▼)</h3>
        <span className="text-[10px] text-zinc-500">탭으로 유닛 배치</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r} className={`grid grid-cols-7 gap-1 ${r % 2 === 1 ? "pl-3" : ""}`}>
            {cols.map((c) => {
              const sl = board.find((b) => b.slotId === `board-r${r}-c${c}`);
              if (!sl) return null;
              return (
                <UnitChip
                  key={sl.slotId}
                  unit={sl.unit}
                  size="sm"
                  onClick={() => (sl.unit ? setActionSlot(sl.slotId) : setPickerSlot(sl.slotId))}
                />
              );
            })}
          </div>
        ))}
      </div>

      <UnitPicker
        open={pickerSlot !== null}
        onClose={() => setPickerSlot(null)}
        onPick={(unitId, stars) => {
          if (pickerSlot) setBoardUnit(pickerSlot, unitId, stars);
          setPickerSlot(null);
        }}
        title="체스판에 배치"
      />

      {actionSlot && board.find((b) => b.slotId === actionSlot)?.unit && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setActionSlot(null)}
        >
          <div
            className="bg-surface w-full sm:max-w-md rounded-t-3xl border-t border-border p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const slot = board.find((b) => b.slotId === actionSlot)!;
              return (
                <div className="text-center text-xs text-zinc-500 mb-2">
                  {findUnit(slot.unit!.unitId)?.nameKo} ({"★".repeat(slot.unit!.stars)})
                </div>
              );
            })()}
            <button
              onClick={() => {
                promoteUnitStars("board", actionSlot);
                setActionSlot(null);
              }}
              className="w-full bg-surface-2 active:bg-background rounded-xl py-3 text-sm"
            >
              별 +1
            </button>
            <button
              onClick={() => {
                setBoardUnit(actionSlot, undefined);
                setActionSlot(null);
              }}
              className="w-full bg-surface-2 active:bg-background rounded-xl py-3 text-sm"
            >
              비우기
            </button>
            <button
              onClick={() => {
                sellBoardUnit(actionSlot);
                setActionSlot(null);
              }}
              className="w-full bg-red-900/40 text-red-200 active:bg-red-900/60 rounded-xl py-3 text-sm font-semibold"
            >
              판매
            </button>
            <button onClick={() => setActionSlot(null)} className="w-full text-zinc-500 py-2 text-sm">
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
