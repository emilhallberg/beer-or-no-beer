"use client";

import NumberFlow from "@number-flow/react";
import { Flame, Trophy } from "lucide-react";

import { useGame } from "@/app/play/_/game-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export default function BeerScore() {
  const { score, streak } = useGame();
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-2 text-white">
      <div className="pub-score">
        <div className="flex items-baseline gap-1">
          <NumberFlow
            animated={!reducedMotion}
            className="text-sm font-bold tabular-nums sm:text-lg"
            value={score}
          />
        </div>
        <Trophy className="size-4 text-gold-300" strokeWidth={2.25} />
      </div>
      <div className="pub-score">
        <div className="flex items-baseline gap-1">
          <NumberFlow
            animated={!reducedMotion}
            className="text-sm font-bold tabular-nums sm:text-lg"
            value={streak}
          />
        </div>
        <Flame className="size-4 text-raspberry-300" strokeWidth={2.25} />
      </div>
    </div>
  );
}
