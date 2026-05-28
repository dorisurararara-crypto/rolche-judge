#!/usr/bin/env node
// lolchess.gg/meta 의 __NEXT_DATA__ 를 파싱해 정규화된 메타 덱 JSON 생성.
// Riot API key 불필요. GitHub Actions cron 에서 매일 실행 → 자동 최신화.
import fs from "node:fs";
import path from "node:path";

const URL = "https://lolchess.gg/meta?hl=ko";
const OUT = path.resolve("src/lib/data/meta-decks.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// 방어/탱커 아이템 한글명 키워드 (이거 위주면 캐리 X 탱커)
const DEF_KEYWORDS = [
  "가고일", "워모그", "덤불", "태양불꽃", "선파이어", "구원", "이온", "용의 발톱", "용발톱",
  "강철의 심장", "수호자", "방패", "거인의 벨트", "정의의 손길", "적응형 투구", "크라운가드",
  "원기 회복", "윈드", "구속의", "철갑", "브램블",
];
function isDefensiveItem(nameKo) {
  return DEF_KEYWORDS.some((d) => nameKo.includes(d));
}
// 공격 아이템 수 + 3성 보정으로 캐리 점수
function carryScoreFromUnit(u) {
  const atk = u.items.filter((i) => !isDefensiveItem(i)).length;
  const full = u.items.length >= 3 ? 1 : 0;
  const threeStar = u.star === 3 ? 1 : 0;
  return atk * 2 + full + threeStar;
}

async function main() {
  const res = await fetch(URL, { headers: { "User-Agent": UA, "Accept-Language": "ko" } });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const html = await res.text();
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!m) throw new Error("__NEXT_DATA__ not found");
  const data = JSON.parse(m[1]);
  const queries = data.props.pageProps.dehydratedState.queries;
  const q = (name) => queries.find((x) => x.queryKey[0] === name)?.state?.data;

  const champRefs = q("championRefs")?.champions ?? [];
  const itemRefs = q("itemRefs")?.items ?? [];
  const traitRefs = q("traitsRefs")?.traits ?? [];
  const guide = q("getGuideDecks");
  const guideDecks = guide?.guideDecks ?? [];
  const patch = guide?.guides?.find((g) => g.key === "live")?.name ?? "unknown";

  const champByKey = new Map(champRefs.map((c) => [c.key, c]));
  const itemByKey = new Map(itemRefs.map((i) => [i.key, i]));
  const traitByKey = new Map(traitRefs.map((t) => [t.key, t]));

  const champKo = (k) => champByKey.get(k)?.name ?? k;
  const champCost = (k) => (Array.isArray(champByKey.get(k)?.cost) ? champByKey.get(k).cost[0] : 0);
  const champTraits = (k) => champByKey.get(k)?.traits ?? [];
  const itemKo = (k) => itemByKey.get(k)?.name ?? k;

  const decks = guideDecks
    // "유물별 챔피언 요약" 같은 비-덱 가이드 제외 (slots 없는 것)
    .filter((d) => d.data?.slots?.length)
    // 아티팩트 모음/요약성 제외 (이름에 '요약')
    .filter((d) => !d.name.includes("요약"))
    .map((d) => {
      const slots = d.data.slots;
      let units = slots.map((s) => ({
        key: s.champion,
        name: champKo(s.champion),
        cost: champCost(s.champion),
        star: s.star ?? 1,
        items: (s.items ?? []).map(itemKo),
        isCarry: false,
        row: typeof s.index === "number" ? Math.floor(s.index / 7) : null,
      }));
      // 캐리 판정: 공격 아이템 든 유닛 중 상위 1~2명. 풀템 공격형 우선.
      const ranked = units
        .map((u) => ({ u, cs: carryScoreFromUnit(u) }))
        .filter((x) => x.cs >= 3) // 최소 공격아이템 1+풀템 또는 공격2
        .sort((a, b) => b.cs - a.cs || b.u.cost - a.u.cost);
      const carrySet = new Set(ranked.slice(0, 2).map((x) => x.u.key));
      units = units.map((u) => ({ ...u, isCarry: carrySet.has(u.key) }));
      // 특성 집계 (가장 많이 등장하는 trait = 덱 정체성)
      const traitCount = new Map();
      for (const s of slots) for (const t of champTraits(s.champion)) traitCount.set(t, (traitCount.get(t) ?? 0) + 1);
      const topTraits = [...traitCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k, n]) => ({ key: k, name: traitByKey.get(k)?.name ?? k, count: n }));
      const carries = units.filter((u) => u.isCarry).map((u) => u.name);
      const topCost = Math.max(...units.map((u) => u.cost), 0);
      return {
        id: d.teamBuilderKey,
        name: d.name,
        tier: d.tag === "hot" ? "hot" : "normal", // lolchess 'hot' 태그 = 현재 핫한 티어덱
        teamCost: d.cost ?? null,
        units,
        carries: carries.length ? carries : [units.slice().sort((a, b) => b.cost - a.cost)[0]?.name].filter(Boolean),
        augments: (d.data.augments ?? []).map(itemKo),
        traits: topTraits,
        topCost,
        // 운영 스타일 추정: 캐리 코스트 기준
        style: topCost >= 4 ? "fast8" : units.filter((u) => u.cost <= 2 && u.star === 3).length >= 2 ? "reroll" : "standard",
      };
    });

  const out = {
    source: "lolchess.gg/meta",
    patch,
    updatedAt: new Date().toISOString(),
    deckCount: decks.length,
    decks,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf-8");
  console.log(`✓ ${decks.length} decks → ${OUT} (patch ${patch})`);
}

main().catch((e) => {
  console.error("update-meta failed:", e.message);
  process.exit(1);
});
