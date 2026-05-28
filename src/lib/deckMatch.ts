import metaData from "./data/meta-decks.json";
import { findUnit } from "./data/units";
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
    if (j?.decks?.length) {
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

// roster 의 유닛 한글명 set
function rosterNames(state: GameState): Set<string> {
  const s = new Set<string>();
  for (const u of state.roster) {
    const def = findUnit(u.unitId);
    if (def) s.add(def.nameKo);
  }
  return s;
}

export function matchDecks(state: GameState): DeckMatch[] {
  const owned = rosterNames(state);
  if (owned.size === 0) return [];

  const results: DeckMatch[] = getMeta().decks.map((deck) => {
    const deckUnitNames = deck.units.map((u) => u.name);
    const ownedInDeck = deckUnitNames.filter((n) => owned.has(n));
    const carriesOwned = deck.carries.filter((c) => owned.has(c));
    const missingCarries = deck.carries.filter((c) => !owned.has(c));

    // 점수: 겹친 유닛 비율 + 캐리 보유 가중 + 고코스트 겹침 가중
    const overlapRatio = ownedInDeck.length / Math.max(deckUnitNames.length, 1);
    const carryBonus = carriesOwned.length * 0.25;
    const highCostOverlap =
      deck.units.filter((u) => u.cost >= 4 && owned.has(u.name)).length * 0.1;
    const score = Math.min(1, overlapRatio * 0.6 + carryBonus + highCostOverlap);

    const reasons: string[] = [];
    if (carriesOwned.length) reasons.push(`핵심 ${carriesOwned.join(", ")} 보유`);
    if (ownedInDeck.length) reasons.push(`구성 유닛 ${ownedInDeck.length}/${deckUnitNames.length} 겹침`);
    if (missingCarries.length) reasons.push(`아직 없는 캐리: ${missingCarries.join(", ")}`);

    return {
      deck,
      score,
      ownedUnits: ownedInDeck,
      missingCarries,
      hasCarry: carriesOwned.length > 0,
      reasons,
    };
  });

  return results
    .filter((r) => r.ownedUnits.length > 0)
    .sort((a, b) => b.score - a.score);
}

export function topMatches(state: GameState, n = 3): DeckMatch[] {
  return matchDecks(state).slice(0, n);
}
