import Link from "next/link";

import { getBeerStatsPageData } from "@/utils/stats";

function formatAbv(value: number) {
  return `${value.toFixed(1)}% ABV`;
}

function formatAccuracy(value: number) {
  return `${Math.round(value * 100)}%`;
}

function StatCard({
  eyebrow,
  title,
  value,
  detail,
}: {
  detail: string;
  eyebrow: string;
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-3xl border border-amber-700/60 bg-amber-950/80 p-5 text-amber-50 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      <p className="mt-6 text-3xl font-black text-amber-200 sm:text-4xl">
        {value}
      </p>
      <p className="mt-3 max-w-[28ch] text-sm leading-6 text-amber-50/75">
        {detail}
      </p>
    </article>
  );
}

export const metadata = {
  title: "Beer Stats | Beer or No Beer?",
};

export default async function StatsPage() {
  const stats = await getBeerStatsPageData();
  const loyalBrewery = stats.user.mostLoyalBrewery;
  const averageAbv = stats.user.averageAbv;
  const realStats = stats.overall.real;
  const fakeStats = stats.overall.fake;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-amber-700/70 bg-black/20 p-5 text-amber-50 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300/80">
              Beer or No Beer
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
              Beer stats worth bragging about
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-amber-50/80 sm:text-base">
              Your profile now tracks brewery loyalty and average strength, and
              the recognition board is split so real beers and fake beers get
              their own spotlight.
            </p>
          </div>
          <Link
            href="/"
            className="grid h-12 place-items-center rounded border-b-4 border-amber-700 bg-amber-950 px-4 font-bold text-white uppercase transition-colors hover:border-amber-500 hover:bg-amber-400"
          >
            Back to start
          </Link>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <StatCard
            eyebrow="Your Stats"
            title="Most loyal brewery"
            value={loyalBrewery?.name ?? "No data yet"}
            detail={
              loyalBrewery
                ? `You have seen beers from this brewery ${loyalBrewery.totalGuesses} times: ${loyalBrewery.realGuesses} real and ${loyalBrewery.fakeGuesses} fake.`
                : "Finish a run first to unlock your brewery loyalty."
            }
          />
          <StatCard
            eyebrow="Your Stats"
            title="Average beer strength"
            value={averageAbv ? formatAbv(averageAbv.overall) : "No data yet"}
            detail={
              averageAbv
                ? `Real beers average ${averageAbv.real !== null ? formatAbv(averageAbv.real) : "n/a"} and fake beers average ${averageAbv.fake !== null ? formatAbv(averageAbv.fake) : "n/a"}.`
                : "Finish a run first to see your average ABV across real and fake beers."
            }
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <StatCard
            eyebrow="Overall • Real Beer"
            title="Most known beer"
            value={realStats.mostKnownBeer?.name ?? "No guesses yet"}
            detail={
              realStats.mostKnownBeer
                ? `${realStats.mostKnownBeer.brewery}. Players identify it correctly ${formatAccuracy(realStats.mostKnownBeer.accuracy)} of the time across ${realStats.mostKnownBeer.totalGuesses} guesses.`
                : "Finish a few games and this card will light up."
            }
          />
          <StatCard
            eyebrow="Overall • Real Beer"
            title="Most unknown beer"
            value={realStats.mostUnknownBeer?.name ?? "No guesses yet"}
            detail={
              realStats.mostUnknownBeer
                ? `${realStats.mostUnknownBeer.brewery}. Players miss it ${formatAccuracy(1 - realStats.mostUnknownBeer.accuracy)} of the time across ${realStats.mostUnknownBeer.totalGuesses} guesses.`
                : "Finish a few games and this card will light up."
            }
          />
          <StatCard
            eyebrow="Overall • Fake Beer"
            title="Most known beer"
            value={fakeStats.mostKnownBeer?.name ?? "No guesses yet"}
            detail={
              fakeStats.mostKnownBeer
                ? `${fakeStats.mostKnownBeer.brewery}. Players identify it correctly ${formatAccuracy(fakeStats.mostKnownBeer.accuracy)} of the time across ${fakeStats.mostKnownBeer.totalGuesses} guesses.`
                : "Finish a few games and this card will light up."
            }
          />
          <StatCard
            eyebrow="Overall • Fake Beer"
            title="Most unknown beer"
            value={fakeStats.mostUnknownBeer?.name ?? "No guesses yet"}
            detail={
              fakeStats.mostUnknownBeer
                ? `${fakeStats.mostUnknownBeer.brewery}. Players miss it ${formatAccuracy(1 - fakeStats.mostUnknownBeer.accuracy)} of the time across ${fakeStats.mostUnknownBeer.totalGuesses} guesses.`
                : "Finish a few games and this card will light up."
            }
          />
        </section>

        <section className="grid gap-4 rounded-3xl border border-amber-700/60 bg-amber-950/70 p-5 text-amber-50 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
              Totals
            </p>
            <p className="mt-3 text-3xl font-black text-amber-200">
              {stats.overall.totalCompletedGames}
            </p>
            <p className="mt-2 text-sm text-amber-50/75">
              completed games contribute to these overall stats.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
              Sample Size
            </p>
            <p className="mt-3 text-3xl font-black text-amber-200">
              {stats.overall.totalGuesses}
            </p>
            <p className="mt-2 text-sm text-amber-50/75">
              recorded guesses across all finished runs.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
