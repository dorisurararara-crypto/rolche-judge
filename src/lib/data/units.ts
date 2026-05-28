import type { UnitDef } from "../types";

export const UNITS: UnitDef[] = [
  { id: "garen", nameEn: "Garen", nameKo: "가렌", cost: 1 },
  { id: "tristana", nameEn: "Tristana", nameKo: "트리스타나", cost: 1 },
  { id: "annie", nameEn: "Annie", nameKo: "애니", cost: 1 },
  { id: "lulu", nameEn: "Lulu", nameKo: "룰루", cost: 1 },
  { id: "darius", nameEn: "Darius", nameKo: "다리우스", cost: 1 },
  { id: "sett", nameEn: "Sett", nameKo: "세트", cost: 1 },
  { id: "vladimir", nameEn: "Vladimir", nameKo: "블라디미르", cost: 1 },
  { id: "senna", nameEn: "Senna", nameKo: "세나", cost: 1 },
  { id: "yuumi", nameEn: "Yuumi", nameKo: "유미", cost: 1 },
  { id: "cassiopeia", nameEn: "Cassiopeia", nameKo: "카시오페아", cost: 1 },

  { id: "jinx", nameEn: "Jinx", nameKo: "징크스", cost: 2 },
  { id: "vi", nameEn: "Vi", nameKo: "바이", cost: 2 },
  { id: "twitch", nameEn: "Twitch", nameKo: "트위치", cost: 2 },
  { id: "ezreal", nameEn: "Ezreal", nameKo: "이즈리얼", cost: 2 },
  { id: "riven", nameEn: "Riven", nameKo: "리븐", cost: 2 },
  { id: "sona", nameEn: "Sona", nameKo: "소나", cost: 2 },
  { id: "ashe", nameEn: "Ashe", nameKo: "애쉬", cost: 2 },
  { id: "caitlyn", nameEn: "Caitlyn", nameKo: "케이틀린", cost: 2 },

  { id: "shen", nameEn: "Shen", nameKo: "쉔", cost: 3 },
  { id: "neeko", nameEn: "Neeko", nameKo: "니코", cost: 3 },
  { id: "veigar", nameEn: "Veigar", nameKo: "베이가", cost: 3 },
  { id: "lux", nameEn: "Lux", nameKo: "럭스", cost: 3 },
  { id: "akali", nameEn: "Akali", nameKo: "아칼리", cost: 3 },
  { id: "yasuo", nameEn: "Yasuo", nameKo: "야스오", cost: 3 },
  { id: "sivir", nameEn: "Sivir", nameKo: "시비르", cost: 3 },
  { id: "vayne", nameEn: "Vayne", nameKo: "케인", cost: 3 },

  { id: "kaisa", nameEn: "Kai'Sa", nameKo: "카이사", cost: 4 },
  { id: "ahri", nameEn: "Ahri", nameKo: "아리", cost: 4 },
  { id: "zed", nameEn: "Zed", nameKo: "제드", cost: 4 },
  { id: "yone", nameEn: "Yone", nameKo: "요네", cost: 4 },
  { id: "galio", nameEn: "Galio", nameKo: "갈리오", cost: 4 },
  { id: "kindred", nameEn: "Kindred", nameKo: "킨드레드", cost: 4 },

  { id: "aphelios", nameEn: "Aphelios", nameKo: "아펠리오스", cost: 5 },
  { id: "bard", nameEn: "Bard", nameKo: "바드", cost: 5 },
  { id: "ekko", nameEn: "Ekko", nameKo: "에코", cost: 5 },
  { id: "volibear", nameEn: "Volibear", nameKo: "볼리베어", cost: 5 },
  { id: "briar", nameEn: "Briar", nameKo: "브라이어", cost: 5 },
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
