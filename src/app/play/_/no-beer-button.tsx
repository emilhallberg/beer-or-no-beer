"use client";

import { Activity } from "react";
import { X } from "lucide-react";

import { useGame } from "@/app/play/_/game-provider";

export default function NoBeerButton() {
  const { onBeer, gameOver, isAnswering } = useGame();

  return (
    <Activity mode={gameOver ? "hidden" : "visible"}>
      <button
        className="button-secondary answer-button"
        disabled={isAnswering}
        onClick={() => {
          onBeer(false);
        }}
      >
        <span aria-hidden="true">←</span> No Beer{" "}
        <X size={23} aria-hidden="true" />
      </button>
    </Activity>
  );
}
