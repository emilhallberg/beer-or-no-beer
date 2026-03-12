"use client";

import { useRouter } from "next/navigation";

import { createGame } from "@/utils/game";

export default function PlayAgainButton() {
  const { push } = useRouter();

  return (
    <button
      className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase"
      onClick={() => {
        void createGame().then((nextGameId) => {
          push(`/play/${nextGameId}`);
        });
      }}
    >
      Play Again
    </button>
  );
}
