"use client";

import { Activity } from "react";
import { SignedOut } from "@clerk/nextjs";

import ChallengeButton from "@/app/play/_/challenge-button";
import { useGame } from "@/app/play/_/game-provider";
import HomeButton from "@/app/play/_/home-button";
import PlayAgainButton from "@/app/play/_/play-again-button";
import SignInButton from "@/app/play/_/sign-in-button";

export default function ResultSlot() {
  const { gameOver, newHighScore, score, result } = useGame();

  return (
    <Activity mode={gameOver ? "visible" : "hidden"}>
      <div className="h-svh grid place-content-center text-center gap-6">
        {newHighScore ? (
          <h2 className="text-4xl uppercase">New High Score!</h2>
        ) : (
          <h2 className="text-4xl uppercase">Game Over!</h2>
        )}
        <h1 className="text-4xl">{score} points </h1>
        <div className="grid grid-rows-3 gap-4">
          <PlayAgainButton />
          <ChallengeButton />
          <HomeButton />
        </div>
        <SignedOut>
          <h3>Sign in to save your score!</h3>
          <SignInButton />
        </SignedOut>
        <div className="grid">
          <ol>
            {result.map((item) => (
              <li
                key={item.beer.name}
                className={item.correct ? "text-green-700" : "text-red-800"}
              >
                {item.beer.name}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Activity>
  );
}
