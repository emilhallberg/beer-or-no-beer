"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function PlayAgainButton() {
  const { reset } = useGame();

  return (
    <button
      onClick={() => {
        reset();
      }}
    >
      Play Again
    </button>
  );
}
