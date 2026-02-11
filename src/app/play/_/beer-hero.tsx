"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHero() {
  const { beer, showHint } = useGame();

  return (
    <div>
      <h1 className="text-4xl text-center font-bold">{beer.name}</h1>
      <p className={`text-center ${showHint ? "opacity-100" : "opacity-0"}`}>
        {beer.description}
      </p>
    </div>
  );
}
