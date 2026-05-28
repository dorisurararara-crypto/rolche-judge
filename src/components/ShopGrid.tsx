"use client";
import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { UnitPicker } from "./UnitPicker";
import { findUnit } from "@/lib/data/units";
import { Eraser, ShoppingCart, X } from "lucide-react";

export function ShopGrid() {
  const shop = useGameStore((s) => s.state.shop);
  const gold = useGameStore((s) => s.state.gold);
  const setShopUnit = useGameStore((s) => s.setShopUnit);
  const buyShopUnit = useGameStore((s) => s.buyShopUnit);
  const clearShop = useGameStore((s) => s.clearShop);

  const [pickerIdx, setPickerIdx] = useState<number | null>(null);

  return (
    <section className="bg-surface rounded-2xl p-3 border border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">상점 (5칸)</h3>
        <button
          onClick={clearShop}
          className="text-[11px] text-zinc-400 active:text-zinc-200 flex items-center gap-1 py-1 px-2 rounded-lg bg-surface-2"
        >
          <Eraser size={11} /> 전체 비우기
        </button>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {shop.map((sl) => {
          const def = sl.unitId ? findUnit(sl.unitId) : undefined;
          const canBuy = def ? gold >= def.cost : false;
          return (
            <div key={sl.index} className="space-y-1.5">
              <button
                onClick={() => setPickerIdx(sl.index)}
                className={`relative h-12 w-full rounded-lg flex flex-col items-center justify-center text-[10px] active:scale-95 transition ${
                  def
                    ? `bg-surface-2 ring-cost-${def.cost}`
                    : "bg-surface-2/50 border border-dashed border-border text-zinc-600"
                }`}
              >
                {def ? (
                  <>
                    <div className={`font-semibold cost-${def.cost} truncate w-full text-center px-1`}>
                      {def.nameKo}
                    </div>
                    <div className="text-[9px] text-zinc-500">{def.cost}골</div>
                  </>
                ) : (
                  "+"
                )}
              </button>
              {def ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => buyShopUnit(sl.index)}
                    disabled={!canBuy}
                    className={`flex-1 rounded-md py-1 text-[10px] font-bold flex items-center justify-center gap-0.5 ${
                      canBuy
                        ? "bg-accent text-black active:opacity-80"
                        : "bg-surface-2 text-zinc-600"
                    }`}
                  >
                    <ShoppingCart size={10} />
                    구매
                  </button>
                  <button
                    onClick={() => setShopUnit(sl.index, undefined)}
                    className="rounded-md py-1 px-1.5 text-[10px] bg-surface-2 active:bg-surface"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="h-[22px]" />
              )}
            </div>
          );
        })}
      </div>

      <UnitPicker
        open={pickerIdx !== null}
        onClose={() => setPickerIdx(null)}
        onPick={(unitId) => {
          if (pickerIdx !== null) setShopUnit(pickerIdx, unitId);
          setPickerIdx(null);
        }}
        title="상점 유닛 선택"
        allowStarSelect={false}
      />
    </section>
  );
}
