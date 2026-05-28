"use client";
import { useGameStore } from "@/store/useGameStore";
import { AlertTriangle, Compass, Flag, ListChecks, TrendingUp, Clock, Coins, Swords } from "lucide-react";

export function RoadmapCard() {
  const roadmap = useGameStore((s) => s.lastRoadmap);
  const isPlanning = useGameStore((s) => s.isPlanning);

  if (isPlanning) {
    return (
      <section className="bg-surface rounded-2xl p-4 border border-border animate-pulse text-center text-sm text-zinc-400">
        로드맵 짜는 중...
      </section>
    );
  }
  if (!roadmap) {
    return (
      <section className="bg-surface rounded-2xl p-4 border border-border text-center">
        <div className="text-xs text-zinc-500">하단 [운영 로드맵 받기] 를 눌러주세요</div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="bg-gradient-to-br from-accent/20 to-accent-2/20 border border-accent/30 rounded-2xl p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-accent uppercase tracking-wider font-bold mb-1">
          <Compass size={13} /> 추천 운영
        </div>
        <div className="font-bold text-lg leading-snug">{roadmap.direction.name}</div>
        <div className="text-xs text-zinc-300 mt-1">{roadmap.direction.reason}</div>
        <div className="inline-block mt-2 text-[11px] bg-black/30 rounded-full px-2.5 py-1 text-accent">
          {roadmap.styleLabel}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1">
          신뢰도 {(roadmap.confidence * 100).toFixed(0)}% · 메타 {roadmap.metaPatch}
        </div>
      </div>

      {roadmap.metaMatches.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-semibold">
            <Swords size={13} /> 매칭된 메타 덱 (1등 유저 기준)
          </div>
          <div className="space-y-2.5">
            {roadmap.metaMatches.map((m, i) => (
              <div key={m.deck.id} className={`rounded-xl p-2.5 ${i === 0 ? "bg-accent/10 ring-1 ring-accent/30" : "bg-surface-2"}`}>
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 text-[10px] font-bold rounded px-1.5 py-0.5 ${i === 0 ? "bg-accent text-black" : "bg-surface text-zinc-400"}`}>
                    {i === 0 ? "1순위" : i === 1 ? "전환" : "후보"}
                  </span>
                  <span className="font-bold text-sm flex-1">{m.deck.name}</span>
                  <span className="text-[10px] text-zinc-500">{(m.score * 100).toFixed(0)}%</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {m.deck.units
                    .filter((u) => u.isCarry)
                    .map((u) => (
                      <span key={u.key} className={`text-[10px] rounded px-1.5 py-0.5 bg-surface ring-cost-${u.cost || 1}`}>
                        <span className={`cost-${u.cost || 1} font-semibold`}>{u.name}</span>
                        {u.items.length > 0 && <span className="text-zinc-500"> · {u.items.join(", ")}</span>}
                      </span>
                    ))}
                </div>
                {m.deck.augments.length > 0 && (
                  <div className="text-[10px] text-zinc-500 mt-1">증강: {m.deck.augments.join(" / ")}</div>
                )}
                <div className="text-[10px] text-zinc-400 mt-1 leading-snug">{m.reasons.join(" · ")}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-zinc-600 mt-2">출처: lolchess.gg 현재 패치 메타 · 매일 자동 갱신</div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-3">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-semibold">
          <ListChecks size={13} /> 지금 당장
        </div>
        <ul className="space-y-1.5">
          {roadmap.immediateActions.map((a, i) => (
            <li key={i} className="text-sm leading-snug flex gap-2">
              <span className="text-accent shrink-0">{i + 1}.</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-3">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-semibold">
          <Flag size={13} /> 분기점 로드맵
        </div>
        <ul className="space-y-2">
          {roadmap.milestones.map((m, i) => (
            <li key={i} className="flex gap-2.5 text-xs">
              <span
                className={`shrink-0 font-bold w-9 text-center rounded px-1 py-0.5 ${
                  m.key ? "bg-accent text-black" : "bg-surface-2 text-zinc-400"
                }`}
              >
                {m.round}
              </span>
              <span className="leading-snug pt-0.5">{m.action}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-semibold">
            <TrendingUp size={13} /> 레벨 타이밍
          </div>
          <ul className="space-y-1">
            {roadmap.levelPlan.map((l, i) => (
              <li key={i} className="text-xs flex items-baseline gap-1.5">
                <span className="text-zinc-500 w-8">{l.round}</span>
                <span className="font-bold text-accent">Lv{l.level}</span>
                {l.note && <span className="text-[10px] text-zinc-500">{l.note}</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-semibold">
            <Coins size={13} /> 경제
          </div>
          <div className="text-xs leading-snug text-zinc-200">{roadmap.economyPlan}</div>
        </div>
      </div>

      {roadmap.augmentRanking.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-3">
          <div className="text-xs text-zinc-400 mb-2 font-semibold">🎲 증강체 순위</div>
          <ol className="space-y-2">
            {roadmap.augmentRanking.map((r) => (
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

      {roadmap.risks.length > 0 && (
        <div className="bg-red-950/40 border border-red-900/60 rounded-2xl p-3 space-y-1.5">
          {roadmap.risks.map((w, i) => (
            <div key={i} className="text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              <span className="leading-snug">{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface-2 rounded-2xl p-3 text-xs text-zinc-300 flex items-start gap-2">
        <Clock size={13} className="mt-0.5 shrink-0 text-accent" />
        <div>
          <span className="text-zinc-500 mr-1">다음 입력:</span>
          {roadmap.nextCheckpoint}
        </div>
      </div>
    </section>
  );
}
