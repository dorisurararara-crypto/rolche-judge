import type { UnitDef } from "../types";

// TFT Set 17 (Space Gods / 우주의 신들) — 2026-05 라이브 패치 기준
// source: metabot.gg/en/TFT/17/champions/cost + op.gg/ko/tft/set/14 (redirected to set 17)
export const UNITS: UnitDef[] = [
  // 1코 (15)
  { id: "poppy", nameEn: "Poppy", nameKo: "뽀삐", cost: 1 },
  { id: "veigar", nameEn: "Veigar", nameKo: "베이가", cost: 1 },
  { id: "aatrox", nameEn: "Aatrox", nameKo: "아트록스", cost: 1 },
  { id: "teemo", nameEn: "Teemo", nameKo: "티모", cost: 1 },
  { id: "nasus", nameEn: "Nasus", nameKo: "나서스", cost: 1 },
  { id: "twisted-fate", nameEn: "Twisted Fate", nameKo: "트위스티드 페이트", cost: 1 },
  { id: "ezreal", nameEn: "Ezreal", nameKo: "이즈리얼", cost: 1 },
  { id: "leona", nameEn: "Leona", nameKo: "레오나", cost: 1 },
  { id: "chogath", nameEn: "Cho'Gath", nameKo: "초가스", cost: 1 },
  { id: "lissandra", nameEn: "Lissandra", nameKo: "리산드라", cost: 1 },
  { id: "reksai", nameEn: "Rek'Sai", nameKo: "렉사이", cost: 1 },
  { id: "briar", nameEn: "Briar", nameKo: "브라이어", cost: 1 },
  { id: "caitlyn", nameEn: "Caitlyn", nameKo: "케이틀린", cost: 1 },
  { id: "talon", nameEn: "Talon", nameKo: "탈론", cost: 1 },
  { id: "jinx", nameEn: "Jinx", nameKo: "징크스", cost: 1 },

  // 2코 (13)
  { id: "pyke", nameEn: "Pyke", nameKo: "파이크", cost: 2 },
  { id: "gragas", nameEn: "Gragas", nameKo: "그라가스", cost: 2 },
  { id: "gwen", nameEn: "Gwen", nameKo: "그웬", cost: 2 },
  { id: "jax", nameEn: "Jax", nameKo: "잭스", cost: 2 },
  { id: "milio", nameEn: "Milio", nameKo: "밀리오", cost: 2 },
  { id: "zoe", nameEn: "Zoe", nameKo: "조이", cost: 2 },
  { id: "mordekaiser", nameEn: "Mordekaiser", nameKo: "모데카이저", cost: 2 },
  { id: "pantheon", nameEn: "Pantheon", nameKo: "판테온", cost: 2 },
  { id: "belveth", nameEn: "Bel'Veth", nameKo: "벨베스", cost: 2 },
  { id: "gnar", nameEn: "Gnar", nameKo: "나르", cost: 2 },
  { id: "akali", nameEn: "Akali", nameKo: "아칼리", cost: 2 },
  { id: "meepsie", nameEn: "Meepsie", nameKo: "미피지", cost: 2 },
  { id: "ivern-minion", nameEn: "Ivern Minion", nameKo: "꼬마 정령", cost: 2 },

  // 3코 (13)
  { id: "aurora", nameEn: "Aurora", nameKo: "오로라", cost: 3 },
  { id: "fizz", nameEn: "Fizz", nameKo: "피즈", cost: 3 },
  { id: "maokai", nameEn: "Maokai", nameKo: "마오카이", cost: 3 },
  { id: "urgot", nameEn: "Urgot", nameKo: "우르곳", cost: 3 },
  { id: "viktor", nameEn: "Viktor", nameKo: "빅토르", cost: 3 },
  { id: "samira", nameEn: "Samira", nameKo: "사미라", cost: 3 },
  { id: "ornn", nameEn: "Ornn", nameKo: "오른", cost: 3 },
  { id: "lulu", nameEn: "Lulu", nameKo: "룰루", cost: 3 },
  { id: "diana", nameEn: "Diana", nameKo: "다이애나", cost: 3 },
  { id: "rhaast", nameEn: "Rhaast", nameKo: "라아스트", cost: 3 },
  { id: "illaoi", nameEn: "Illaoi", nameKo: "일라오이", cost: 3 },
  { id: "miss-fortune", nameEn: "Miss Fortune", nameKo: "미스 포츈", cost: 3 },
  { id: "kaisa", nameEn: "Kai'Sa", nameKo: "카이사", cost: 3 },

  // 4코 (14)
  { id: "rammus", nameEn: "Rammus", nameKo: "라무스", cost: 4 },
  { id: "kindred", nameEn: "Kindred", nameKo: "킨드레드", cost: 4 },
  { id: "karma", nameEn: "Karma", nameKo: "카르마", cost: 4 },
  { id: "aurelion-sol", nameEn: "Aurelion Sol", nameKo: "아우렐리온 솔", cost: 4 },
  { id: "mighty-mech", nameEn: "The Mighty Mech", nameKo: "강력한 메크", cost: 4 },
  { id: "master-yi", nameEn: "Master Yi", nameKo: "마스터 이", cost: 4 },
  { id: "nami", nameEn: "Nami", nameKo: "나미", cost: 4 },
  { id: "nunu", nameEn: "Nunu & Willump", nameKo: "누누와 윌럼프", cost: 4 },
  { id: "riven", nameEn: "Riven", nameKo: "리븐", cost: 4 },
  { id: "leblanc", nameEn: "LeBlanc", nameKo: "르블랑", cost: 4 },
  { id: "xayah", nameEn: "Xayah", nameKo: "자야", cost: 4 },
  { id: "tahm-kench", nameEn: "Tahm Kench", nameKo: "탐 켄치", cost: 4 },
  { id: "morgana", nameEn: "Morgana", nameKo: "모르가나", cost: 4 },
  { id: "corki", nameEn: "Corki", nameKo: "코르키", cost: 4 },

  // 5코 (9)
  { id: "fiora", nameEn: "Fiora", nameKo: "피오라", cost: 5 },
  { id: "jhin", nameEn: "Jhin", nameKo: "진", cost: 5 },
  { id: "blitzcrank", nameEn: "Blitzcrank", nameKo: "블리츠크랭크", cost: 5 },
  { id: "sona", nameEn: "Sona", nameKo: "소나", cost: 5 },
  { id: "shen", nameEn: "Shen", nameKo: "쉔", cost: 5 },
  { id: "graves", nameEn: "Graves", nameKo: "그레이브즈", cost: 5 },
  { id: "bard", nameEn: "Bard", nameKo: "바드", cost: 5 },
  { id: "zed", nameEn: "Zed", nameKo: "제드", cost: 5 },
  { id: "vex", nameEn: "Vex", nameKo: "벡스", cost: 5 },
];

export function findUnit(id: string) {
  return UNITS.find((u) => u.id === id);
}

export function searchUnits(query: string): UnitDef[] {
  if (!query.trim()) return UNITS;
  const q = query.toLowerCase().trim();
  return UNITS.filter(
    (u) =>
      u.nameEn.toLowerCase().includes(q) ||
      u.nameKo.includes(q) ||
      u.id.includes(q),
  );
}
