"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHero() {
  const { beer, showHint } = useGame();

  return (
    <div>
      <h1 className="text-4xl text-center font-bold line-clamp-2">
        {beer.name}
      </h1>
    </div>
  );
}
