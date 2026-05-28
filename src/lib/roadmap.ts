import type { GameState, ItemDirection, RoundCode } from "./types";
import { findUnit } from "./data/units";
import { findItem } from "./data/items";
import { computeInterest, countRoster, recommendedLevel, topCost } from "./economy";
import { topMatches, getMeta, type DeckMatch } from "./deckMatch";

export type PlayStyle = "fast8" | "standard" | "reroll" | "undecided";

export interface Roadmap {
  styleLabel: string;
  direction: { name: string; reason: string; alt?: string };
  metaMatches: DeckMatch[];
  metaPatch: string;
  targetBoard?: {
    deckName: string;
    units: { name: string; cost: number; star: number; items: string[]; isCarry: boolean; owned: boolean }[];
    missing: string[];
    augments: string[];
  };
  immediateActions: string[];
  milestones: { round: string; action: string; key?: boolean }[];
  levelPlan: { round: string; level: number; note: string }[];
  economyPlan: string;
  augmentRanking: { augmentId: string; augmentName: string; rank: 1 | 2 | 3; reason: string }[];
  risks: string[];
  nextCheckpoint: string;
  confidence: number;
  generatedAt: number;
}

const DIR_LABEL: Record<ItemDirection, string> = {
  AD: "AD(공격)",
  AP: "AP(주문)",
  Tank: "탱커",
  Flex: "유연",
};

const DIR_CARRY: Record<ItemDirection, string> = {
  AD: "AD 원딜 캐리",
  AP: "AP 마법 캐리",
  Tank: "탱+서브캐리 운영",
  Flex: "유연 운영",
};

function roundIndex(r: RoundCode): number {
  return ["2-1", "2-5", "3-2", "3-5", "4-1", "4-2", "4-5", "5-1", "5-5", "6-1"].indexOf(r);
}

function dominantDir(state: GameState): ItemDirection | null {
  if (state.items.length === 0) return null;
  const score: Record<ItemDirection, number> = { AD: 0, AP: 0, Tank: 0, Flex: 0 };
  for (const id of state.items) {
    const def = findItem(id);
    if (!def) continue;
    // 완성 아이템 가중 2, 재료 1
    const w = def.kind === "completed" ? 2 : 1;
    for (const d of def.directions) score[d] += w;
  }
  let best: ItemDirection | null = null;
  let max = 0;
  (["AD", "AP", "Tank", "Flex"] as ItemDirection[]).forEach((d) => {
    if (score[d] > max) {
      max = score[d];
      best = d;
    }
  });
  return best;
}

function decideStyle(state: GameState): PlayStyle {
  const counts = countRoster(state.roster);
  const tc = topCost(state.roster);
  const pairsLowCost = counts.filter((c) => {
    const def = findUnit(c.unitId);
    return def && def.cost <= 3 && c.totalCopiesVisible >= 2;
  }).length;

  if (state.roster.length === 0) return "undecided";
  // 저코 페어 많고 4코 캐리 없음 → 리롤
  if (pairsLowCost >= 3 && tc <= 3) return "reroll";
  // 4코+ 보유 + 골드 많음 + 체력 안정 → fast8
  if (tc >= 4 && state.gold >= 40 && state.hp >= 50) return "fast8";
  return "standard";
}

function styleLabel(s: PlayStyle): string {
  return {
    fast8: "Fast 8 (레벨 우선 → 4·5코 캐리)",
    standard: "스탠다드 (4-1 7레벨 롤다운)",
    reroll: "리롤 (저코 3성 굳히기)",
    undecided: "방향 미정 (유닛 입력 필요)",
  }[s];
}

