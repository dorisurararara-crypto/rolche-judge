"use client";
import { useGameStore } from "@/store/useGameStore";
import { findUnit } from "@/lib/data/units";
import type { ShopAction, SellAction, RollAction, LevelAction } from "@/lib/judge/types";
import { AlertTriangle, Check, Clock, Dice5, TrendingUp } from "lucide-react";

const SHOP_LABEL: Record<ShopAction, { label: string; cls: string }> = {
  buy: { label: "구매", cls: "bg-emerald-900/40 text-emerald-200 ring-emerald-700/40" },
  skip: { label: "넘김", cls: "bg-zinc-800 text-zinc-400 ring-zinc-700" },
  hold_if_economy_allows: { label: "여유 시 보류", cls: "bg-blue-900/30 text-blue-200 ring-blue-700/40" },
  buy_if_board_weak: { label: "보드 약하면 구매", cls: "bg-amber-900/40 text-amber-200 ring-amber-700/40" },
  buy_if_interest_not_broken: { label: "이자 안 깨면 구매", cls: "bg-amber-900/40 text-amber-200 ring-amber-700/40" },
  buy_only_if_pair: { label: "페어 있을 때만", cls: "bg-blue-900/30 text-blue-200 ring-blue-700/40" },
  sell_after_buy: { label: "사고 다시 판매", cls: "bg-fuchsia-900/30 text-fuchsia-200 ring-fuchsia-700/40" },
  unknown: { label: "보류", cls: "bg-zinc-800 text-zinc-400 ring-zinc-700" },
};

const SELL_LABEL: Record<SellAction, { label: string; cls: string }> = {
  sell: { label: "판매", cls: "bg-red-900/40 text-red-200 ring-red-700/40" },
  sell_if_need_interest: { label: "이자 필요 시 판매", cls: "bg-amber-900/40 text-amber-200 ring-amber-700/40" },
  hold: { label: "보유", cls: "bg-zinc-800 text-zinc-300 ring-zinc-700" },
  never_sell_now: { label: "지금 판매 금지", cls: "bg-emerald-900/40 text-emerald-200 ring-emerald-700/40" },
  replace_later: { label: "나중 교체", cls: "bg-blue-900/30 text-blue-200 ring-blue-700/40" },
  unknown: { label: "보류", cls: "bg-zinc-800 text-zinc-400 ring-zinc-700" },
};

const ROLL_LABEL: Record<RollAction, string> = {
  do_not_roll: "리롤 X",
  roll_small: "소량 리롤",
  roll_until_stable: "안정화까지 리롤",
  roll_down_to_30: "30골까지 롤다운",
  roll_down_to_20: "20골까지 롤다운",
  all_in: "올인 리롤",
};

const LEVEL_LABEL: Record<LevelAction, string> = {
  do_not_level: "레벨업 X",
  level_now: "지금 레벨업",
  level_next_round: "다음 라운드 레벨업",
  level_after_interest: "이자 후 레벨업",
  fast8_plan: "Fast 8 진입",
  stay_and_roll: "현재 레벨 유지 + 리롤",
};

