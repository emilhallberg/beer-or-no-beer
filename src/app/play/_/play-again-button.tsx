"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function PlayAgainButton() {
  const { reset } = useGame();

  return (
    <button
      className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase"
      onClick={() => {
        reset();
      }}
    >
      Play Again
    </button>
  );
}
