"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { AugmentChoice, AugmentType } from "@/lib/types";
import { useGameStore } from "@/store/useGameStore";

const TYPE_OPTIONS: { value: AugmentType; label: string }[] = [
  { value: "combat", label: "전투" },
  { value: "economy", label: "경제" },
  { value: "item", label: "아이템" },
  { value: "reroll", label: "리롤" },
  { value: "emblem", label: "상징/문장" },
  { value: "trait", label: "특성 강화" },
  { value: "highValue", label: "고밸류" },
  { value: "unknown", label: "모름" },
];

export function AugmentPicker() {
  const choices = useGameStore((s) => s.state.augmentChoices);
  const setChoices = useGameStore((s) => s.setAugmentChoices);
  const [name, setName] = useState("");
  const [type, setType] = useState<AugmentType>("combat");

  const add = () => {
    if (choices.length >= 3) return;
    const c: AugmentChoice = {
      id: `aug_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim() || `${TYPE_OPTIONS.find((o) => o.value === type)?.label ?? "증강체"} ${choices.length + 1}`,
      type,
    };
    setChoices([...choices, c]);
    setName("");
  };

  const remove = (id: string) => setChoices(choices.filter((c) => c.id !== id));

  return (
    <section className="bg-surface rounded-2xl p-3 border border-border">
      <h3 className="text-sm font-semibold mb-2">증강체 후보 ({choices.length}/3)</h3>
      <div className="space-y-2 mb-2">
        {choices.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2">
            <span className="text-xs text-accent font-semibold">{i + 1}</span>
            <span className="flex-1 text-sm truncate">{c.name}</span>
            <span className="text-[10px] text-zinc-400">{TYPE_OPTIONS.find((o) => o.value === c.type)?.label}</span>
            <button onClick={() => remove(c.id)} className="p-1 active:bg-surface rounded">
              <Trash2 size={14} className="text-zinc-500" />
            </button>
          </div>
        ))}
        {choices.length === 0 && (
          <div className="text-xs text-zinc-500 text-center py-2">증강체 후보 3개를 입력해주세요</div>
        )}
      </div>
      {choices.length < 3 && (
        <div className="space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="증강체 이름 (선택 — 비우면 타입명)"
            className="w-full bg-surface-2 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ring-accent/40"
          />
          <div className="flex flex-wrap gap-1.5">
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setType(o.value)}
                className={`px-2.5 py-1 rounded-full text-xs ${
                  type === o.value ? "bg-accent text-black font-medium" : "bg-surface-2 text-zinc-300"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button
            onClick={add}
            className="w-full bg-accent text-black rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-1 active:opacity-80"
          >
            <Plus size={16} /> 추가
          </button>
        </div>
      )}
    </section>
  );
}
