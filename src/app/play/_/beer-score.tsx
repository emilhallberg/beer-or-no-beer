"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerScore() {
  const { score } = useGame();

  return <h2 className="text-2xl w-20 text-right">{score}</h2>;
}
