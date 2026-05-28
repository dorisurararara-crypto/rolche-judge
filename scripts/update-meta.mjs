#!/usr/bin/env node
// lolchess.gg/meta 의 __NEXT_DATA__ 를 파싱해 정규화된 메타 덱 JSON 생성.
// Riot API key 불필요. GitHub Actions cron 에서 매일 실행 → 자동 최신화.
import fs from "node:fs";
import path from "node:path";

const URL = "https://lolchess.gg/meta?hl=ko";
const OUT = path.resolve("src/lib/data/meta-decks.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function carryScore(slot) {
  // 아이템 많을수록 / 고코스트 / 3성 = 캐리 가능성
  return (slot.items?.length ?? 0) * 2 + (slot.star === 3 ? 2 : 0);
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
      const maxCarry = Math.max(...slots.map(carryScore), 0);
      const units = slots.map((s) => {
        const cs = carryScore(s);
        return {
          key: s.champion,
          name: champKo(s.champion),
          cost: champCost(s.champion),
          star: s.star ?? 1,
          items: (s.items ?? []).map(itemKo),
          isCarry: cs >= 4 && cs >= maxCarry - 1,
          row: typeof s.index === "number" ? Math.floor(s.index / 7) : null,
        };
      });
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