function buildMilestones(state: GameState, style: PlayStyle): Roadmap["milestones"] {
  const cur = roundIndex(state.round);
  const all: { round: RoundCode; std: string; fast8: string; reroll: string; key?: boolean }[] = [
    {
      round: "2-1",
      std: "강한 보드 우선 + 페어 유지. 아이템 방향 파악. 덱 확정 X",
      fast8: "연승 노림 보드 + 경제 동시. 레벨 빠르게",
      reroll: "리롤 후보 페어 모으기. 아이템 캐리에 몰아주기",
      key: true,
    },
    {
      round: "2-5",
      std: "5레벨 + 자연 2성 기다림. 연패면 돈 보존",
      fast8: "5레벨 + 50골 향해 경제. 보드 약하면 8골만",
      reroll: "5레벨 X 가능. 핵심 1·2코 페어 우선",
    },
    {
      round: "3-2",
      std: "6레벨 안정화. 체력·골드 안정이면 리롤 X, 이자",
      fast8: "6레벨 + 50골. 리롤 절대 X. 자연 2성만",
      reroll: "리롤 시작 타이밍. 핵심 3성 노리면 30골까지",
      key: true,
    },
    {
      round: "3-5",
      std: "7레벨 빠른 진입 고려. 체력 낮으면 중간 안정화",
      fast8: "7레벨 진입. 4코 캐리 슬롯 비워두기",
      reroll: "리롤 지속 or 핵심 3성 1개 굳히기",
    },
    {
      round: "4-1",
      std: "⭐7레벨 30골까지 롤다운. 캐리·앞라인 2성 목표",
      fast8: "⭐8레벨 직행 or 7렙 살짝 롤. 4코 2성 1개",
      reroll: "⭐핵심 3성 마무리. 안 되면 손절 판단",
      key: true,
    },
    {
      round: "4-2",
      std: "증강 후 방향 재점검. 전투력 부족하면 돈 사용",
      fast8: "증강 = 전투/고밸류. 8레벨 보드 채우기",
      reroll: "증강 = 리롤/경제. 3성 추가 노림",
    },
    {
      round: "4-5",
      std: "8레벨 + 핵심 4코 페어. 체력 관리",
      fast8: "8레벨 보드 완성도 올리기. 5코 1장 욕심 가능",
      reroll: "8레벨 전환 or 리롤 마무리. 서브 2성 채우기",
    },
    {
      round: "5-1",
      std: "⭐8레벨 최종 조합. 핵심 2성작 우선",
      fast8: "⭐8~9레벨. 5코 캐리/레전더리 욕심",
      reroll: "⭐최종 보드. 남는 골드로 8레벨 보강",
      key: true,
    },
    {
      round: "5-5",
      std: "체력 낮으면 올인 리롤. 높으면 고밸류 전환",
      fast8: "9레벨 5코 다수. 보드 파워 극대화",
      reroll: "고밸류 전환 or 현 보드 굳히기",
    },
    {
      round: "6-1",
      std: "체력 여유 시 9레벨 5코. 아니면 현 보드 유지",
      fast8: "9레벨 완성. 1~4등 굳히기",
      reroll: "마지막 스파이크. 무리한 레벨 X",
    },
  ];
  return all
    .filter((m) => roundIndex(m.round) >= cur)
    .map((m) => ({
      round: m.round,
      action: style === "fast8" ? m.fast8 : style === "reroll" ? m.reroll : m.std,
      key: m.key,
    }));
}

function buildLevelPlan(state: GameState, style: PlayStyle): Roadmap["levelPlan"] {
  const cur = roundIndex(state.round);
  const checkpoints: RoundCode[] = ["3-2", "4-1", "4-5", "5-1", "6-1"];
  return checkpoints
    .filter((r) => roundIndex(r) >= cur)
    .map((r) => {
      let level = recommendedLevel(r);
      let note = "";
      if (style === "fast8") {
        const m: Record<string, number> = { "3-2": 6, "4-1": 8, "4-5": 8, "5-1": 9, "6-1": 9 };
        level = m[r] ?? level;
        note = r === "4-1" ? "경험치 사서 8레벨 직행" : "";
      } else if (style === "reroll") {
        const m: Record<string, number> = { "3-2": 6, "4-1": 7, "4-5": 8, "5-1": 8, "6-1": 9 };
        level = m[r] ?? level;
        note = r === "4-1" ? "레벨 멈추고 리롤" : "";
      } else {
        note = r === "4-1" ? "7레벨에서 롤다운" : "";
      }
      return { round: r, level, note };
    });
}

