"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHearts() {
  const { hearts } = useGame();

  return (
    <div>
      {Array.from({ length: hearts }, (_, i) => (
        <span key={i}>&#9829;</span>
      ))}
    </div>
  );
}
