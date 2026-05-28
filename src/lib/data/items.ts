import type { ItemDef } from "../types";

export const ITEMS: ItemDef[] = [
  { id: "bf-sword", nameEn: "B.F. Sword", nameKo: "대검", kind: "component", directions: ["AD"] },
  { id: "recurve-bow", nameEn: "Recurve Bow", nameKo: "곡궁", kind: "component", directions: ["AD"] },
  { id: "needlessly-large-rod", nameEn: "Needlessly Large Rod", nameKo: "지팡이", kind: "component", directions: ["AP"] },
  { id: "tear", nameEn: "Tear of the Goddess", nameKo: "여눈", kind: "component", directions: ["AP"] },
  { id: "chain-vest", nameEn: "Chain Vest", nameKo: "갑옷", kind: "component", directions: ["Tank"] },
  { id: "negatron-cloak", nameEn: "Negatron Cloak", nameKo: "조개", kind: "component", directions: ["Tank"] },
  { id: "giants-belt", nameEn: "Giant's Belt", nameKo: "벨트", kind: "component", directions: ["Tank"] },
  { id: "sparring-gloves", nameEn: "Sparring Gloves", nameKo: "장갑", kind: "component", directions: ["Flex"] },
  { id: "spatula", nameEn: "Spatula", nameKo: "뒤집개", kind: "component", directions: ["Flex"] },
  { id: "frying-pan", nameEn: "Frying Pan", nameKo: "프라이팬", kind: "component", directions: ["Flex"] },

  { id: "infinity-edge", nameEn: "Infinity Edge", nameKo: "인피", kind: "completed", directions: ["AD"] },
  { id: "guinsoo", nameEn: "Guinsoo's Rageblade", nameKo: "구인수", kind: "completed", directions: ["AD"] },
  { id: "last-whisper", nameEn: "Last Whisper", nameKo: "라위", kind: "completed", directions: ["AD"] },
  { id: "bloodthirster", nameEn: "Bloodthirster", nameKo: "죽검", kind: "completed", directions: ["AD"] },
  { id: "giant-slayer", nameEn: "Giant Slayer", nameKo: "거학", kind: "completed", directions: ["AD"] },

  { id: "spear-of-shojin", nameEn: "Spear of Shojin", nameKo: "쇼진", kind: "completed", directions: ["AP"] },
  { id: "blue-buff", nameEn: "Blue Buff", nameKo: "블루", kind: "completed", directions: ["AP"] },
  { id: "hand-of-justice", nameEn: "Hand of Justice", nameKo: "보건", kind: "completed", directions: ["AP"] },
  { id: "archangels-staff", nameEn: "Archangel's Staff", nameKo: "대천사", kind: "completed", directions: ["AP"] },
  { id: "nashors-tooth", nameEn: "Nashor's Tooth", nameKo: "내셔", kind: "completed", directions: ["AP"] },

  { id: "gargoyle-stoneplate", nameEn: "Gargoyle Stoneplate", nameKo: "가고일", kind: "completed", directions: ["Tank"] },
  { id: "warmogs-armor", nameEn: "Warmog's Armor", nameKo: "워모그", kind: "completed", directions: ["Tank"] },
  { id: "dragons-claw", nameEn: "Dragon's Claw", nameKo: "용발", kind: "completed", directions: ["Tank"] },
  { id: "sunfire-cape", nameEn: "Sunfire Cape", nameKo: "태불망", kind: "completed", directions: ["Tank"] },
  { id: "redemption", nameEn: "Redemption", nameKo: "구원", kind: "completed", directions: ["Tank"] },
  { id: "ionic-spark", nameEn: "Ionic Spark", nameKo: "이온", kind: "completed", directions: ["Tank"] },
  { id: "adaptive-helm", nameEn: "Adaptive Helm", nameKo: "적응형 투구", kind: "completed", directions: ["Tank"] },

  { id: "edge-of-night", nameEn: "Edge of Night", nameKo: "밤끝", kind: "completed", directions: ["Flex"] },
  { id: "hand-of-justice-2", nameEn: "Hand of Justice (Flex)", nameKo: "정손", kind: "completed", directions: ["Flex"] },
];

export function findItem(id: string) {
  return ITEMS.find((i) => i.id === id);
}

export const COMPONENTS = ITEMS.filter((i) => i.kind === "component");
export const COMPLETED = ITEMS.filter((i) => i.kind === "completed");