function buildImmediate(state: GameState, style: PlayStyle, dir: ItemDirection | null, best?: DeckMatch): string[] {
  const out: string[] = [];
  const interest = computeInterest(state.gold);
  const counts = countRoster(state.roster);
  const recLv = recommendedLevel(state.round);

  // 레벨
  if (state.level < recLv) out.push(`레벨업 → ${recLv} (현재 ${state.level}, 한 박자 늦음)`);
  else if (style === "fast8" && state.gold >= 40) out.push(`경험치 사서 레벨 우선 (${state.level}→${state.level + 1})`);
  else out.push(`레벨 유지 (${state.level}) — 지금은 ${interest.tier}골 이자가 우선`);

  // 경제
  if (interest.tier < 50 && state.hp >= 50 && style !== "reroll") {
    out.push(`${interest.tier}골 → 다음 이자 구간까지 모으기 (지금 안 쓰는 게 이득)`);
  }

  // 리롤
  if (style === "reroll" && (state.round === "3-2" || state.round === "4-1")) {
    out.push(`리롤 시작 — 30골까지 (핵심 3성각 보고 멈춤)`);
  } else if (state.hp < 40) {
    out.push(`체력 위급 → 20골까지 써서 보드 안정화 우선`);
  } else {
    out.push(`리롤 X — 자연 수급으로 충분`);
  }

  // 매칭 덱 기준 "다음 영입" (가장 구체적인 행동)
  if (best) {
    const ownedSet = new Set(best.ownedUnits);
    const nextCarry = best.deck.units.filter((u) => u.isCarry && !ownedSet.has(u.name));
    if (nextCarry.length) {
      out.push(`다음 핵심 영입: ${nextCarry.map((u) => `${u.name}(${u.cost}코)`).join(", ")} — 캐리라 최우선`);
    }
    const carryItems = best.deck.units.find((u) => u.isCarry)?.items ?? [];
    if (carryItems.length) {
      out.push(`캐리 아이템 목표: ${best.deck.units.find((u) => u.isCarry)?.name} = ${carryItems.join(" + ")}`);
    }
  }

  // 2성각
  const upgradeable = counts.filter((c) => c.canUpgradeToTwoStar);
  if (upgradeable.length > 0) {
    out.push(
      `2성 굳히기: ${upgradeable.map((c) => findUnit(c.unitId)?.nameKo ?? c.unitId).slice(0, 3).join(", ")}`,
    );
  }

  if (dir && !best) out.push(`아이템은 ${DIR_LABEL[dir]} 캐리에 몰아주기`);
  return out;
}

function decideAugments(state: GameState): Roadmap["augmentRanking"] {
  if (state.augmentChoices.length === 0) return [];
  const dir = dominantDir(state);
  const scored = state.augmentChoices.map((a) => {
    let score = 50;
    let reason = "기본 가치";
    if (a.type === "combat") {
      const need = state.boardState === "weak" || state.hp < 50;
      score += need ? 35 : 12;
      reason = need ? "보드 약함/체력 낮음 → 즉시 전투력 최우선" : "전투 안정성 보강";
    } else if (a.type === "economy") {
      score += state.hp >= 70 ? 32 : -8;
      reason = state.hp >= 70 ? "체력 여유 → 경제 굴려서 후반 폭발" : "체력 낮아 경제는 느림";
    } else if (a.type === "item") {
      score += dir ? 24 : 6;
      reason = dir ? `아이템 방향(${DIR_LABEL[dir]}) 뚜렷 → 효율 큼` : "아이템 방향 애매하면 효과 ↓";
    } else if (a.type === "reroll") {
      const hasPair = countRoster(state.roster).some((c) => c.isPair);
      score += hasPair ? 22 : -6;
      reason = hasPair ? "페어 있어 리롤 시너지 OK" : "페어 부족 → 리롤 증강 매력 ↓";
    } else if (a.type === "emblem" || a.type === "trait") {
      score += 16;
      reason = "라인 연결되면 가치 큼 — 다른 두 개와 비교";
    } else if (a.type === "highValue") {
      score += state.hp >= 60 ? 20 : -10;
      reason = state.hp >= 60 ? "체력 여유 → 고밸류 OK" : "체력 낮으면 고밸류 위험";
    }
    return { augmentId: a.id, augmentName: a.name, score, reason };
  });
  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, 3).map((s, i) => ({
    augmentId: s.augmentId,
    augmentName: s.augmentName,
    rank: (i + 1) as 1 | 2 | 3,
    reason: s.reason,
  }));
}

