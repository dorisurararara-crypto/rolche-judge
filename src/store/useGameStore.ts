"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  GameState,
  BoardSlot,
  BenchSlot,
  ShopSlot,
  UnitInstance,
  RoundCode,
  BoardState,
  AugmentChoice,
  UnitStars,
} from "@/lib/types";
import { findUnit } from "@/lib/data/units";
import type { JudgeResponse } from "@/lib/judge/types";

const STORAGE_KEY = "rolche.gameState.v1";

const BOARD_ROWS: BoardSlot["row"][] = ["front", "front", "mid", "back"];

function freshBoard(): BoardSlot[] {
  const slots: BoardSlot[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      slots.push({
        slotId: `board-r${r}-c${c}`,
        row: BOARD_ROWS[r],
        col: c,
      });
    }
  }
  return slots;
}

function freshBench(): BenchSlot[] {
  return Array.from({ length: 9 }, (_, i) => ({ index: i }));
}

function freshShop(): ShopSlot[] {
  return Array.from({ length: 5 }, (_, i) => ({ index: i }));
}

function freshState(): GameState {
  const now = Date.now();
  return {
    round: "3-2",
    level: 6,
    gold: 42,
    hp: 64,
    boardState: "ambiguous",
    board: freshBoard(),
    bench: freshBench(),
    shop: freshShop(),
    benchItems: [],
    augmentChoices: [],
    question: "이번 턴 뭐 해야 해?",
    recentUnits: [],
    favoriteUnits: [],
    createdAt: now,
    updatedAt: now,
  };
}

interface Store {
  state: GameState;
  lastJudge?: JudgeResponse;
  isJudging: boolean;
  resetGame: () => void;
  setRound: (r: RoundCode) => void;
  setLevel: (n: number) => void;
  setGold: (n: number) => void;
  bumpGold: (delta: number) => void;
  setHp: (n: number) => void;
  setBoardState: (s: BoardState) => void;
  setShopUnit: (slotIndex: number, unitId: string | undefined) => void;
  buyShopUnit: (slotIndex: number) => boolean;
  clearShop: () => void;
  setBenchUnit: (index: number, unitId: string | undefined, stars?: UnitStars) => void;
  setBoardUnit: (slotId: string, unitId: string | undefined, stars?: UnitStars) => void;
  moveBenchToBoard: (benchIndex: number, slotId: string) => void;
  moveBoardToBench: (slotId: string, benchIndex: number) => void;
  sellBenchUnit: (index: number) => void;
  sellBoardUnit: (slotId: string) => void;
  addBenchItem: (itemId: string) => void;
  removeBenchItem: (idx: number) => void;
  attachItemToBench: (benchIndex: number, itemId: string) => void;
  attachItemToBoard: (slotId: string, itemId: string) => void;
  detachItemFromUnit: (location: "bench" | "board", key: number | string, itemIdx: number) => void;
  setAugmentChoices: (a: AugmentChoice[]) => void;
  setQuestion: (q: string) => void;
  setJudgeResult: (r: JudgeResponse | undefined) => void;
  setIsJudging: (b: boolean) => void;
  pushRecentUnit: (unitId: string) => void;
  toggleFavoriteUnit: (unitId: string) => void;
  promoteUnitStars: (location: "bench" | "board", key: number | string) => void;
}

function nextInstanceId() {
  return `u_${Math.random().toString(36).slice(2, 9)}`;
}

function emptyBenchIndex(state: GameState): number {
  return state.bench.findIndex((s) => !s.unit);
}

