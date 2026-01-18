"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHearts() {
  const { hearts } = useGame();

  return (
    <h2 className="w-20 text-2xl">
      {Array.from({ length: hearts }, (_, i) => (
        <span key={i}>🍺</span>
      ))}
    </h2>
  );
}
