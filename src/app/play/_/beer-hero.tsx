"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHero() {
  const { beer } = useGame();

  return <h1>{beer.name}</h1>;
}
