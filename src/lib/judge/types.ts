import type { GameState } from "../types";

export type ShopAction =
  | "buy"
  | "skip"
  | "hold_if_economy_allows"
  | "buy_if_board_weak"
  | "buy_if_interest_not_broken"
  | "buy_only_if_pair"
  | "sell_after_buy"
  | "unknown";

export type SellAction =
  | "sell"
  | "sell_if_need_interest"
  | "hold"
  | "never_sell_now"
  | "replace_later"
  | "unknown";

export type RollAction =
  | "do_not_roll"
  | "roll_small"
  | "roll_until_stable"
  | "roll_down_to_30"
  | "roll_down_to_20"
  | "all_in";

export type LevelAction =
  | "do_not_level"
  | "level_now"
  | "level_next_round"
  | "level_after_interest"
  | "fast8_plan"
  | "stay_and_roll";

export interface JudgeRequest {
  state: GameState;
}

export interface JudgeResponse {
  mainDecision: string;
  confidence: number;
  spendLimit: {
    safe: number;
    normal: number;
    emergency: number;
    recommended: number;
    reason: string;
  };
  shopActions: { unitId: string; action: ShopAction; reason: string }[];
  sellActions: { unitId: string; action: SellAction; reason: string }[];
  rollDecision: {
    action: RollAction;
    maxGoldToSpend: number;
    stopCondition: string;
    reason: string;
  };
  levelDecision: { action: LevelAction; reason: string };
  augmentAdvice: {
    ranking: { augmentId: string; augmentName: string; rank: 1 | 2 | 3; reason: string }[];
  };
  nextTiming: string;
  turnPlan: string[];
  warnings: string[];
  generatedAt: number;
  providerName: string;
}

export interface JudgeProvider {
  name: string;
  judge(req: JudgeRequest): Promise<JudgeResponse>;
}
