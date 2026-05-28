"use client";
import { useMemo, useState } from "react";
import { X, Check, Search } from "lucide-react";
import { ITEMS } from "@/lib/data/items";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (itemIds: string[]) => void;
}

const DIR_COLOR: Record<string, string> = {
  AD: "ring-red-700/50 data-[on=true]:bg-red-900/40",
  AP: "ring-blue-700/50 data-[on=true]:bg-blue-900/40",
  Tank: "ring-emerald-700/50 data-[on=true]:bg-emerald-900/40",
  Flex: "ring-amber-700/50 data-[on=true]:bg-amber-900/40",
};

export function ItemPicker({ open, onClose, onConfirm }: Props) {
  const [picks, setPicks] = useState<Record<string, true>>({});
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"completed" | "component">("completed");

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ITEMS.filter((it) => {
      if (q) return it.nameKo.includes(query.trim()) || it.nameEn.toLowerCase().includes(q);
      return it.kind === tab;
    });
  }, [query, tab]);

  if (!open) return null;

  const count = Object.keys(picks).length;
  const toggle = (id: string) =>
    setPicks((p) => {
      const n = { ...p };
      if (n[id]) delete n[id];
      else n[id] = true;
      return n;
    });

  const confirm = () => {
    onConfirm(Object.keys(picks));
    setPicks({});
    setQuery("");
  };
  const close = () => {
    setPicks({});
    setQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl border-t border-border sm:border max-h-[92vh] flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-base">아이템 선택 (복수 가능)</h2>
          <button onClick={close} className="p-2 -m-2 active:bg-surface-2 rounded-full">
            <X size={20} />
          </button>
        </header>

        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="아이템 검색 (예: 인피, 구인수)"
              className="w-full bg-surface-2 rounded-xl pl-9 pr-3 py-3 text-sm outline-none focus:ring-2 ring-accent/40"
            />
          </div>
          {!query && (
            <div className="flex gap-1.5 mt-3">
              <button
                onClick={() => setTab("completed")}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium ${tab === "completed" ? "bg-accent text-black" : "bg-surface-2 text-zinc-300"}`}
              >
                완성 아이템
              </button>
              <button
                onClick={() => setTab("component")}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium ${tab === "component" ? "bg-accent text-black" : "bg-surface-2 text-zinc-300"}`}
              >
                재료
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 pt-1">
          <div className="grid grid-cols-3 gap-2">
            {list.map((it) => {
              const on = !!picks[it.id];
              return (
                <button
                  key={it.id}
                  data-on={on}
                  onClick={() => toggle(it.id)}
                  className={`relative rounded-xl p-2.5 text-left ring-1 ring-inset transition active:scale-95 ${DIR_COLOR[it.directions[0]] ?? "ring-zinc-700"} ${on ? "" : "bg-surface-2"}`}
                >
                  {on && (
                    <span className="absolute top-1 left-1 bg-accent text-black rounded-full w-4 h-4 flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                  <div className={`text-xs font-semibold truncate ${on ? "pl-4" : ""}`}>{it.nameKo}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{it.directions.join("/")}</div>
                </button>
              );
            })}
          </div>
          {list.length === 0 && <div className="text-center text-sm text-zinc-500 py-8">검색 결과 없음</div>}
        </div>

        <div className="border-t border-border px-4 py-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          <button
            onClick={confirm}
            disabled={count === 0}
            className="w-full bg-accent text-black rounded-xl py-3 font-bold text-sm active:opacity-80 disabled:opacity-40"
          >
            {count > 0 ? `${count}개 추가` : "아이템을 탭해서 선택"}
          </button>
        </div>
      </div>
    </div>
  );
}
