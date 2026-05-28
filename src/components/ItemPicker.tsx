"use client";
import { X } from "lucide-react";
import { COMPLETED, COMPONENTS } from "@/lib/data/items";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (itemId: string) => void;
  title?: string;
}

export function ItemPicker({ open, onClose, onPick, title = "아이템 선택" }: Props) {
  if (!open) return null;

  const colorByDir: Record<string, string> = {
    AD: "bg-red-900/30 text-red-200 ring-red-700/40",
    AP: "bg-blue-900/30 text-blue-200 ring-blue-700/40",
    Tank: "bg-emerald-900/30 text-emerald-200 ring-emerald-700/40",
    Flex: "bg-amber-900/30 text-amber-200 ring-amber-700/40",
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
        <div className="overflow-y-auto px-4 pb-4 pt-2">
          <div className="text-[11px] text-zinc-500 mt-1 mb-2">재료 아이템</div>
          <div className="grid grid-cols-3 gap-2">
            {COMPONENTS.map((it) => (
              <button
                key={it.id}
                onClick={() => onPick(it.id)}
                className={`rounded-xl p-2.5 text-xs font-semibold text-left ring-1 ring-inset ${colorByDir[it.directions[0]] ?? "bg-surface-2"} active:opacity-80`}
              >
                <div className="truncate">{it.nameKo}</div>
                <div className="text-[10px] opacity-70 truncate">{it.directions.join(" ")}</div>
              </button>
            ))}
          </div>
          <div className="text-[11px] text-zinc-500 mt-4 mb-2">완성 아이템</div>
          <div className="grid grid-cols-3 gap-2">
            {COMPLETED.map((it) => (
              <button
                key={it.id}
                onClick={() => onPick(it.id)}
                className={`rounded-xl p-2.5 text-xs font-semibold text-left ring-1 ring-inset ${colorByDir[it.directions[0]] ?? "bg-surface-2"} active:opacity-80`}
              >
                <div className="truncate">{it.nameKo}</div>
                <div className="text-[10px] opacity-70 truncate">{it.directions.join(" ")}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
