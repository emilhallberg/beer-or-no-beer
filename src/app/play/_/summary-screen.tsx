"use client";

import { Show } from "@clerk/nextjs";
import {
  Beer,
  ChartColumnIncreasing,
  Flame,
  Target,
  Trophy,
} from "lucide-react";

import ChallengeButton from "@/app/play/_/challenge-button";
import HomeButton from "@/app/play/_/home-button";
import PlayAgainButton from "@/app/play/_/play-again-button";
import SignInButton from "@/app/play/_/sign-in-button";
import PromoCard from "@/ui/promo-card";
import type { CompletedGameSummary } from "@/utils/game";
import type { Promo } from "@/utils/promo-types";

type Props = CompletedGameSummary & {
  gameId: number;
  promo: Promo | null;
};

function formatAccuracy(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatAverageAbv(value: number | null) {
  return value === null ? "Ingen data" : `${value.toFixed(1)}%`;
}

function formatPoints(value: number) {
  return value > 0 ? `+${value} poäng` : "0 poäng";
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  detail: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <article className="surface p-5 text-left text-gold-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-gold-100">
            {value}
          </p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-gold-800/70 bg-black/30 text-gold-300/90">
          <Icon className="size-5" strokeWidth={2.1} />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-gold-50/82">{detail}</p>
    </article>
  );
}

export default function SummaryScreen({
  gameId,
  newHighScore,
  overallRank,
  promo,
  result,
  score,
  stats,
  totalRankedPlayers,
}: Props) {
  return (
    <div className="min-h-svh px-4 py-6 text-gold-50 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="surface overflow-hidden p-5 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/70">
                Summering
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
                {newHighScore ? "Nytt rekord satt." : "Rundan är avgjord."}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gold-50/80 sm:text-base">
                {stats.correctGuesses} av {stats.totalGuesses} gissningar satt
                rätt. Du plockade {stats.totalPointsAwarded} poäng totalt och
                nådde en bästa svit på {stats.bestStreak}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                  Slutpoäng
                </p>
                <p className="mt-3 text-3xl font-bold text-gold-100">{score}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                  Total rank
                </p>
                <p className="mt-3 text-3xl font-bold text-gold-100">
                  {overallRank ? `#${overallRank}` : "Gästläge"}
                </p>
                <p className="mt-2 text-sm text-gold-50/82">
                  {overallRank
                    ? `Av ${totalRankedPlayers} rankade spelare.`
                    : "Logga in för att hamna på topplistan."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7">
            <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
              Nästa steg
            </p>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <PlayAgainButton />
            <ChallengeButton score={score} />
            <HomeButton />
          </div>

          <Show when="signed-out">
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-sm text-gold-50/82">
                Logga in för att koppla rundan till ditt konto och synas på
                topplistan.
              </p>
              <div className="mt-3">
                <SignInButton />
              </div>
            </div>
          </Show>

          {promo ? (
            <div className="mt-4">
              <PromoCard gameId={gameId} promo={promo} />
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Precision"
            value={formatAccuracy(stats.accuracy)}
            detail={`${stats.correctGuesses} rätt av ${stats.totalGuesses} gissningar.`}
            icon={Target}
          />
          <StatCard
            label="Bästa svit"
            value={stats.bestStreak.toString()}
            detail={`Du hade fortfarande ${stats.livesRemaining} liv kvar när rundan tog slut.`}
            icon={Flame}
          />
          <StatCard
            label="Ölprofil"
            value={formatAverageAbv(stats.averageAbv)}
            detail={`Snittstyrkan i rundan. Vanligaste typen var ${stats.mostSeenBeerType ?? "okänd"} över ${stats.totalGuesses} kort.`}
            icon={Beer}
          />
          <StatCard
            label="Mix i rundan"
            value={`${stats.realBeers} / ${stats.fakeBeers}`}
            detail={`${stats.correctRealGuesses} riktiga och ${stats.correctFakeGuesses} fejköl identifierades korrekt från ${stats.uniqueBreweries} bryggerier.`}
            icon={ChartColumnIncreasing}
          />
        </section>

        <section>
          <div className="surface p-4 sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-gold-700/30 pb-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/80">
                  Gissning för gissning
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-gold-200">
                  Så gick rundan
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-gold-700/60 bg-black/15 px-3 py-1.5 text-sm text-gold-200">
                <Trophy className="size-4 text-gold-300" strokeWidth={2.1} />
                {score} poäng
              </div>
            </div>

            <ol className="grid gap-3">
              {result.map((item, index) => {
                const answerLabel = item.correctAnswer ? "Riktig öl" : "Fejköl";
                const guessLabel = item.guess ? "Riktig öl" : "Fejköl";

                return (
                  <li
                    key={`${item.beer.id}-${item.createdAt}`}
                    className={`rounded-[1.5rem] border p-4 ${
                      item.correct
                        ? "border-pub-300/15 bg-pub-500/10 text-pub-50"
                        : "border-raspberry-300/15 bg-raspberry-500/10 text-raspberry-50"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.04em]">
                          <span>#{index + 1}</span>
                          <span className="opacity-65">•</span>
                          <span>{item.beer.brewery}</span>
                        </div>
                        <p className="mt-2 text-xl font-black tracking-tight text-balance">
                          {item.beer.name}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold tracking-[0.04em]">
                          <span className="rounded-full border border-current/15 bg-black/10 px-3 py-1.5">
                            {item.beer.type}
                          </span>
                          <span className="rounded-full border border-current/15 bg-black/10 px-3 py-1.5">
                            {item.beer.abv.toFixed(1)}% ABV
                          </span>
                          <span className="rounded-full border border-current/15 bg-black/10 px-3 py-1.5">
                            {item.beer.real ? "Riktig öl" : "Fejköl"}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-2 text-left sm:min-w-44 sm:text-right">
                        <p className="text-sm font-black tracking-[0.04em]">
                          {item.correct ? "Rätt" : "Fel"}
                        </p>
                        <p className="text-sm font-semibold">
                          {formatPoints(item.pointsAwarded)}
                        </p>
                        <p className="text-xs leading-5 opacity-80">
                          Du svarade {guessLabel}. Rätt svar var {answerLabel}.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                      <p className="text-sm opacity-80">
                        Svit: {item.streakBeforeGuess} → {item.streakAfterGuess}
                      </p>
                      <p className="text-sm opacity-80">
                        Liv: {item.lifeDelta === 0 ? "Ingen förlust" : "-1 liv"}
                      </p>
                      <p className="text-sm opacity-80">
                        Korttyp: {item.beer.real ? "Riktig öl" : "Fejköl"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
