"use client";

import Link from "next/link";

import BeerButton from "@/app/play/_/beer-button";
import BeerHearts from "@/app/play/_/beer-hearts";
import BeerHero from "@/app/play/_/beer-hero";
import BeerMenu from "@/app/play/_/beer-menu";
import BeerScore from "@/app/play/_/beer-score";
import { useGame } from "@/app/play/_/game-provider";
import NoBeerButton from "@/app/play/_/no-beer-button";
import { ChallengeProgress } from "@/ui/challenge-progress";
import { SoundToggle } from "@/ui/game-feel";

export default function GameScreen() {
  const {
    gameOver,
    gameId,
    saveStatus,
    retrySave,
    score,
    correctGuesses,
    totalGuesses,
    result,
  } = useGame();

  if (gameOver)
    return (
      <section className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center gap-6 px-5 py-10 text-gold-50">
        <div className="surface p-6 sm:p-8">
          <p className="eyebrow">Rundan är klar</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {score} poäng
          </h1>
          <p className="mt-3 text-gold-100/80">
            {correctGuesses} rätt av {totalGuesses} gissningar.
          </p>
          <p role="status" className="my-5 text-sm">
            {saveStatus === "error"
              ? "Rundan kunde inte sparas. Dina svar finns kvar här medan du försöker igen."
              : "Sparar din runda… Du skickas till resultatet när det är klart."}
          </p>
          {saveStatus === "error" ? (
            <button className="button-primary w-full" onClick={retrySave}>
              Försök spara igen
            </button>
          ) : null}
          <Link
            href="/"
            className="mt-4 inline-flex min-h-11 items-center text-sm text-gold-200 underline underline-offset-4"
          >
            Till startsidan
          </Link>
        </div>
        {saveStatus === "error" ? (
          <ol className="surface divide-y divide-white/10 px-5">
            {result.map((guess, index) => (
              <li key={index} className="py-4 text-sm">
                <span className="font-semibold">{guess.beer.name}</span>
                <span className="mt-1 block text-gold-100/80">
                  {guess.correct ? "Rätt" : "Fel"} ·{" "}
                  {guess.correctAnswer ? "Öl" : "Inte öl"} · +
                  {guess.pointsAwarded} poäng
                </span>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    );

  return (
    <div className="min-h-svh grid grid-rows-[max-content_1fr_max-content]">
      <header className="relative z-20 flex items-center justify-between gap-3 pub-game-header px-4 py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-5">
          <BeerHearts />
          <BeerScore />
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <BeerMenu />
        </div>
      </header>
      <div className="game-stage p-6 min-h-64 grid place-content-center">
        <ChallengeProgress gameId={gameId} score={score} />
        <p className="eyebrow mb-4 text-center">
          Syna namnet. Följ magkänslan.
        </p>
        <BeerHero />
        <p className="swipe-instruction">← No Beer · Svep burken · Beer →</p>
      </div>
      <footer className="game-footer p-4 grid grid-cols-2 gap-4 pub-game-footer">
        <NoBeerButton />
        <BeerButton />
      </footer>
    </div>
  );
}
