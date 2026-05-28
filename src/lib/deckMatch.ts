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

    // 저코(1~2코) 캐리를 페어(2장+) 못 모은 채 보유 = 아직 그 덱 캐리 아님 (그냥 거쳐가는 유닛).
    // 리롤덱을 1장만 보고 추천하면 안 됨 → 페널티.
    let lowCostUnpaired = 0;
    for (const c of carriesOwned) {
      const o = owned.get(c);
      if (o && o.cost <= 2 && o.copies < 2) lowCostUnpaired++;
    }
    const lowPenalty = lowCostUnpaired * 0.22;

    const score = Math.max(0, Math.min(1, overlapRatio * 0.45 + carryBonus + highCarryBonus - lowPenalty));

    const reasons: string[] = [];
    const realCarries = carriesOwned.filter((c) => {
      const o = owned.get(c);
      return o && (o.cost >= 3 || o.copies >= 2); // 3코+ 또는 저코 페어 = 실제 캐리각
    });
    if (realCarries.length) reasons.push(`핵심 ${realCarries.join(", ")} 보유`);
    const buildupOnly = carriesOwned.filter((c) => !realCarries.includes(c));
    if (buildupOnly.length) reasons.push(`${buildupOnly.join(", ")}는 아직 1장 — 빌드업/연결용`);
    if (ownedInDeck.length) reasons.push(`구성 ${ownedInDeck.length}/${deckUnitNames.length} 겹침`);
    if (missingCarries.length) reasons.push(`캐리 영입 필요: ${missingCarries.join(", ")}`);

    return { deck, score, ownedUnits: ownedInDeck, missingCarries, hasCarry: realCarries.length > 0, reasons };
  });

  return results.filter((r) => r.ownedUnits.length > 0).sort((a, b) => b.score - a.score);
}

export function topMatches(state: GameState, n = 3): DeckMatch[] {
  return matchDecks(state).slice(0, n);
}
