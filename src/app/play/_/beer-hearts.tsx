"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHearts() {
  const { lives } = useGame();

  return (
    <h2 className="w-20 text-2xl">
      {Array.from({ length: lives }, (_, i) => (
        <span key={i}>🍺</span>
      ))}
    </h2>
  );
}
