import type { GameState, InterestInfo, UnitCountInfo, RosterUnit } from "./types";
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
  return {
    tier,
    safeSpendLimit: Math.max(0, gold - 40),
    normalSpendLimit: Math.max(0, gold - 30),
    emergencySpendLimit: Math.max(0, gold - 20),
  };
}

export function sellValue(unit: RosterUnit): number {
  const def = UNITS.find((u) => u.id === unit.unitId);
  if (!def) return 1;
  if (unit.stars === 1) return def.cost;
  if (unit.stars === 2) return def.cost * 3 - 1;
  return def.cost * 9 - 1;
}

export function countRoster(roster: RosterUnit[]): UnitCountInfo[] {
  const acc = new Map<string, number>();
  for (const u of roster) {
    const copies = Math.pow(3, u.stars - 1);
    acc.set(u.unitId, (acc.get(u.unitId) ?? 0) + copies);
  }
  const out: UnitCountInfo[] = [];
  acc.forEach((count, unitId) => {
    out.push({
      unitId,
      totalCopiesVisible: count,
      canUpgradeToTwoStar: count >= 3,
      canUpgradeToThreeStar: count >= 9,
      isPair: count === 2,
    });
  });
  return out;
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

// 가장 비싼 보유 코스트 (캐리 후보 추정)
export function topCost(roster: RosterUnit[]): number {
  let max = 0;
  for (const u of roster) {
    const def = UNITS.find((d) => d.id === u.unitId);
    if (def && def.cost > max) max = def.cost;
  }
  return max;
}
