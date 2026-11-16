"use client";

import NumberFlow from "@number-flow/react";

import { useGame } from "@/app/play/_/game-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export default function BeerScore() {
  const { score } = useGame();
  const reducedMotion = useReducedMotion();

  return (
    <div className="game-scoreboard">
      <div className="game-points" aria-label={`${score} poäng`}>
        <NumberFlow
          animated={!reducedMotion}
          value={score}
          locales="sv-SE"
          className="game-score-number"
        />
        <span className="game-score-label">poäng</span>
      </div>
    </div>
  );
}
