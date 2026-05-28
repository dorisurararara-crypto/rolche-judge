import type { AugmentDef } from "../types";

// TFT Set 17 (Space Gods) 주요 증강체. 한글명은 검색용 (부분 입력 매칭).
// 전체 200+ 중 자주 등장하는 것 위주. 없는 증강은 AugmentPicker 에서 자유 입력 가능.
export const AUGMENTS: AugmentDef[] = [
  // 경제
  { id: "pandoras-items", nameEn: "Pandora's Items", nameKo: "판도라의 아이템", tier: "silver", type: "item" },
  { id: "pandoras-items-2", nameEn: "Pandora's Items II", nameKo: "판도라의 아이템 II", tier: "gold", type: "item" },
  { id: "pandoras-items-3", nameEn: "Pandora's Items III", nameKo: "판도라의 아이템 III", tier: "prismatic", type: "item" },
  { id: "pandoras-bench", nameEn: "Pandora's Bench", nameKo: "판도라의 대기석", tier: "gold", type: "economy" },
  { id: "tiny-titans", nameEn: "Tiny Titans", nameKo: "꼬마 거인", tier: "silver", type: "economy" },
  { id: "tiniest-titan", nameEn: "Tiniest Titan", nameKo: "초미니 거인", tier: "prismatic", type: "economy" },
  { id: "gain-21-gold", nameEn: "Gain 21 Gold", nameKo: "21골드 획득", tier: "gold", type: "economy" },
  { id: "savings-account", nameEn: "Savings Account", nameKo: "저축 계좌", tier: "gold", type: "economy" },
  { id: "hedge-fund", nameEn: "Hedge Fund", nameKo: "헤지 펀드", tier: "prismatic", type: "economy" },
  { id: "money-monsoon", nameEn: "Money Monsoon", nameKo: "돈 장마", tier: "prismatic", type: "economy" },
  { id: "lunch-money", nameEn: "Lunch Money", nameKo: "점심값", tier: "silver", type: "economy" },
  { id: "hustler", nameEn: "Hustler", nameKo: "장사꾼", tier: "gold", type: "economy" },
  { id: "calculated-loss", nameEn: "Calculated Loss", nameKo: "계산된 패배", tier: "gold", type: "economy" },
  { id: "trade-sector", nameEn: "Trade Sector", nameKo: "무역 지대", tier: "gold", type: "economy" },
  { id: "march-of-progress", nameEn: "Advanced Loan", nameKo: "선이자 대출", tier: "gold", type: "economy" },
  { id: "wise-spending", nameEn: "Wise Spending", nameKo: "현명한 소비", tier: "prismatic", type: "economy" },

  // 리롤
  { id: "rolling-for-days", nameEn: "Rolling For Days", nameKo: "리롤의 나날", tier: "silver", type: "reroll" },
  { id: "a-magic-roll", nameEn: "A Magic Roll", nameKo: "마법의 리롤", tier: "gold", type: "reroll" },
  { id: "slightly-magic-roll", nameEn: "Slightly Magic Roll", nameKo: "약간 마법의 리롤", tier: "silver", type: "reroll" },
  { id: "epic-rolldown", nameEn: "Epic Rolldown", nameKo: "에픽 롤다운", tier: "gold", type: "reroll" },
  { id: "on-a-roll", nameEn: "On a Roll", nameKo: "리롤 행진", tier: "silver", type: "reroll" },
  { id: "bronze-for-life", nameEn: "Bronze For Life", nameKo: "브론즈 인생", tier: "gold", type: "reroll" },

  // 전투
  { id: "glass-cannon", nameEn: "Glass Cannon", nameKo: "유리 대포", tier: "silver", type: "combat" },
  { id: "glass-cannon-2", nameEn: "Glass Cannon II", nameKo: "유리 대포 II", tier: "gold", type: "combat" },
  { id: "cybernetic-implants", nameEn: "Cybernetic Implants", nameKo: "사이버네틱 임플란트", tier: "gold", type: "combat" },
  { id: "cybernetic-uplink", nameEn: "Cybernetic Uplink", nameKo: "사이버네틱 업링크", tier: "gold", type: "combat" },
  { id: "high-voltage", nameEn: "High Voltage", nameKo: "고전압", tier: "gold", type: "combat" },
  { id: "electrocharge", nameEn: "Electrocharge", nameKo: "감전축전", tier: "silver", type: "combat" },
  { id: "sunfire-board", nameEn: "Sunfire Board", nameKo: "선파이어 보드", tier: "gold", type: "combat" },
  { id: "feed-the-flames", nameEn: "Feed the Flames", nameKo: "불길 키우기", tier: "gold", type: "combat" },
  { id: "heart-of-steel", nameEn: "Heart of Steel", nameKo: "강철의 심장", tier: "gold", type: "combat" },
  { id: "makeshift-armor", nameEn: "Makeshift Armor", nameKo: "임시 갑옷", tier: "silver", type: "combat" },
  { id: "two-tanky", nameEn: "Two Tanky", nameKo: "투 탱키", tier: "gold", type: "combat" },
  { id: "shieldmaiden", nameEn: "Shieldmaiden", nameKo: "방패 시녀", tier: "silver", type: "combat" },
  { id: "branching-out", nameEn: "Branching Out", nameKo: "가지치기", tier: "silver", type: "combat" },
  { id: "plot-armor", nameEn: "Plot Armor", nameKo: "주인공 보정", tier: "gold", type: "combat" },
  { id: "deadlier-blades", nameEn: "Deadlier Blades", nameKo: "더 치명적인 검", tier: "prismatic", type: "combat" },
  { id: "deadlier-caps", nameEn: "Deadlier Caps", nameKo: "더 치명적인 모자", tier: "prismatic", type: "combat" },

  // 아이템
  { id: "portable-forge", nameEn: "Portable Forge", nameKo: "휴대용 대장간", tier: "gold", type: "item" },
  { id: "living-forge", nameEn: "Living Forge", nameKo: "살아있는 대장간", tier: "prismatic", type: "item" },
  { id: "component-heist", nameEn: "Component Heist", nameKo: "재료 강탈", tier: "prismatic", type: "item" },
  { id: "buried-treasures", nameEn: "Buried Treasures", nameKo: "묻힌 보물", tier: "prismatic", type: "item" },
  { id: "salvage-bin", nameEn: "Salvage Bin", nameKo: "재활용 통", tier: "gold", type: "item" },
  { id: "jeweled-lotus", nameEn: "Jeweled Lotus", nameKo: "보석 연꽃", tier: "gold", type: "item" },
  { id: "swordsmith", nameEn: "Swordsmith", nameKo: "검 대장장이", tier: "gold", type: "item" },
  { id: "staffsmith", nameEn: "Staffsmith", nameKo: "지팡이 대장장이", tier: "gold", type: "item" },
  { id: "seraphims-staff", nameEn: "Seraphim's Staff", nameKo: "세라핌의 지팡이", tier: "gold", type: "item" },
  { id: "sword-overflow", nameEn: "Sword Overflow", nameKo: "검 넘침", tier: "prismatic", type: "item" },
  { id: "wand-overflow", nameEn: "Wand Overflow", nameKo: "지팡이 넘침", tier: "prismatic", type: "item" },
  { id: "belt-overflow", nameEn: "Belt Overflow", nameKo: "벨트 넘침", tier: "prismatic", type: "item" },

  // 특성/상징
  { id: "the-trait-tree", nameEn: "The Trait Tree", nameKo: "특성 나무", tier: "prismatic", type: "trait" },
  { id: "anima-commander", nameEn: "Anima Commander", nameKo: "동물특공대 사령관", tier: "gold", type: "trait" },
  { id: "arcane-viktory", nameEn: "Arcane Viktor-y", nameKo: "비전 빅토르", tier: "gold", type: "trait" },
  { id: "invader-zed", nameEn: "Invader Zed", nameKo: "침략자 제드", tier: "gold", type: "trait" },
  { id: "heart-of-the-swarm", nameEn: "Heart of the Swarm", nameKo: "군단의 심장", tier: "prismatic", type: "trait" },

  // 고밸류 / 레벨
  { id: "level-up", nameEn: "Level Up!", nameKo: "레벨 업!", tier: "prismatic", type: "highValue" },
  { id: "solo-leveling", nameEn: "Solo Leveling", nameKo: "나 혼자만 레벨업", tier: "gold", type: "highValue" },
  { id: "late-game-specialist", nameEn: "Late Game Specialist", nameKo: "후반 스페셜리스트", tier: "silver", type: "highValue" },
  { id: "late-game-scaling", nameEn: "Late Game Scaling", nameKo: "후반 성장", tier: "gold", type: "highValue" },
  { id: "worth-the-wait", nameEn: "Worth the Wait", nameKo: "기다림의 가치", tier: "gold", type: "highValue" },
  { id: "tour-of-the-galaxy", nameEn: "Tour of the Galaxy", nameKo: "은하 여행", tier: "gold", type: "highValue" },
  { id: "the-golden-egg", nameEn: "The Golden Egg", nameKo: "황금 알", tier: "prismatic", type: "highValue" },
  { id: "the-golden-dragon", nameEn: "The Golden Dragon", nameKo: "황금 용", tier: "gold", type: "highValue" },
  { id: "reach-for-the-stars", nameEn: "Reach for the Stars", nameKo: "별을 향해", tier: "gold", type: "highValue" },
  { id: "heavy-is-the-crown", nameEn: "Heavy Is the Crown", nameKo: "왕관의 무게", tier: "gold", type: "highValue" },

  // 기타 인기
  { id: "best-friends", nameEn: "Best Friends", nameKo: "베스트 프렌드", tier: "silver", type: "combat" },
  { id: "team-building", nameEn: "Team Building", nameKo: "팀 빌딩", tier: "silver", type: "trait" },
  { id: "stand-united", nameEn: "Stand United", nameKo: "단결", tier: "silver", type: "combat" },
  { id: "built-different", nameEn: "Stellar Combo", nameKo: "스텔라 콤보", tier: "silver", type: "combat" },
  { id: "patience-is-a-virtue", nameEn: "Patience is a Virtue", nameKo: "인내는 미덕", tier: "silver", type: "economy" },
  { id: "forge-a-friend", nameEn: "Forge a Friend", nameKo: "친구 만들기", tier: "silver", type: "trait" },
  { id: "build-a-bud", nameEn: "Build a Bud", nameKo: "친구 제작", tier: "prismatic", type: "trait" },
  { id: "construct-a-companion", nameEn: "Construct a Companion", nameKo: "동료 제작", tier: "gold", type: "trait" },
];

export function findAugment(id: string) {
  return AUGMENTS.find((a) => a.id === id);
}

export function searchAugments(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return AUGMENTS.slice(0, 20);
  return AUGMENTS.filter(
    (a) => a.nameKo.includes(query.trim()) || a.nameEn.toLowerCase().includes(q) || a.id.includes(q),
  ).slice(0, 30);
}
