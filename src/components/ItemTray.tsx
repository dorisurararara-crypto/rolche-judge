"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { findItem } from "@/lib/data/items";
import { directionScore, dominantDirection } from "@/lib/economy";
import { ItemPicker } from "./ItemPicker";

export function ItemTray() {
  const items = useGameStore((s) => s.state.benchItems);
  const addItem = useGameStore((s) => s.addBenchItem);
  const removeItem = useGameStore((s) => s.removeBenchItem);
  const state = useGameStore((s) => s.state);
  const [pickerOpen, setPickerOpen] = useState(false);

  const dir = directionScore(state);
  const dom = dominantDirection(dir);

  return (
    <section className="bg-surface rounded-2xl p-3 border border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold">보유 아이템</h3>
        <span className="text-[11px] text-zinc-400">
          방향: <span className="text-accent font-semibold">{dom}</span> · AD{dir.AD} AP{dir.AP} T{dir.Tank} F{dir.Flex}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((id, i) => {
          const it = findItem(id);
          if (!it) return null;
          return (
            <button
              key={i}
              onClick={() => removeItem(i)}
              className="px-2 py-1 rounded-lg bg-surface-2 text-[11px] flex items-center gap-1 active:bg-surface"
            >
              {it.nameKo} <X size={10} className="text-zinc-500" />
            </button>
          );
        })}
        <button
          onClick={() => setPickerOpen(true)}
          className="px-2 py-1 rounded-lg bg-surface-2 text-[11px] text-zinc-400 active:bg-surface flex items-center gap-1"
        >
          <Plus size={11} /> 추가
        </button>
      </div>
      <ItemPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(id) => {
          addItem(id);
          setPickerOpen(false);
        }}
      />
    </section>
  );
}
