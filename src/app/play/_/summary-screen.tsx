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
      <div className="w-80 space-y-2">
        {result.map((item) => (
          <div
            key={`${item.beer.id}-${item.createdAt}`}
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
              item.correct
                ? "border-amber-700/50 bg-amber-950/40"
                : "border-red-900/60 bg-red-950/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-lg font-bold ${item.correct ? "text-green-400" : "text-red-400"}`}
              >
                {item.correct ? "✓" : "✗"}
              </span>
              <div className="text-left">
                <p className="font-bold text-sm leading-tight">
                  {item.beer.name}
                </p>
                <p className="text-xs text-amber-400/70 uppercase tracking-wide">
                  {item.correctAnswer ? "Real" : "Fake"}
                </p>
              </div>
            </div>
            <span className="text-amber-400 text-sm font-bold shrink-0">
              +{item.pointsAwarded}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
