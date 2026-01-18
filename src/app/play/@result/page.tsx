"use client";

import { Activity } from "react";
import { SignedOut, SignInButton } from "@clerk/nextjs";

import { usePathname } from "next/navigation";

import ChallengeButton from "@/app/play/_/challenge-button";
import { useGame } from "@/app/play/_/game-provider";
import HomeButton from "@/app/play/_/home-button";
import PlayAgainButton from "@/app/play/_/play-again-button";

export default function ResultSlot() {
  const { gameOver, newHighScore, score } = useGame();
  const pathname = usePathname();

  return (
    <Activity mode={gameOver ? "visible" : "hidden"}>
      <div className="h-svh grid place-content-center text-center gap-6">
        {newHighScore ? (
          <h2 className="text-4xl uppercase">New High Score!</h2>
        ) : (
          <h2 className="text-4xl uppercase">Game Over!</h2>
        )}
        <h1 className="text-4xl">{score}</h1>
        <div className="grid grid-rows-3 gap-4">
          <PlayAgainButton />
          <ChallengeButton />
          <HomeButton />
        </div>
        <SignedOut>
          <h3>Sign in to save your score!</h3>
          <SignInButton
            mode="modal"
            oauthFlow="popup"
            fallbackRedirectUrl={pathname}
          >
            <button className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase uppercase">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </Activity>
  );
}
