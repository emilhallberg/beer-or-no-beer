"use client";

import { SignedOut } from "@clerk/nextjs";

import ChallengeButton from "@/app/play/_/challenge-button";
import HomeButton from "@/app/play/_/home-button";
import PlayAgainButton from "@/app/play/_/play-again-button";
import SignInButton from "@/app/play/_/sign-in-button";
import type { CompletedGameSummary } from "@/utils/game";

type Props = CompletedGameSummary;

export default function SummaryScreen({ newHighScore, result, score }: Props) {
  return (
    <div className="grid min-h-svh place-content-center gap-6 p-6 text-center">
      {newHighScore ? (
        <h2 className="text-4xl uppercase">New High Score!</h2>
      ) : (
        <h2 className="text-4xl uppercase">Game Over!</h2>
      )}
      <h1 className="text-4xl">{score} points </h1>
      <div className="grid grid-rows-3 gap-4">
        <PlayAgainButton />
        <ChallengeButton score={score} />
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
              key={`${item.beer.id}-${item.createdAt}`}
              className={item.correct ? "text-green-700" : "text-red-800"}
            >
              {item.beer.name}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
