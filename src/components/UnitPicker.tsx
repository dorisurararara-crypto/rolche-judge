"use client";
import { useMemo, useState } from "react";
import { Search, Star, X, Check } from "lucide-react";
import { searchUnits, UNITS } from "@/lib/data/units";
import type { UnitCost, UnitStars } from "@/lib/types";
import { useGameStore } from "@/store/useGameStore";

interface Picked {
  unitId: string;
  stars: UnitStars;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (picks: Picked[]) => void;
  title?: string;
}

const COST_FILTERS: (UnitCost | "all")[] = ["all", 1, 2, 3, 4, 5];

export function UnitPicker({ open, onClose, onConfirm, title = "유닛 선택" }: Props) {
  const [query, setQuery] = useState("");
  const [costFilter, setCostFilter] = useState<UnitCost | "all">("all");
  const [picks, setPicks] = useState<Record<string, UnitStars>>({});
  const recent = useGameStore((s) => s.state.recentUnits);
  const favorites = useGameStore((s) => s.state.favoriteUnits);
  const toggleFav = useGameStore((s) => s.toggleFavoriteUnit);

  const list = useMemo(() => {
    let base = searchUnits(query);
    if (costFilter !== "all") base = base.filter((u) => u.cost === costFilter);
    return base;
  }, [query, costFilter]);

  if (!open) return null;

  const pickCount = Object.keys(picks).length;

  // 탭: 미선택 → 1성. 선택 → 성수 순환 (1→2→3→해제)
  const tapUnit = (unitId: string) => {
    setPicks((prev) => {
      const cur = prev[unitId];
      const next = { ...prev };
      if (!cur) next[unitId] = 1;
      else if (cur === 1) next[unitId] = 2;
      else if (cur === 2) next[unitId] = 3;
      else delete next[unitId];
      return next;
    });
  };

  const confirm = () => {
    const arr: Picked[] = Object.entries(picks).map(([unitId, stars]) => ({ unitId, stars }));
    onConfirm(arr);
    setPicks({});
    setQuery("");
    setCostFilter("all");
  };

  const close = () => {
    setPicks({});
    setQuery("");
    setCostFilter("all");
    onClose();
  };

  const StarBadge = ({ stars }: { stars: UnitStars }) => (
    <span className={stars === 3 ? "text-amber-300" : stars === 2 ? "text-yellow-100" : "text-zinc-200"}>
      {"★".repeat(stars)}
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl border-t border-border sm:border max-h-[92vh] flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-base">{title}</h2>
          <button onClick={close} className="p-2 -m-2 active:bg-surface-2 rounded-full" aria-label="닫기">
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
              placeholder="한글/영문 검색 (예: 나서, nasus)"
              className="w-full bg-surface-2 rounded-xl pl-9 pr-3 py-3 text-sm outline-none focus:ring-2 ring-accent/40"
            />
          </div>
          <div className="flex gap-1.5 mt-3 overflow-x-auto px-0.5">
            {COST_FILTERS.map((c) => (
              <button
                key={String(c)}
                onClick={() => setCostFilter(c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  costFilter === c ? "bg-accent text-black" : "bg-surface-2 text-zinc-300"
                }`}
              >
                {c === "all" ? "전체" : `${c}코`}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">탭하면 선택(1성) → 다시 탭하면 ★→★★→★★★→해제</p>
        </div>

        {recent.length > 0 && query === "" && costFilter === "all" && (
          <div className="px-4 pb-1">
            <div className="text-[11px] text-zinc-500 mb-1.5">최근</div>
            <div className="flex gap-1.5 overflow-x-auto">
              {recent.map((id) => {
                const u = UNITS.find((x) => x.id === id);
                if (!u) return null;
                const st = picks[id];
                return (
                  <button
                    key={id}
                    onClick={() => tapUnit(id)}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs ring-cost-${u.cost} ${st ? "bg-accent/25" : "bg-surface-2"}`}
                  >
                    <span className={`cost-${u.cost} font-medium`}>{u.nameKo}</span>
                    {st && <span className="ml-1 text-[10px]"><StarBadge stars={st} /></span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 pb-2 pt-1">
          <div className="grid grid-cols-3 gap-2">
            {list.map((u) => {
              const isFav = favorites.includes(u.id);
              const st = picks[u.id];
              const selected = !!st;
              return (
                <button
                  key={u.id}
                  onClick={() => tapUnit(u.id)}
                  className={`relative rounded-xl p-2.5 text-left transition active:scale-95 ring-cost-${u.cost} ${
                    selected ? "bg-accent/25 ring-2" : "bg-surface-2"
                  }`}
                >
                  {selected && (
                    <span className="absolute top-1 left-1 bg-accent text-black rounded-full w-4 h-4 flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                  <div className={`text-xs font-semibold cost-${u.cost} truncate ${selected ? "pl-4" : ""}`}>
                    {u.nameKo}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">{u.nameEn}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-zinc-500">{u.cost}코</span>
                    {selected && <span className="text-[11px]"><StarBadge stars={st} /></span>}
                  </div>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(u.id);
                    }}
                    className="absolute bottom-1 right-1 p-1"
                  >
                    <Star size={12} className={isFav ? "fill-accent text-accent" : "text-zinc-600"} />
                  </span>
                </button>
              );
            })}
          </div>
          {list.length === 0 && <div className="text-center text-sm text-zinc-500 py-8">검색 결과 없음</div>}
        </div>

        <div className="border-t border-border px-4 py-3 bg-surface" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          <button
            onClick={confirm}
            disabled={pickCount === 0}
            className="w-full bg-accent text-black rounded-xl py-3 font-bold text-sm active:opacity-80 disabled:opacity-40"
          >
            {pickCount > 0 ? `${pickCount}개 추가` : "유닛을 탭해서 선택"}
          </button>
        </div>
      </div>
    </div>
  );
}
