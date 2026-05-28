import type { GameState, ShopSlot } from "../types";
import { findUnit } from "../data/units";
import {
  computeInterest,
  countAllUnits,
  directionScore,
  dominantDirection,
  recommendedLevel,
} from "../economy";
import type { JudgeProvider, JudgeRequest, JudgeResponse, ShopAction } from "./types";

const ROUND_NOTES: Record<string, string> = {
  "2-1": "덱 확정 금지. 강한 보드 우선 + 페어/2성 중심 구매.",
  "2-5": "5레벨 여부 판단. 연승이면 레벨업, 연패면 돈 보존.",
  "3-2": "6레벨 안정화 타이밍. 체력/골드 안정이면 리롤 X.",
  "3-5": "7레벨 빠른 진입 고려. 체력 낮으면 중간 안정화.",
  "4-1": "방향 확정 타이밍. 7레벨 롤다운 또는 8레벨 욕심 판단.",
  "4-2": "증강체 후 방향 재판단. 전투력 부족하면 돈 사용.",
  "4-5": "8레벨 직전. 핵심 4코 페어 찾기.",
  "5-1": "최종 조합 완성. 핵심 2성작 우선.",
  "5-5": "체력 낮으면 올인. 높으면 고밸류 전환 가능.",
  "6-1": "9레벨 5코 전환 판단. 체력 여유 필수.",
};

function decideShop(slot: ShopSlot, state: GameState): { action: ShopAction; reason: string } {
  if (!slot.unitId) return { action: "skip", reason: "빈 슬롯이에요." };
  const def = findUnit(slot.unitId);
  if (!def) return { action: "unknown", reason: "유닛 정보를 찾을 수 없어요." };

  const counts = countAllUnits(state);
  const countInfo = counts.find((c) => c.unitId === slot.unitId);
  const total = countInfo?.totalCopiesVisible ?? 1;
  const direction = dominantDirection(directionScore(state));
  const interest = computeInterest(state.gold);
  const cost = def.cost;

  if (countInfo?.canUpgradeToTwoStar) {
    return { action: "buy", reason: `${def.nameKo} 2성 완성 가능 (보유 ${total}장).` };
  }
  if (total >= 2 && cost <= 3) {
    return {
      action: "buy",
      reason: `${def.nameKo} 페어 + 2성각 (보유 ${total}장).`,
    };
  }
  if (cost === 4 && state.round >= "4-1" && direction === "AD") {
    return {
      action: "buy",
      reason: `4-1+ 4코 캐리 후보. 현재 방향(${direction})과 매치.`,
    };
  }
  if (cost === 5 && state.level < 8) {
    return {
      action: "skip",
      reason: `5코는 8레벨 이전에는 강한 베이스가 없으면 패스.`,
    };
  }
  if (cost === 1 && state.gold >= 30) {
    return {
      action: "skip",
      reason: `1코 1성은 이자 구간 유지가 우선.`,
    };
  }
  if (interest.tier >= 40 && cost > interest.safeSpendLimit) {
    return {
      action: "buy_if_interest_not_broken",
      reason: `이거 사면 40골 이자가 깨질 수 있어요. 보드 약하면 사고, 아니면 넘겨도 됨.`,
    };
  }
  if (state.boardState === "weak" || state.boardState === "loseStreak") {
    return {
      action: "buy_if_board_weak",
      reason: `보드가 약하니 보강 우선. 그래도 페어 우선순위.`,
    };
  }
  return {
    action: "hold_if_economy_allows",
    reason: `지금 당장 필요 X, 이자 유지가 더 좋아요.`,
  };
}

function decideRoll(state: GameState): JudgeResponse["rollDecision"] {
  const counts = countAllUnits(state);
  const anyPair = counts.some((c) => c.isPair && c.totalCopiesVisible >= 2);

  if (state.hp >= 60 && state.gold >= 40 && state.boardState !== "weak") {
    return {
      action: "do_not_roll",
      maxGoldToSpend: 0,
      stopCondition: "리롤하지 않음",
      reason: "체력 안정 + 40골 이자 유지가 우선이에요.",
    };
  }
  if (state.round === "3-2" && state.hp < 50 && state.boardState === "weak") {
    return {
      action: "roll_small",
      maxGoldToSpend: 12,
      stopCondition: "앞라인 2성 1개 또는 핵심 캐리 페어가 붙으면 중단",
      reason: "3-2 + 체력 낮음 + 보드 약함 → 소량 안정화 리롤.",
    };
  }
  if (state.round === "4-1" && state.level >= 7 && state.boardState !== "strong") {
    return {
      action: "roll_down_to_30",
      maxGoldToSpend: Math.max(0, state.gold - 30),
      stopCondition: "핵심 4코 2장 + 앞라인 2성 1개",
      reason: "4-1 안정화 — 30골까지는 깨도 OK.",
    };
  }
  if (state.hp <= 30) {
    return {
      action: "roll_down_to_20",
      maxGoldToSpend: Math.max(0, state.gold - 20),
      stopCondition: "지금 살릴 만한 2성 1-2개",
      reason: "체력 위급 → 20골까지 깨고 안정화 우선.",
    };
  }
  if (anyPair) {
    return {
      action: "roll_small",
      maxGoldToSpend: 8,
      stopCondition: "현재 페어 중 1장만 더 붙으면 중단",
      reason: "페어가 있고 보드 강화 필요 — 8골만 가볍게.",
    };
  }
  return {
    action: "do_not_roll",
    maxGoldToSpend: 0,
    stopCondition: "리롤하지 않음",
    reason: "지금은 이자 유지가 가장 큰 가치.",
  };
}

