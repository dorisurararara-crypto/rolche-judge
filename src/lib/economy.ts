import type {
  GameState,
  InterestInfo,
  UnitCountInfo,
  UnitInstance,
  DirectionScore,
} from "./types";
import { ITEMS } from "./data/items";
import { UNITS } from "./data/units";

export function interestTierFor(gold: number): InterestInfo["tier"] {
  if (gold >= 50) return 50;
  if (gold >= 40) return 40;
  if (gold >= 30) return 30;
  if (gold >= 20) return 20;
  if (gold >= 10) return 10;
  return 0;
}

export function computeInterest(gold: number): InterestInfo {
  const tier = interestTierFor(gold);
  const overflow40 = Math.max(0, gold - 40);
  const overflow30 = Math.max(0, gold - 30);
  const overflow20 = Math.max(0, gold - 20);
  return {
    tier,
    safeSpendLimit: tier >= 40 ? overflow40 : 0,
    normalSpendLimit: tier >= 30 ? overflow30 : Math.max(0, gold - 30),
    emergencySpendLimit: tier >= 20 ? overflow20 : Math.max(0, gold - 20),
  };
}

export function sellValue(unit: UnitInstance): number {
  const def = UNITS.find((u) => u.id === unit.unitId);
  if (!def) return 1;
  if (unit.stars === 1) return def.cost;
  if (unit.stars === 2) return def.cost * 3 - 1;
  return def.cost * 9 - 1;
}

export function countAllUnits(state: GameState): UnitCountInfo[] {
  const acc = new Map<string, { count: number; stars: number[] }>();
  for (const b of state.board) {
    if (b.unit) {
      const cur = acc.get(b.unit.unitId) ?? { count: 0, stars: [] };
      const copies = Math.pow(3, b.unit.stars - 1);
      cur.count += copies;
      cur.stars.push(b.unit.stars);
      acc.set(b.unit.unitId, cur);
    }
  }
  for (const s of state.bench) {
    if (s.unit) {
      const cur = acc.get(s.unit.unitId) ?? { count: 0, stars: [] };
      const copies = Math.pow(3, s.unit.stars - 1);
      cur.count += copies;
      cur.stars.push(s.unit.stars);
      acc.set(s.unit.unitId, cur);
    }
  }
  for (const s of state.shop) {
    if (s.unitId) {
      const cur = acc.get(s.unitId) ?? { count: 0, stars: [] };
      cur.count += 1;
      acc.set(s.unitId, cur);
    }
  }
  const out: UnitCountInfo[] = [];
  acc.forEach((v, unitId) => {
    out.push({
      unitId,
      totalCopiesVisible: v.count,
      starsOnBoard: v.stars as UnitCountInfo["starsOnBoard"],
      canUpgradeToTwoStar: v.count >= 3,
      canUpgradeToThreeStar: v.count >= 9,
      isPair: v.count === 2,
    });
  });
  return out;
}

export function directionScore(state: GameState): DirectionScore {
  const out: DirectionScore = { AD: 0, AP: 0, Tank: 0, Flex: 0 };
  const addFromItemId = (id: string, weight = 1) => {
    const def = ITEMS.find((i) => i.id === id);
    if (!def) return;
    for (const d of def.directions) {
      out[d] += weight;
    }
  };
  for (const id of state.benchItems) addFromItemId(id, 1);
  for (const b of state.board) {
    if (b.unit) for (const id of b.unit.items) addFromItemId(id, 2);
  }
  for (const b of state.bench) {
    if (b.unit) for (const id of b.unit.items) addFromItemId(id, 2);
  }
  const total = out.AD + out.AP + out.Tank + out.Flex || 1;
  return {
    AD: Math.round((out.AD / total) * 100),
    AP: Math.round((out.AP / total) * 100),
    Tank: Math.round((out.Tank / total) * 100),
    Flex: Math.round((out.Flex / total) * 100),
  };
}

export function dominantDirection(s: DirectionScore): keyof DirectionScore {
  let best: keyof DirectionScore = "Flex";
  let max = -1;
  (["AD", "AP", "Tank", "Flex"] as (keyof DirectionScore)[]).forEach((k) => {
    if (s[k] > max) {
      max = s[k];
      best = k;
    }
  });
  return best;
}

export function recommendedLevel(round: GameState["round"]): number {
  const map: Record<string, number> = {
    "2-1": 4,
    "2-5": 5,
    "3-2": 6,
    "3-5": 6,
    "4-1": 7,
    "4-2": 7,
    "4-5": 8,
    "5-1": 8,
    "5-5": 8,
    "6-1": 9,
  };
  return map[round] ?? 7;
}
