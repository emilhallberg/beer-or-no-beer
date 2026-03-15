"use client";

import NumberFlow from "@number-flow/react";
import { Flame, Trophy } from "lucide-react";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerScore() {
  const { score, streak } = useGame();

  return (
    <div className="flex items-center gap-2 text-white">
      <div className="flex min-w-0 items-center gap-2 rounded-full border border-amber-500/60 bg-amber-900/80 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <div className="flex items-baseline gap-1">
          <NumberFlow
            className="text-sm font-bold tabular-nums sm:text-lg"
            value={score}
          />
        </div>
        <Trophy className="size-4 text-amber-300" strokeWidth={2.25} />
      </div>
      <div className="flex min-w-0 items-center gap-2 rounded-full border border-orange-400/50 bg-orange-950/75 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <div className="flex items-baseline gap-1">
          <NumberFlow
            className="text-sm font-bold tabular-nums sm:text-lg"
            value={streak}
          />
        </div>
        <Flame className="size-4 text-orange-300" strokeWidth={2.25} />
      </div>
    </div>
  );
}
