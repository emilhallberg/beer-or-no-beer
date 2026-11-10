"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerButton() {
  const { onBeer } = useGame();

  return (
    <button
      className="button-primary"
      onClick={() => {
        onBeer(true);
      }}
    >
      Beer
    </button>
  );
}