function nextCheckpointText(round: RoundCode): string {
  const order: RoundCode[] = ["3-2", "4-1", "5-1"];
  for (const cp of order) {
    if (roundIndex(cp) > roundIndex(round)) return `${cp} 도착하면 다시 입력 (방향 재점검)`;
  }
  return "게임 막바지 — 현 플랜대로 마무리";
}

export function buildRoadmap(state: GameState): Roadmap {
  const inputStyle = decideStyle(state);
  const dir = dominantDir(state);
  const interest = computeInterest(state.gold);
  const matches = topMatches(state, 3);
  const best = matches[0];
  // 매칭 덱이 있으면 그 덱의 운영 스타일로 통일 (로드맵 일관성). 없으면 입력 추론.
  const style: PlayStyle = best ? best.deck.style : inputStyle;

  // 목표 완성형 보드 (매칭 덱)
  const ownedSet = best ? new Set(best.ownedUnits) : new Set<string>();
  const targetBoard = best
    ? {
        deckName: best.deck.name,
        units: best.deck.units
          .slice()
          .sort((a, b) => Number(b.isCarry) - Number(a.isCarry) || b.cost - a.cost)
          .map((u) => ({
            name: u.name,
            cost: u.cost,
            star: u.star,
            items: u.items,
            isCarry: u.isCarry,
            owned: ownedSet.has(u.name),
          })),
        missing: best.deck.units.filter((u) => !ownedSet.has(u.name)).map((u) => u.name),
        augments: best.deck.augments,
      }
    : undefined;

  // 메타 덱 매칭이 있으면 그게 방향. 없으면 룰베이스 추론 fallback.
  const directionName = best
    ? best.deck.name
    : style === "undecided"
      ? "유닛을 입력하면 방향을 잡아줄게요"
      : dir
        ? DIR_CARRY[dir]
        : "아이템 방향 입력 시 더 정확";
  const directionReason = best
    ? `현재 메타(${getMeta().patch}) 매칭 — ${best.reasons.join(" · ")}`
    : style === "undecided"
      ? "보유 유닛을 입력하면 현재 메타 덱과 매칭해줄게요."
      : `${dir ? DIR_LABEL[dir] + " 아이템 + " : ""}최고 코스트 ${topCost(state.roster)}코 보유 → ${styleLabel(style)} (메타 덱 매칭 0 — 유닛 더 입력)`;

  const risks: string[] = [];
  if (state.hp < 40) risks.push("체력 40 미만 — 분기점 안 기다리고 즉시 안정화(리롤/레벨)로 전환");
  if (state.gold < 20 && roundIndex(state.round) >= 2) risks.push("골드 부족 — 리롤 자제 + 보드 정리로 이자 회복");
  if (state.roster.length > 0 && style === "fast8" && state.hp < 50)
    risks.push("Fast 8 인데 체력 낮음 — 무리하면 죽어요. 7레벨 안정화로 플랜 B");
  if (state.items.length === 0) risks.push("아이템 미입력 — 캐리 타입 추천 정확도 ↓");

  return {
    styleLabel: best ? styleLabel(best.deck.style) : styleLabel(style),
    direction: { name: directionName, reason: directionReason, alt: matches[1]?.deck.name },
    metaMatches: matches,
    metaPatch: getMeta().patch,
    targetBoard,
    immediateActions: buildImmediate(state, style, dir, best),
    milestones: buildMilestones(state, style),
    levelPlan: buildLevelPlan(state, style),
    economyPlan:
      style === "reroll"
        ? "리롤덱은 이자보다 보드 파워. 핵심 3성 전까지 30골 선에서 리롤."
        : `${interest.tier}골 이자 유지가 기본. 체력 60+ 면 50골 캡까지 모으고 분기점에 몰아 쓰기.`,
    augmentRanking: decideAugments(state),
    risks,
    nextCheckpoint: nextCheckpointText(state.round),
    confidence: best ? Math.max(0.5, Math.min(0.95, 0.4 + best.score * 0.6)) : style === "undecided" ? 0.2 : dir ? 0.6 : 0.45,
    generatedAt: Date.now(),
  };
}
