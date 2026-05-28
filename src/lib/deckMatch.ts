import metaData from "./data/meta-decks.json";
import { findUnit } from "./data/units";
import { countRoster } from "./economy";
import type { GameState } from "./types";

export interface MetaUnit {
  key: string;
  name: string;
  cost: number;
  star: number;
  items: string[];
  isCarry: boolean;
  row: number | null;
}
export interface MetaDeck {
  id: string;
  name: string;
  teamCost: number | null;
  units: MetaUnit[];
  carries: string[];
  augments: string[];
  traits: { key: string; name: string; count: number }[];
  topCost: number;
  style: "fast8" | "reroll" | "standard";
}
export interface MetaFile {
  source: string;
  patch: string;
  updatedAt: string;
  deckCount: number;
  decks: MetaDeck[];
}

// 빌드에 포함된 정적 메타 (즉시 fallback). 런타임에 GitHub raw 최신본으로 갱신.
let _meta: MetaFile = metaData as MetaFile;
export function getMeta(): MetaFile {
  return _meta;
}

const RAW_URL =
  "https://raw.githubusercontent.com/dorisurararara-crypto/rolche-judge/main/src/lib/data/meta-decks.json";

// 앱 진입 시 1회 호출. 성공하면 module 메타를 최신으로 교체 (재배포 불필요).
// 실패해도 정적 fallback 유지 → 앱은 항상 동작.
export async function loadLatestMeta(): Promise<boolean> {
  try {
    const r = await fetch(RAW_URL, { cache: "no-store" });
    if (!r.ok) return false;
    const j = (await r.json()) as MetaFile;
    // raw CDN 캐시가 stale 일 수 있음 → 더 최신(updatedAt)일 때만 교체. 과거면 정적 유지.
    if (j?.decks?.length && new Date(j.updatedAt).getTime() >= new Date(_meta.updatedAt).getTime()) {
      _meta = j;
      return true;
    }
  } catch {
    /* 네트워크 실패 → 정적 fallback */
  }
  return false;
}

export interface DeckMatch {
  deck: MetaDeck;
  score: number;
  ownedUnits: string[]; // 보유 + 덱에 포함된 유닛 (한글명)
  missingCarries: string[]; // 아직 없는 캐리
  hasCarry: boolean;
  reasons: string[];
}

// roster 의 유닛 한글명 → {cost, copies(보이는 장수)}
function ownedMap(state: GameState): Map<string, { cost: number; copies: number }> {
  const counts = countRoster(state.roster);
  const m = new Map<string, { cost: number; copies: number }>();
  for (const c of counts) {
    const def = findUnit(c.unitId);
    if (def) m.set(def.nameKo, { cost: def.cost, copies: c.totalCopiesVisible });
  }
  return m;
}

export function matchDecks(state: GameState): DeckMatch[] {
  const owned = ownedMap(state);
  if (owned.size === 0) return [];

  const results: DeckMatch[] = getMeta().decks.map((deck) => {
    const deckUnitNames = deck.units.map((u) => u.name);
    const ownedInDeck = deckUnitNames.filter((n) => owned.has(n));
    const carriesOwned = deck.carries.filter((c) => owned.has(c));
    const missingCarries = deck.carries.filter((c) => !owned.has(c));

    const overlapRatio = ownedInDeck.length / Math.max(deckUnitNames.length, 1);
    const carryBonus = carriesOwned.length * 0.2;
    const highCarryBonus = carriesOwned.filter((c) => (owned.get(c)?.cost ?? 0) >= 4).length * 0.18;

    // 증강 종합: 보유 증강 type 이 덱 운영과 맞으면 가중
    const augTypes = new Set(state.augmentChoices.map((a) => a.type));
    const hasRerollAug = augTypes.has("reroll");
    let augFit = 0;
    if (deck.style === "reroll" && hasRerollAug) augFit += 0.15;
    if (deck.style === "fast8" && augTypes.has("economy")) augFit += 0.1;
    if (augTypes.has("item")) augFit += 0.04;

    // 리롤 신호: 저코 캐리덱인데 그 캐리 페어(2장+) 보유 OR 리롤증강 → 리롤 의도 정당 → 가중
    const rerollReady =
      deck.style === "reroll" &&
      (carriesOwned.some((c) => (owned.get(c)?.copies ?? 0) >= 2) || hasRerollAug);
    const rerollBonus = rerollReady ? 0.18 : 0;

    // 저코(1~2코) 캐리를 1장만(페어 X) 보유 + 리롤 신호도 없음 = 거쳐가는 빌드업 유닛 → 페널티.
    // (페어 모였거나 리롤증강 있으면 정당한 리롤덱 → 페널티 면제)
    let lowCostUnpaired = 0;
    for (const c of carriesOwned) {
      const o = owned.get(c);
      if (o && o.cost <= 2 && o.copies < 2 && !rerollReady) lowCostUnpaired++;
    }
    const lowPenalty = lowCostUnpaired * 0.22;

    const score = Math.max(
      0,
      Math.min(1, overlapRatio * 0.4 + carryBonus + highCarryBonus + augFit + rerollBonus - lowPenalty),
    );

    const reasons: string[] = [];
    const realCarries = carriesOwned.filter((c) => {
      const o = owned.get(c);
      return o && (o.cost >= 3 || o.copies >= 2 || (o.cost <= 2 && rerollReady));
    });
    if (realCarries.length) reasons.push(`핵심 ${realCarries.join(", ")} 보유`);
    if (rerollReady) reasons.push(`리롤 신호 (페어/리롤증강) — 저코 리롤덱 정당`);
    const buildupOnly = carriesOwned.filter((c) => !realCarries.includes(c));
    if (buildupOnly.length) reasons.push(`${buildupOnly.join(", ")}는 아직 1장 — 빌드업/연결용`);
    if (augFit > 0) reasons.push(`증강 방향 일치`);
    if (ownedInDeck.length) reasons.push(`구성 ${ownedInDeck.length}/${deckUnitNames.length} 겹침`);
    if (missingCarries.length) reasons.push(`영입 필요: ${missingCarries.join(", ")}`);

    return { deck, score, ownedUnits: ownedInDeck, missingCarries, hasCarry: realCarries.length > 0, reasons };
  });

  return results.filter((r) => r.ownedUnits.length > 0).sort((a, b) => b.score - a.score);
}

export function topMatches(state: GameState, n = 3): DeckMatch[] {
  return matchDecks(state).slice(0, n);
}
