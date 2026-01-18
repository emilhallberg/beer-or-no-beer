"use client";

import { Activity } from "react";

import BeerScore from "@/app/play/_/beer-score";
import ChallengeButton from "@/app/play/_/challenge-button";
import { useGame } from "@/app/play/_/game-provider";
import PlayAgainButton from "@/app/play/_/play-again-button";

export default function ResultSlot() {
  const { gameOver } = useGame();

  return (
    <Activity mode={gameOver ? "visible" : "hidden"}>
      <div className="h-svh grid place-content-center">
        <BeerScore />
        <div className="grid grid-cols-2">
          <PlayAgainButton />
          <ChallengeButton />
        </div>
      </div>
    </Activity>
  );
}
