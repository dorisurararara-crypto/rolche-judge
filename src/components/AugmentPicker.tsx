"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import type { AugmentChoice, AugmentType } from "@/lib/types";
import { useGameStore } from "@/store/useGameStore";
import { searchAugments } from "@/lib/data/augments";

const TYPE_LABEL: Record<AugmentType, string> = {
  combat: "전투",
  economy: "경제",
  item: "아이템",
  reroll: "리롤",
  emblem: "상징",
  trait: "특성",
  highValue: "고밸류",
  unknown: "기타",
};

const TIER_COLOR: Record<string, string> = {
  silver: "text-zinc-300",
  gold: "text-amber-300",
  prismatic: "text-fuchsia-300",
};

const TYPE_OPTIONS: AugmentType[] = ["combat", "economy", "item", "reroll", "emblem", "trait", "highValue", "unknown"];

export function AugmentPicker() {
  const choices = useGameStore((s) => s.state.augmentChoices);
  const addAugment = useGameStore((s) => s.addAugment);
  const removeAugment = useGameStore((s) => s.removeAugment);
  const [query, setQuery] = useState("");
  const [freeType, setFreeType] = useState<AugmentType>("unknown");

  const results = useMemo(() => searchAugments(query), [query]);
  const exactInDb = results.some((r) => r.nameKo === query.trim() || r.nameEn.toLowerCase() === query.toLowerCase().trim());

  const pick = (a: AugmentChoice) => {
    addAugment(a);
    setQuery("");
  };

  const addFree = () => {
    if (!query.trim() || choices.length >= 3) return;
    addAugment({
      id: `free_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      name: query.trim(),
      type: freeType,
    });
    setQuery("");
  };

  return (
    <section className="bg-surface rounded-2xl p-3 border border-border">
      <h3 className="text-sm font-semibold mb-2">증강체 후보 ({choices.length}/3)</h3>

      <div className="space-y-1.5 mb-2">
        {choices.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2">
            <span className="text-xs text-accent font-bold">{i + 1}</span>
            <span className="flex-1 text-sm truncate">{c.name}</span>
            <span className="text-[10px] text-zinc-400">{TYPE_LABEL[c.type]}</span>
            <button onClick={() => removeAugment(c.id)} className="p-1 active:bg-surface rounded">
              <Trash2 size={14} className="text-zinc-500" />
            </button>
          </div>
        ))}
        {choices.length === 0 && <div className="text-xs text-zinc-500 text-center py-1">받은 증강 3개를 검색해서 추가</div>}
      </div>

      {choices.length < 3 && (
        <div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="증강 검색 (예: 판도라, 유리, glass)"
              className="w-full bg-surface-2 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 ring-accent/40"
            />
          </div>

          {query.trim() && (
            <div className="mt-2 max-h-52 overflow-y-auto space-y-1">
              {results.map((a) => {
                const already = choices.some((c) => c.id === a.id);
                return (
                  <button
                    key={a.id}
                    disabled={already}
                    onClick={() => pick({ id: a.id, name: a.nameKo, type: a.type })}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${
                      already ? "opacity-40 bg-surface-2" : "bg-surface-2 active:bg-surface"
                    }`}
                  >
                    <span className={`text-[10px] ${TIER_COLOR[a.tier]}`}>●</span>
                    <span className="flex-1 text-sm truncate">{a.nameKo}</span>
                    <span className="text-[10px] text-zinc-500">{TYPE_LABEL[a.type]}</span>
                  </button>
                );
              })}

              {/* 자유 입력 (DB 에 없는 증강) */}
              {!exactInDb && (
                <div className="border-t border-border pt-2 mt-1">
                  <div className="text-[10px] text-zinc-500 mb-1">목록에 없으면 직접 추가: &quot;{query.trim()}&quot;</div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {TYPE_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFreeType(t)}
                        className={`px-2 py-0.5 rounded-full text-[10px] ${freeType === t ? "bg-accent text-black" : "bg-surface-2 text-zinc-400"}`}
                      >
                        {TYPE_LABEL[t]}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={addFree}
                    className="w-full bg-accent/20 text-accent border border-accent/30 rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 active:bg-accent/30"
                  >
                    <Plus size={13} /> &quot;{query.trim()}&quot; 직접 추가
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
