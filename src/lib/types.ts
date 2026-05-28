export type UnitCost = 1 | 2 | 3 | 4 | 5;
export type UnitStars = 1 | 2 | 3;
export type UnitRole =
  | "carry"
  | "secondaryCarry"
  | "frontline"
  | "utility"
  | "traitBot"
  | "itemHolder"
  | "unknown";

export interface UnitDef {
  id: string;
  nameEn: string;
  nameKo: string;
  cost: UnitCost;
  traits?: string[];
}

export interface UnitInstance {
  instanceId: string;
  unitId: string;
  stars: UnitStars;
  items: string[];
  role?: UnitRole;
}

export interface BoardSlot {
  slotId: string;
  row: "front" | "mid" | "back";
  col: number;
  unit?: UnitInstance;
}

export interface BenchSlot {
  index: number;
  unit?: UnitInstance;
}

export interface ShopSlot {
  index: number;
  unitId?: string;
}

export type ItemKind = "component" | "completed";
export type ItemDirection = "AD" | "AP" | "Tank" | "Flex";

export interface ItemDef {
  id: string;
  nameEn: string;
  nameKo: string;
  kind: ItemKind;
  directions: ItemDirection[];
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
  board: BoardSlot[];
  bench: BenchSlot[];
  shop: ShopSlot[];
  benchItems: string[];
  augmentChoices: AugmentChoice[];
  question: string;
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
  starsOnBoard: UnitStars[];
  canUpgradeToTwoStar: boolean;
  canUpgradeToThreeStar: boolean;
  isPair: boolean;
}

export interface DirectionScore {
  AD: number;
  AP: number;
  Tank: number;
  Flex: number;
}
