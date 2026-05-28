export type UnitCost = 1 | 2 | 3 | 4 | 5;
export type UnitStars = 1 | 2 | 3;

export interface UnitDef {
  id: string;
  nameEn: string;
  nameKo: string;
  cost: UnitCost;
  traits?: string[];
}

export interface RosterUnit {
  instanceId: string;
  unitId: string;
  stars: UnitStars;
}

export type ItemDirection = "AD" | "AP" | "Tank" | "Flex";
export type ItemKind = "component" | "completed";

export interface ItemDef {
  id: string;
  nameEn: string;
  nameKo: string;
  kind: ItemKind;
  directions: ItemDirection[];
}

export type AugmentTier = "silver" | "gold" | "prismatic";

export interface AugmentDef {
  id: string;
  nameEn: string;
  nameKo: string;
  tier: AugmentTier;
  type: AugmentType;
}

export type RoundCode =
  | "2-1"
  | "2-5"
  | "3-2"
  | "3-5"
  | "4-1"
  | "4-2"
  | "4-5"
  | "5-1"
  | "5-5"
  | "6-1";

// 핵심 분기점 (입력 권장 지점)
export const CHECKPOINTS: RoundCode[] = ["2-1", "3-2", "4-1", "5-1"];

export type BoardState =
  | "strong"
  | "ambiguous"
  | "weak"
  | "winStreak"
  | "loseStreak";

export type AugmentType =
  | "combat"
  | "economy"
  | "item"
  | "reroll"
  | "emblem"
  | "trait"
  | "highValue"
  | "unknown";

export interface AugmentChoice {
  id: string;
  name: string;
  type: AugmentType;
}

export interface GameState {
  round: RoundCode;
  level: number;
  gold: number;
  hp: number;
  boardState: BoardState;
  roster: RosterUnit[];
  items: string[];
  augmentChoices: AugmentChoice[];
  recentUnits: string[];
  favoriteUnits: string[];
  createdAt: number;
  updatedAt: number;
}

export interface InterestInfo {
  tier: 0 | 10 | 20 | 30 | 40 | 50;
  safeSpendLimit: number;
  normalSpendLimit: number;
  emergencySpendLimit: number;
}

export interface UnitCountInfo {
  unitId: string;
  totalCopiesVisible: number;
  canUpgradeToTwoStar: boolean;
  canUpgradeToThreeStar: boolean;
  isPair: boolean;
}