function decideLevel(state: GameState): JudgeResponse["levelDecision"] {
  const rec = recommendedLevel(state.round);
  if (state.level < rec - 1) {
    return { action: "level_now", reason: `${state.round} 적정 레벨 ${rec}. 한 레벨 늦었어요.` };
  }
  if (state.level === rec - 1 && state.gold >= 30) {
    return { action: "level_after_interest", reason: "이자 유지 후 다음 턴 레벨업 권장." };
  }
  if (state.round === "4-1" && state.level === 7) {
    return { action: "do_not_level", reason: "4-1 7레벨 = 롤다운 타이밍. 레벨업 X." };
  }
  if (state.round === "5-1" && state.level === 7 && state.gold >= 50) {
    return { action: "fast8_plan", reason: "5-1 50골 7레벨 → 8레벨 진입 후 안정화." };
  }
  return { action: "do_not_level", reason: "현재 레벨과 라운드가 맞아요." };
}

function decideAugment(state: GameState): JudgeResponse["augmentAdvice"] {
  if (state.augmentChoices.length === 0) {
    return { ranking: [] };
  }
  const scored = state.augmentChoices.map((a) => {
    let score = 50;
    let reason = "기본 가치.";
    if (a.type === "combat") {
      score += state.boardState === "weak" || state.hp < 50 ? 35 : 10;
      reason = state.boardState === "weak" || state.hp < 50
        ? "보드 약하거나 체력 낮음 → 즉시 전투력 최우선."
        : "전투 안정성 보강.";
    }
    if (a.type === "economy") {
      score += state.hp >= 70 ? 30 : -10;
      reason = state.hp >= 70
        ? "체력 여유 있음 → 경제 증강 1순위 후보."
        : "체력 낮아 경제 증강은 느려요. 우선순위 낮음.";
    }
    if (a.type === "item") {
      const dir = directionScore(state);
      const max = Math.max(dir.AD, dir.AP, dir.Tank, dir.Flex);
      score += max >= 50 ? 25 : 5;
      reason = max >= 50
        ? "현재 아이템 방향이 뚜렷해서 아이템 증강 효과 큼."
        : "아이템 방향이 애매하면 아이템 증강 효과 줄어요.";
    }
    if (a.type === "reroll") {
      const counts = countAllUnits(state);
      const hasLowCostPair = counts.some((c) => c.isPair);
      score += hasLowCostPair ? 25 : -5;
      reason = hasLowCostPair
        ? "페어 있어서 리롤 증강 시너지 OK."
        : "페어 부족하면 리롤 증강 매력 ↓.";
    }
    if (a.type === "emblem" || a.type === "trait") {
      score += 15;
      reason = "해당 라인 연결 가능하면 가치 큼. 다른 두 증강과 비교 필요.";
    }
    if (a.type === "highValue") {
      score += state.hp >= 60 ? 20 : -10;
      reason = state.hp >= 60
        ? "체력 여유 → 고밸류 전환 OK."
        : "체력 낮으면 고밸류 위험.";
    }
    return { augmentId: a.id, augmentName: a.name, score, reason };
  });
  scored.sort((a, b) => b.score - a.score);
  return {
    ranking: scored.slice(0, 3).map((s, i) => ({
      augmentId: s.augmentId,
      augmentName: s.augmentName,
      rank: (i + 1) as 1 | 2 | 3,
      reason: s.reason,
    })),
  };
}

