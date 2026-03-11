"use client";

import NumberFlow from "@number-flow/react";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerScore() {
  const { score } = useGame();

  return (
    <NumberFlow className="text-2xl w-20 text-right text-white" value={score} />
  );
}
