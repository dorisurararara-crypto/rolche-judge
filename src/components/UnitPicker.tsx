"use client";
import { useMemo, useState } from "react";
import { Search, Star, X } from "lucide-react";
import { searchUnits, UNITS } from "@/lib/data/units";
import type { UnitCost, UnitStars } from "@/lib/types";
import { useGameStore } from "@/store/useGameStore";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (unitId: string, stars: UnitStars) => void;
  title?: string;
  allowStarSelect?: boolean;
}

const COST_FILTERS: (UnitCost | "all")[] = ["all", 1, 2, 3, 4, 5];

export function UnitPicker({ open, onClose, onPick, title = "유닛 선택", allowStarSelect = true }: Props) {
  const [query, setQuery] = useState("");
  const [costFilter, setCostFilter] = useState<UnitCost | "all">("all");
  const [pendingUnit, setPendingUnit] = useState<string | null>(null);
  const recent = useGameStore((s) => s.state.recentUnits);
  const favorites = useGameStore((s) => s.state.favoriteUnits);
  const toggleFav = useGameStore((s) => s.toggleFavoriteUnit);

  const list = useMemo(() => {
    let base = searchUnits(query);
    if (costFilter !== "all") base = base.filter((u) => u.cost === costFilter);
    return base;
  }, [query, costFilter]);

  if (!open) return null;

  const handlePick = (unitId: string, stars: UnitStars) => {
    onPick(unitId, stars);
    setPendingUnit(null);
    setQuery("");
    setCostFilter("all");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl border-t border-border sm:border max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="p-2 -m-2 active:bg-surface-2 rounded-full" aria-label="닫기">
            <X size={20} />
          </button>
        </header>

        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="한글/영문 검색 (예: jin, 징)"
              className="w-full bg-surface-2 rounded-xl pl-9 pr-3 py-3 text-sm outline-none focus:ring-2 ring-accent/40"
            />
          </div>
          <div className="flex gap-1.5 mt-3 overflow-x-auto -mx-1 px-1 scrollbar-none">
            {COST_FILTERS.map((c) => (
              <button
                key={String(c)}
                onClick={() => setCostFilter(c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  costFilter === c
                    ? "bg-accent text-black"
                    : "bg-surface-2 text-zinc-300 active:bg-surface"
                }`}
              >
                {c === "all" ? "전체" : `${c}코`}
              </button>
            ))}
          </div>
        </div>

        {recent.length > 0 && query === "" && costFilter === "all" && (
          <div className="px-4 pb-1">
            <div className="text-[11px] text-zinc-500 mb-1.5">최근</div>
            <div className="flex gap-1.5 overflow-x-auto">
              {recent.map((id) => {
                const u = UNITS.find((x) => x.id === id);
                if (!u) return null;
                return (
                  <button
                    key={id}
                    onClick={() => allowStarSelect ? setPendingUnit(id) : handlePick(id, 1)}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg bg-surface-2 text-xs ring-cost-${u.cost}`}
                  >
                    <span className={`cost-${u.cost} font-medium`}>{u.nameKo}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 pb-4 pt-1">
          <div className="grid grid-cols-3 gap-2">
            {list.map((u) => {
              const isFav = favorites.includes(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => (allowStarSelect ? setPendingUnit(u.id) : handlePick(u.id, 1))}
                  className={`relative bg-surface-2 rounded-xl p-2.5 ring-cost-${u.cost} active:bg-surface text-left`}
                >
                  <div className={`text-xs font-semibold cost-${u.cost} truncate`}>{u.nameKo}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{u.nameEn}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{u.cost}코</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(u.id);
                    }}
                    className="absolute top-1 right-1 p-1 -m-1"
                    aria-label="즐겨찾기"
                  >
                    <Star
                      size={12}
                      className={isFav ? "fill-accent text-accent" : "text-zinc-600"}
                    />
                  </button>
                </button>
              );
            })}
          </div>
          {list.length === 0 && (
            <div className="text-center text-sm text-zinc-500 py-8">검색 결과 없음</div>
          )}
        </div>

        {pendingUnit && (
          <div className="border-t border-border px-4 py-3 bg-surface-2">
            <div className="text-xs text-zinc-400 mb-2">별 개수 선택</div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => handlePick(pendingUnit, s as UnitStars)}
                  className="flex-1 py-3 rounded-xl bg-surface active:bg-background text-sm font-semibold"
                >
                  {"★".repeat(s)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