export const mockJudgeProvider: JudgeProvider = {
  name: "mock",
  async judge({ state }: JudgeRequest): Promise<JudgeResponse> {
    const interest = computeInterest(state.gold);
    const direction = directionScore(state);
    const dominant = dominantDirection(direction);
    const counts = countAllUnits(state);

    const shopActions = state.shop
      .map((slot) => {
        if (!slot.unitId) return null;
        const def = findUnit(slot.unitId);
        const decision = decideShop(slot, state);
        return def ? { unitId: slot.unitId, action: decision.action, reason: decision.reason } : null;
      })
      .filter((x): x is { unitId: string; action: ShopAction; reason: string } => x !== null);

    const sellActions: JudgeResponse["sellActions"] = [];
    for (const b of state.bench) {
      if (!b.unit) continue;
      const def = findUnit(b.unit.unitId);
      if (!def) continue;
      const ci = counts.find((c) => c.unitId === b.unit!.unitId);
      if (ci?.canUpgradeToTwoStar || ci?.canUpgradeToThreeStar) {
        sellActions.push({
          unitId: b.unit.unitId,
          action: "never_sell_now",
          reason: `${def.nameKo} 업그레이드 각이 살아있어요.`,
        });
        continue;
      }
      if (def.cost === 1 && b.unit.stars === 1 && state.round >= "3-2") {
        sellActions.push({
          unitId: b.unit.unitId,
          action: "sell_if_need_interest",
          reason: `${def.nameKo} 1코 1성 — 이자 맞추기용으로 OK.`,
        });
      }
    }

    const rollDecision = decideRoll(state);
    const levelDecision = decideLevel(state);
    const augmentAdvice = decideAugment(state);

    const dirText = `${dominant} (${direction.AD}/${direction.AP}/${direction.Tank}/${direction.Flex})`;
    const mainDecision = shopActions.find((s) => s.action === "buy")
      ? `우선 ${findUnit(shopActions.find((s) => s.action === "buy")!.unitId)?.nameKo} 구매 + ${rollDecision.action === "do_not_roll" ? "이자 유지" : "리롤"}.`
      : rollDecision.action === "do_not_roll"
        ? "이번 턴 이자 유지 — 사지도 팔지도 굳이 X."
        : "리롤 안정화 한 번.";

    const turnPlan: string[] = [];
    let i = 1;
    for (const s of shopActions) {
      if (s.action === "buy") {
        const def = findUnit(s.unitId);
        turnPlan.push(`${i++}. ${def?.nameKo ?? s.unitId} 구매`);
      } else if (s.action === "buy_if_interest_not_broken" || s.action === "buy_if_board_weak") {
        const def = findUnit(s.unitId);
        turnPlan.push(`${i++}. ${def?.nameKo ?? s.unitId}는 조건부 — ${s.reason}`);
      }
    }
    const sellForInterest = sellActions.find((s) => s.action === "sell_if_need_interest");
    if (sellForInterest) {
      const def = findUnit(sellForInterest.unitId);
      turnPlan.push(`${i++}. 이자 필요하면 ${def?.nameKo ?? sellForInterest.unitId} 판매`);
    }
    if (rollDecision.action === "do_not_roll") {
      turnPlan.push(`${i++}. 이번 턴 리롤 금지`);
    } else {
      turnPlan.push(`${i++}. 리롤 ${rollDecision.maxGoldToSpend}골까지 — ${rollDecision.stopCondition}`);
    }
    if (levelDecision.action === "level_now") {
      turnPlan.push(`${i++}. 레벨업 (현재 ${state.level} → ${state.level + 1})`);
    }
    turnPlan.push(`${i++}. 다음 라운드까지 ${interest.tier === 50 ? "50골 캡" : `${interest.tier}골 이자`} 유지`);

    const warnings: string[] = [];
    if (state.hp < 40) warnings.push("체력 위급 — 다음 1-2 전투 패 시 즉시 안정화 모드 전환");
    if (state.gold < 20 && state.round >= "3-2") warnings.push("돈 부족 — 리롤 자제 + 보드 정리 우선");
    if (state.shop.every((s) => !s.unitId)) warnings.push("상점이 비어있어요. 상점 5칸 입력해야 정확한 판단 가능");

    const nextTimingMap: Record<string, string> = {
      "2-1": "2-5에 5레벨 + 페어 자연 2성 노려요.",
      "2-5": "3-2에 6레벨 + 안정화 평가.",
      "3-2": "4-1에 7레벨에서 20~30골까지 롤다운 판단.",
      "3-5": "4-1 진입 — 핵심 캐리 확정 우선.",
      "4-1": "4-2 증강체 보고 방향 재판단.",
      "4-2": "4-5까지 50골 + 8레벨 준비.",
      "4-5": "5-1 8레벨 + 핵심 2성 안정화.",
      "5-1": "5-5까지 최종 조합 + 고밸류 전환 여유 판단.",
      "5-5": "6-1 9레벨 또는 8레벨 보강.",
      "6-1": "체력 여유 보고 5코 1-2장 욕심.",
    };
    const nextTiming = nextTimingMap[state.round] ?? "다음 라운드까지 골드/체력 관리.";

    return {
      mainDecision,
      confidence: 0.7,
      spendLimit: {
        safe: interest.safeSpendLimit,
        normal: interest.normalSpendLimit,
        emergency: interest.emergencySpendLimit,
        recommended:
          state.boardState === "weak" || state.hp < 40
            ? interest.emergencySpendLimit
            : interest.safeSpendLimit,
        reason: `현재 ${interest.tier}골 이자 / 방향 ${dirText} / ${ROUND_NOTES[state.round] ?? ""}`,
      },
      shopActions,
      sellActions,
      rollDecision,
      levelDecision,
      augmentAdvice,
      nextTiming,
      turnPlan,
      warnings,
      generatedAt: Date.now(),
      providerName: "mock",
    };
  },
};
