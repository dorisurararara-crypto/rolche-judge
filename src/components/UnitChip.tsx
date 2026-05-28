"use client";
import { findUnit } from "@/lib/data/units";
import type { UnitInstance, UnitStars } from "@/lib/types";

interface Props {
  unit?: UnitInstance;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  empty?: string;
}

export function UnitChip({ unit, onClick, size = "md", empty = "+" }: Props) {
  const def = unit ? findUnit(unit.unitId) : undefined;
  const sizeCls =
    size === "sm" ? "h-10 text-[11px]" : size === "lg" ? "h-16 text-sm" : "h-12 text-xs";

  if (!unit || !def) {
    return (
      <button
        onClick={onClick}
        className={`${sizeCls} w-full bg-surface-2/50 hover:bg-surface-2 active:bg-surface border border-dashed border-border rounded-lg flex items-center justify-center text-zinc-600 active:scale-95 transition`}
      >
        {empty}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${sizeCls} w-full bg-surface-2 rounded-lg ring-cost-${def.cost} px-1.5 flex flex-col items-start justify-center text-left active:scale-95 transition relative`}
    >
      <div className={`font-semibold truncate w-full cost-${def.cost}`}>{def.nameKo}</div>
      <div className="flex items-center gap-1 mt-0.5">
        <Stars stars={unit.stars} />
        {unit.items.length > 0 && (
          <div className="flex gap-0.5">
            {unit.items.slice(0, 3).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-accent" />
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function Stars({ stars }: { stars: UnitStars }) {
  const color = stars === 3 ? "text-amber-400" : stars === 2 ? "text-yellow-200" : "text-zinc-500";
  return <span className={`text-[10px] ${color}`}>{"★".repeat(stars)}</span>;
}
