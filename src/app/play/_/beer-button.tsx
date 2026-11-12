"use client";

import { Beer } from "lucide-react";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerButton() {
  const { onBeer, isAnswering } = useGame();

  return (
    <button
      className="button-primary answer-button"
      disabled={isAnswering}
      onClick={() => {
        onBeer(true);
      }}
    >
      <Beer size={23} aria-hidden="true" /> Beer{" "}
      <span aria-hidden="true">→</span>
    </button>
  );
}
