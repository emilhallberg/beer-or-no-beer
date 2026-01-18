"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHero() {
  const { beer } = useGame();

  return <h1 className="text-4xl text-center font-bold">{beer.name}</h1>;
}
