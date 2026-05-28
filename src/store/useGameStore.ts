"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  GameState,
  RoundCode,
  BoardState,
  AugmentChoice,
  UnitStars,
  ItemDirection,
} from "@/lib/types";
import type { Roadmap } from "@/lib/roadmap";

const STORAGE_KEY = "rolche.gameState.v2";

function freshState(): GameState {
  const now = Date.now();
  return {
    round: "3-2",
    level: 6,
    gold: 42,
    hp: 64,
    boardState: "ambiguous",
    roster: [],
    itemDirections: [],
    augmentChoices: [],
    recentUnits: [],
    favoriteUnits: [],
    createdAt: now,
    updatedAt: now,
  };
}

function newInstanceId() {
  return `u_${Math.random().toString(36).slice(2, 9)}`;
}

interface Store {
  state: GameState;
  lastRoadmap?: Roadmap;
  isPlanning: boolean;
  resetGame: () => void;
  setRound: (r: RoundCode) => void;
  setLevel: (n: number) => void;
  setGold: (n: number) => void;
  bumpGold: (delta: number) => void;
  setHp: (n: number) => void;
  setBoardState: (s: BoardState) => void;
  addRosterUnit: (unitId: string, stars: UnitStars) => void;
  removeRosterUnit: (instanceId: string) => void;
  cycleRosterStars: (instanceId: string) => void;
  toggleItemDirection: (d: ItemDirection) => void;
  setAugmentChoices: (a: AugmentChoice[]) => void;
  setRoadmap: (r: Roadmap | undefined) => void;
  setIsPlanning: (b: boolean) => void;
  toggleFavoriteUnit: (unitId: string) => void;
}

export const useGameStore = create<Store>()(
  persist(
    (set) => ({
      state: freshState(),
      isPlanning: false,
      resetGame: () => set({ state: freshState(), lastRoadmap: undefined }),

      setRound: (round) => set((s) => ({ state: { ...s.state, round, updatedAt: Date.now() } })),
      setLevel: (level) => set((s) => ({ state: { ...s.state, level, updatedAt: Date.now() } })),
      setGold: (gold) => set((s) => ({ state: { ...s.state, gold: Math.max(0, gold), updatedAt: Date.now() } })),
      bumpGold: (delta) =>
        set((s) => ({ state: { ...s.state, gold: Math.max(0, s.state.gold + delta), updatedAt: Date.now() } })),
      setHp: (hp) =>
        set((s) => ({ state: { ...s.state, hp: Math.max(0, Math.min(100, hp)), updatedAt: Date.now() } })),
      setBoardState: (boardState) => set((s) => ({ state: { ...s.state, boardState, updatedAt: Date.now() } })),

      addRosterUnit: (unitId, stars) =>
        set((s) => ({
          state: {
            ...s.state,
            roster: [...s.state.roster, { instanceId: newInstanceId(), unitId, stars }],
            recentUnits: [unitId, ...s.state.recentUnits.filter((x) => x !== unitId)].slice(0, 8),
            updatedAt: Date.now(),
          },
        })),
      removeRosterUnit: (instanceId) =>
        set((s) => ({
          state: { ...s.state, roster: s.state.roster.filter((u) => u.instanceId !== instanceId), updatedAt: Date.now() },
        })),
      cycleRosterStars: (instanceId) =>
        set((s) => ({
          state: {
            ...s.state,
            roster: s.state.roster.map((u) =>
              u.instanceId === instanceId ? { ...u, stars: ((u.stars % 3) + 1) as UnitStars } : u,
            ),
            updatedAt: Date.now(),
          },
        })),

      toggleItemDirection: (d) =>
        set((s) => ({
          state: {
            ...s.state,
            itemDirections: s.state.itemDirections.includes(d)
              ? s.state.itemDirections.filter((x) => x !== d)
              : [...s.state.itemDirections, d],
            updatedAt: Date.now(),
          },
        })),

      setAugmentChoices: (a) => set((s) => ({ state: { ...s.state, augmentChoices: a, updatedAt: Date.now() } })),

      setRoadmap: (r) => set({ lastRoadmap: r }),
      setIsPlanning: (b) => set({ isPlanning: b }),
      toggleFavoriteUnit: (unitId) =>
        set((s) => ({
          state: {
            ...s.state,
            favoriteUnits: s.state.favoriteUnits.includes(unitId)
              ? s.state.favoriteUnits.filter((x) => x !== unitId)
              : [...s.state.favoriteUnits, unitId],
          },
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : ({} as Storage))),
      partialize: (s) => ({ state: s.state, lastRoadmap: s.lastRoadmap }),
      version: 2,
    },
  ),
);