export function JudgeResultCard() {
  const result = useGameStore((s) => s.lastJudge);
  const isJudging = useGameStore((s) => s.isJudging);

  if (isJudging) {
    return (
      <section className="bg-surface rounded-2xl p-4 border border-border animate-pulse">
        <div className="text-sm text-zinc-400 text-center">판단 중...</div>
      </section>
    );
  }
  if (!result) {
    return (
      <section className="bg-surface rounded-2xl p-4 border border-border text-center">
        <div className="text-xs text-zinc-500">하단 [이번 턴 판단] 을 눌러주세요</div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="bg-gradient-to-br from-accent/20 to-accent-2/20 border border-accent/30 rounded-2xl p-4">
        <div className="text-[11px] text-accent uppercase tracking-wider font-bold mb-1">메인 판단</div>
        <div className="font-bold text-base leading-snug">{result.mainDecision}</div>
        <div className="text-[11px] text-zinc-400 mt-1">신뢰도 {(result.confidence * 100).toFixed(0)}% · {result.providerName}</div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-3">
        <div className="text-xs text-zinc-400 mb-2 font-semibold">💰 사용 가능 골드</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-2 rounded-lg py-2">
            <div className="text-[10px] text-zinc-500">안전</div>
            <div className="text-lg font-bold text-emerald-400">{result.spendLimit.safe}</div>
          </div>
          <div className="bg-surface-2 rounded-lg py-2">
            <div className="text-[10px] text-zinc-500">보통</div>
            <div className="text-lg font-bold text-amber-300">{result.spendLimit.normal}</div>
          </div>
          <div className="bg-surface-2 rounded-lg py-2">
            <div className="text-[10px] text-zinc-500">긴급</div>
            <div className="text-lg font-bold text-red-300">{result.spendLimit.emergency}</div>
          </div>
        </div>
        <div className="text-[11px] text-zinc-400 mt-2">권장: {result.spendLimit.recommended}골 · {result.spendLimit.reason}</div>
      </div>

      {result.shopActions.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="text-xs text-zinc-400 mb-2 font-semibold">🛒 상점 판단</div>
          <ul className="space-y-2">
            {result.shopActions.map((a, i) => {
              const def = findUnit(a.unitId);
              const lbl = SHOP_LABEL[a.action];
              return (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ring-inset ${lbl.cls}`}>
                    {lbl.label}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold">{def?.nameKo ?? a.unitId}</div>
                    <div className="text-zinc-400 text-[11px] leading-snug">{a.reason}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {result.sellActions.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="text-xs text-zinc-400 mb-2 font-semibold">💸 판매 판단</div>
          <ul className="space-y-2">
            {result.sellActions.map((a, i) => {
              const def = findUnit(a.unitId);
              const lbl = SELL_LABEL[a.action];
              return (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ring-inset ${lbl.cls}`}>
                    {lbl.label}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold">{def?.nameKo ?? a.unitId}</div>
                    <div className="text-zinc-400 text-[11px] leading-snug">{a.reason}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1 font-semibold">
            <Dice5 size={12} /> 리롤
          </div>
          <div className="font-bold text-sm">{ROLL_LABEL[result.rollDecision.action]}</div>
          {result.rollDecision.maxGoldToSpend > 0 && (
            <div className="text-[11px] text-accent">최대 {result.rollDecision.maxGoldToSpend}골</div>
          )}
          <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{result.rollDecision.stopCondition}</div>
          <div className="text-[10px] text-zinc-400 mt-1 leading-snug">{result.rollDecision.reason}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1 font-semibold">
            <TrendingUp size={12} /> 레벨업
          </div>
          <div className="font-bold text-sm">{LEVEL_LABEL[result.levelDecision.action]}</div>
          <div className="text-[10px] text-zinc-400 mt-1 leading-snug">{result.levelDecision.reason}</div>
        </div>
      </div>

      {result.augmentAdvice.ranking.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="text-xs text-zinc-400 mb-2 font-semibold">🎲 증강체 순위</div>
          <ol className="space-y-2">
            {result.augmentAdvice.ranking.map((r) => (
              <li key={r.augmentId} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent text-black font-bold flex items-center justify-center text-[11px]">
                  {r.rank}
                </span>
                <div className="flex-1">
                  <div className="font-semibold">{r.augmentName}</div>
                  <div className="text-zinc-400 text-[11px] leading-snug">{r.reason}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-3">
        <div className="flex items-center gap-1 text-xs text-zinc-400 mb-2 font-semibold">
          <Check size={12} /> 이번 턴 실행 순서
        </div>
        <ol className="space-y-1.5">
          {result.turnPlan.map((p, i) => (
            <li key={i} className="text-sm leading-snug">{p}</li>
          ))}
        </ol>
      </div>

      <div className="bg-surface-2 rounded-2xl p-3 text-xs text-zinc-300 flex items-start gap-2">
        <Clock size={12} className="mt-0.5 shrink-0 text-accent" />
        <div>
          <span className="text-zinc-500 mr-1">다음:</span>
          {result.nextTiming}
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="bg-red-950/40 border border-red-900/60 rounded-2xl p-3 space-y-1">
          {result.warnings.map((w, i) => (
            <div key={i} className="text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