export const useGameStore = create<Store>()(
  persist(
    (set, get) => ({
      state: freshState(),
      isJudging: false,
      resetGame: () => set({ state: freshState(), lastJudge: undefined }),

      setRound: (round) =>
        set((s) => ({ state: { ...s.state, round, updatedAt: Date.now() } })),
      setLevel: (level) =>
        set((s) => ({ state: { ...s.state, level, updatedAt: Date.now() } })),
      setGold: (gold) =>
        set((s) => ({ state: { ...s.state, gold: Math.max(0, gold), updatedAt: Date.now() } })),
      bumpGold: (delta) =>
        set((s) => ({ state: { ...s.state, gold: Math.max(0, s.state.gold + delta), updatedAt: Date.now() } })),
      setHp: (hp) =>
        set((s) => ({ state: { ...s.state, hp: Math.max(0, Math.min(100, hp)), updatedAt: Date.now() } })),
      setBoardState: (boardState) =>
        set((s) => ({ state: { ...s.state, boardState, updatedAt: Date.now() } })),

      setShopUnit: (slotIndex, unitId) =>
        set((s) => {
          const shop = s.state.shop.map((sl) =>
            sl.index === slotIndex ? { ...sl, unitId } : sl,
          );
          return { state: { ...s.state, shop, updatedAt: Date.now() } };
        }),
      buyShopUnit: (slotIndex) => {
        const s = get().state;
        const slot = s.shop[slotIndex];
        if (!slot?.unitId) return false;
        const def = findUnit(slot.unitId);
        if (!def) return false;
        if (s.gold < def.cost) return false;
        const bi = emptyBenchIndex(s);
        if (bi < 0) return false;
        const bench = s.bench.map((b) =>
          b.index === bi
            ? { ...b, unit: { instanceId: nextInstanceId(), unitId: slot.unitId!, stars: 1 as UnitStars, items: [] } }
            : b,
        );
        const shop = s.shop.map((sl) => (sl.index === slotIndex ? { ...sl, unitId: undefined } : sl));
        const recentUnits = [slot.unitId, ...s.recentUnits.filter((x) => x !== slot.unitId)].slice(0, 8);
        set({
          state: {
            ...s,
            gold: s.gold - def.cost,
            bench,
            shop,
            recentUnits,
            updatedAt: Date.now(),
          },
        });
        return true;
      },
      clearShop: () =>
        set((s) => ({
          state: { ...s.state, shop: s.state.shop.map((sl) => ({ ...sl, unitId: undefined })), updatedAt: Date.now() },
        })),

      setBenchUnit: (index, unitId, stars = 1 as UnitStars) =>
        set((s) => {
          const bench = s.state.bench.map((b) =>
            b.index === index
              ? unitId
                ? { ...b, unit: { instanceId: nextInstanceId(), unitId, stars, items: [] } }
                : { ...b, unit: undefined }
              : b,
          );
          const recentUnits = unitId
            ? [unitId, ...s.state.recentUnits.filter((x) => x !== unitId)].slice(0, 8)
            : s.state.recentUnits;
          return { state: { ...s.state, bench, recentUnits, updatedAt: Date.now() } };
        }),

      setBoardUnit: (slotId, unitId, stars = 1 as UnitStars) =>
        set((s) => {
          const board = s.state.board.map((sl) =>
            sl.slotId === slotId
              ? unitId
                ? { ...sl, unit: { instanceId: nextInstanceId(), unitId, stars, items: [] } }
                : { ...sl, unit: undefined }
              : sl,
          );
          const recentUnits = unitId
            ? [unitId, ...s.state.recentUnits.filter((x) => x !== unitId)].slice(0, 8)
            : s.state.recentUnits;
          return { state: { ...s.state, board, recentUnits, updatedAt: Date.now() } };
        }),

      moveBenchToBoard: (benchIndex, slotId) =>
        set((s) => {
          const benchSlot = s.state.bench.find((b) => b.index === benchIndex);
          if (!benchSlot?.unit) return s;
          const targetBoard = s.state.board.find((b) => b.slotId === slotId);
          if (!targetBoard || targetBoard.unit) return s;
          const board = s.state.board.map((sl) =>
            sl.slotId === slotId ? { ...sl, unit: benchSlot.unit } : sl,
          );
          const bench = s.state.bench.map((b) =>
            b.index === benchIndex ? { ...b, unit: undefined } : b,
          );
          return { state: { ...s.state, board, bench, updatedAt: Date.now() } };
        }),

      moveBoardToBench: (slotId, benchIndex) =>
        set((s) => {
          const sl = s.state.board.find((b) => b.slotId === slotId);
          if (!sl?.unit) return s;
          const dst = s.state.bench.find((b) => b.index === benchIndex);
          if (!dst || dst.unit) return s;
          const board = s.state.board.map((bb) =>
            bb.slotId === slotId ? { ...bb, unit: undefined } : bb,
          );
          const bench = s.state.bench.map((b) =>
            b.index === benchIndex ? { ...b, unit: sl.unit } : b,
          );
          return { state: { ...s.state, board, bench, updatedAt: Date.now() } };
        }),

      sellBenchUnit: (index) =>
        set((s) => {
          const b = s.state.bench.find((x) => x.index === index);
          if (!b?.unit) return s;
          const def = findUnit(b.unit.unitId);
          if (!def) return s;
          const refund = b.unit.stars === 1 ? def.cost : def.cost * 3 - 1;
          const bench = s.state.bench.map((bb) =>
            bb.index === index ? { ...bb, unit: undefined } : bb,
          );
          return { state: { ...s.state, bench, gold: s.state.gold + refund, updatedAt: Date.now() } };
        }),
      sellBoardUnit: (slotId) =>
        set((s) => {
          const sl = s.state.board.find((b) => b.slotId === slotId);
          if (!sl?.unit) return s;
          const def = findUnit(sl.unit.unitId);
          if (!def) return s;
          const refund = sl.unit.stars === 1 ? def.cost : def.cost * 3 - 1;
          const board = s.state.board.map((b) =>
            b.slotId === slotId ? { ...b, unit: undefined } : b,
          );
          return { state: { ...s.state, board, gold: s.state.gold + refund, updatedAt: Date.now() } };
        }),

      addBenchItem: (itemId) =>
        set((s) => ({ state: { ...s.state, benchItems: [...s.state.benchItems, itemId], updatedAt: Date.now() } })),
      removeBenchItem: (idx) =>
        set((s) => ({
          state: { ...s.state, benchItems: s.state.benchItems.filter((_, i) => i !== idx), updatedAt: Date.now() },
        })),
      attachItemToBench: (benchIndex, itemId) =>
        set((s) => {
          const bench = s.state.bench.map((b) => {
            if (b.index !== benchIndex || !b.unit) return b;
            if (b.unit.items.length >= 3) return b;
            return { ...b, unit: { ...b.unit, items: [...b.unit.items, itemId] } };
          });
          return { state: { ...s.state, bench, updatedAt: Date.now() } };
        }),
      attachItemToBoard: (slotId, itemId) =>
        set((s) => {
          const board = s.state.board.map((b) => {
            if (b.slotId !== slotId || !b.unit) return b;
            if (b.unit.items.length >= 3) return b;
            return { ...b, unit: { ...b.unit, items: [...b.unit.items, itemId] } };
          });
          return { state: { ...s.state, board, updatedAt: Date.now() } };
        }),
      detachItemFromUnit: (location, key, itemIdx) =>
        set((s) => {
          if (location === "bench") {
            const bench = s.state.bench.map((b) => {
              if (b.index !== key || !b.unit) return b;
              return { ...b, unit: { ...b.unit, items: b.unit.items.filter((_, i) => i !== itemIdx) } };
            });
            return { state: { ...s.state, bench, updatedAt: Date.now() } };
          }
          const board = s.state.board.map((b) => {
            if (b.slotId !== key || !b.unit) return b;
            return { ...b, unit: { ...b.unit, items: b.unit.items.filter((_, i) => i !== itemIdx) } };
          });
          return { state: { ...s.state, board, updatedAt: Date.now() } };
        }),

      setAugmentChoices: (a) =>
        set((s) => ({ state: { ...s.state, augmentChoices: a, updatedAt: Date.now() } })),
      setQuestion: (q) => set((s) => ({ state: { ...s.state, question: q, updatedAt: Date.now() } })),

      setJudgeResult: (r) => set({ lastJudge: r }),
      setIsJudging: (b) => set({ isJudging: b }),
      pushRecentUnit: (unitId) =>
        set((s) => ({
          state: {
            ...s.state,
            recentUnits: [unitId, ...s.state.recentUnits.filter((x) => x !== unitId)].slice(0, 8),
          },
        })),
      toggleFavoriteUnit: (unitId) =>
        set((s) => ({
          state: {
            ...s.state,
            favoriteUnits: s.state.favoriteUnits.includes(unitId)
              ? s.state.favoriteUnits.filter((x) => x !== unitId)
              : [...s.state.favoriteUnits, unitId],
          },
        })),
      promoteUnitStars: (location, key) =>
        set((s) => {
          if (location === "bench") {
            const bench = s.state.bench.map((b) => {
              if (b.index !== key || !b.unit) return b;
              const next = Math.min(3, b.unit.stars + 1) as UnitStars;
              return { ...b, unit: { ...b.unit, stars: next } };
            });
            return { state: { ...s.state, bench, updatedAt: Date.now() } };
          }
          const board = s.state.board.map((b) => {
            if (b.slotId !== key || !b.unit) return b;
            const next = Math.min(3, b.unit.stars + 1) as UnitStars;
            return { ...b, unit: { ...b.unit, stars: next } };
          });
          return { state: { ...s.state, board, updatedAt: Date.now() } };
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : ({} as Storage))),
      partialize: (s) => ({ state: s.state, lastJudge: s.lastJudge }),
      version: 1,
    },
  ),
);
