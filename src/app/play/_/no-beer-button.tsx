"use client";

import { Activity } from "react";

import { useGame } from "@/app/play/_/game-provider";

export default function NoBeerButton() {
  const { onBeer, gameOver } = useGame();

  return (
    <Activity mode={gameOver ? "hidden" : "visible"}>
      <button
        className="button-secondary"
        onClick={() => {
          onBeer(false);
        }}
      >
        No Beer
      </button>
    </Activity>
  );
}
