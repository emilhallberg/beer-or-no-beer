"use client";

import { SignedOut } from "@clerk/nextjs";
import {
  Beer,
  ChartColumnIncreasing,
  CircleX,
  Crown,
  Flame,
  GlassWater,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";

import ChallengeButton from "@/app/play/_/challenge-button";
import HomeButton from "@/app/play/_/home-button";
import PlayAgainButton from "@/app/play/_/play-again-button";
import SignInButton from "@/app/play/_/sign-in-button";
import type { CompletedGameSummary } from "@/utils/game";

type Props = CompletedGameSummary;

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
    <article className="rounded-[1.75rem] border border-amber-300/15 bg-amber-50/8 p-4 text-left text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-amber-100">
            {value}
          </p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-300/15 bg-black/15 text-amber-200">
          <Icon className="size-5" strokeWidth={2.1} />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-amber-50/72">{detail}</p>
    </article>
  );
}

export default function SummaryScreen({
  newHighScore,
  overallRank,
  result,
  score,
  stats,
  totalRankedPlayers,
}: Props) {
  return (
    <div className="min-h-svh px-4 py-6 text-amber-50 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-amber-400/20 bg-[linear-gradient(145deg,rgba(120,53,15,0.92),rgba(41,19,8,0.98))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">
                Summering
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
                {newHighScore ? "Nytt rekord satt." : "Rundan är avgjord."}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-amber-50/80 sm:text-base">
                {stats.correctGuesses} av {stats.totalGuesses} gissningar satt
                rätt. Du plockade {stats.totalPointsAwarded} poäng totalt och
                nådde en bästa svit på {stats.bestStreak}.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-amber-300/20 bg-black/20 px-5 py-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">
                  Slutpoäng
                </p>
                <p className="mt-3 text-4xl font-black text-amber-100">
                  {score}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-amber-300/20 bg-black/20 px-5 py-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">
                  Total rank
                </p>
                <p className="mt-3 text-4xl font-black text-amber-100">
                  {overallRank ? `#${overallRank}` : "Gästläge"}
                </p>
                <p className="mt-2 text-sm text-amber-50/72">
                  {overallRank
                    ? `Av ${totalRankedPlayers} rankade spelare.`
                    : "Logga in för att hamna på topplistan."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <PlayAgainButton />
            <ChallengeButton score={score} />
            <HomeButton />
          </div>

          <SignedOut>
            <div className="mt-4 rounded-[1.5rem] border border-amber-300/15 bg-black/20 p-4">
              <p className="text-sm text-amber-50/78">
                Logga in för att spara rundan, synas i rankingen och bygga upp
                din statistik.
              </p>
              <div className="mt-3">
                <SignInButton />
              </div>
            </div>
          </SignedOut>
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

        <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-emerald-300/15 bg-emerald-500/10 p-5 text-emerald-50">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/15 bg-black/10">
                  <ShieldCheck className="size-5" strokeWidth={2.1} />
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-100/70">
                    Rätt gissningar
                  </p>
                  <p className="text-3xl font-black">{stats.correctGuesses}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-emerald-50/78">
                Varje rad visar exakt hur många poäng rätt svar gav i rundan.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-rose-300/15 bg-rose-500/10 p-5 text-rose-50">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-rose-300/15 bg-black/10">
                  <CircleX className="size-5" strokeWidth={2.1} />
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-rose-100/70">
                    Missar
                  </p>
                  <p className="text-3xl font-black">
                    {stats.totalGuesses - stats.correctGuesses}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-rose-50/78">
                Missar kostar liv, men nu syns också exakt vilken öl som fällde
                dig och vad rätt svar var.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-amber-300/15 bg-amber-50/8 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-3 text-amber-100">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-300/15 bg-black/15">
                  <Crown className="size-5" strokeWidth={2.1} />
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">
                    Global placering
                  </p>
                  <p className="text-3xl font-black">
                    {overallRank ? `#${overallRank}` : "Utanför listan"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-amber-50/76">
                {overallRank
                  ? `Din bästa sparade runda placerar dig på plats ${overallRank} av ${totalRankedPlayers}.`
                  : "Gästrundor rankas inte globalt, men poäng och matchstatistik visas ändå här."}
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-amber-300/15 bg-amber-50/8 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-amber-200/10 pb-3">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">
                  Gissning för gissning
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-amber-100">
                  Så gick rundan
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-amber-300/15 bg-black/15 px-3 py-1.5 text-sm text-amber-100">
                <Trophy className="size-4 text-amber-300" strokeWidth={2.1} />
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
                        ? "border-emerald-300/15 bg-emerald-500/10 text-emerald-50"
                        : "border-rose-300/15 bg-rose-500/10 text-rose-50"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em]">
                          <span>#{index + 1}</span>
                          <span className="opacity-65">•</span>
                          <span>{item.beer.brewery}</span>
                        </div>
                        <p className="mt-2 text-xl font-black tracking-tight text-balance">
                          {item.beer.name}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
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
                        <p className="text-sm font-black uppercase tracking-[0.18em]">
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

                    <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                      <p className="rounded-2xl border border-current/12 bg-black/10 px-3 py-2">
                        Svit: {item.streakBeforeGuess} → {item.streakAfterGuess}
                      </p>
                      <p className="rounded-2xl border border-current/12 bg-black/10 px-3 py-2">
                        Liv: {item.lifeDelta === 0 ? "Ingen förlust" : "-1 liv"}
                      </p>
                      <p className="rounded-2xl border border-current/12 bg-black/10 px-3 py-2">
                        Korttyp: {item.beer.real ? "Riktig öl" : "Fejköl"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Riktiga öl"
            value={stats.realBeers.toString()}
            detail={`${stats.correctRealGuesses} av dem identifierades korrekt.`}
            icon={GlassWater}
          />
          <StatCard
            label="Fejköl"
            value={stats.fakeBeers.toString()}
            detail={`${stats.correctFakeGuesses} av dem identifierades korrekt.`}
            icon={CircleX}
          />
          <StatCard
            label="Poängplock"
            value={stats.totalPointsAwarded.toString()}
            detail="Summan av alla poäng som delades ut under rundan."
            icon={Trophy}
          />
        </section>
      </div>
    </div>
  );
}
