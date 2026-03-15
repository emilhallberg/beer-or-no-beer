"use client";

import NumberFlow from "@number-flow/react";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHero() {
  const { beer, showHint } = useGame();

  return (
    <div className="select-none">
      <h1 className="text-4xl text-center font-bold">{beer.name}</h1>
      <p className="text-center text-sm text-white font-medium mt-1">
        {beer.type} · <NumberFlow value={beer.abv} suffix="%" />
      </p>
      <p
        className={`text-center mt-2 ${showHint ? "opacity-100" : "opacity-0"}`}
      >
        {beer.description}
      </p>
    </div>
  );
}
