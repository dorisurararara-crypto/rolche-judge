"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { findItem } from "@/lib/data/items";
import { ItemPicker } from "./ItemPicker";

const DIR_TEXT: Record<string, string> = {
  AD: "text-red-300",
  AP: "text-blue-300",
  Tank: "text-emerald-300",
  Flex: "text-amber-300",
};

export function ItemTray() {
  const items = useGameStore((s) => s.state.items);
  const addItem = useGameStore((s) => s.addItem);
  const removeItem = useGameStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-surface rounded-2xl p-3 border border-border">
      <h3 className="text-sm font-semibold mb-2">보유 아이템</h3>
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
              <span className={`font-medium ${DIR_TEXT[it.directions[0]] ?? ""}`}>{it.nameKo}</span>
              <X size={10} className="text-zinc-500" />
            </button>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="px-2.5 py-1 rounded-lg bg-accent/20 text-accent text-[11px] active:bg-accent/30 flex items-center gap-1 border border-accent/30 font-semibold"
        >
          <Plus size={12} /> 아이템 추가
        </button>
      </div>
      {items.length === 0 && (
        <div className="text-xs text-zinc-500 text-center py-1 mt-1">완성 아이템·재료를 추가하면 캐리 방향을 잡아줘요</div>
      )}
      <ItemPicker
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={(ids) => {
          ids.forEach((id) => addItem(id));
          setOpen(false);
        }}
      />
    </section>
  );
}
