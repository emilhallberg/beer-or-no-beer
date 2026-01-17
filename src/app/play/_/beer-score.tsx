"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerScore() {
  const { score } = useGame();

  return <h2>{score}</h2>;
}
