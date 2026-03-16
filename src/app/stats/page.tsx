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
  title: "Ölstatistik | Beer or No Beer?",
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
              Ölstatistik att skryta om
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-amber-50/80 sm:text-base">
              Din profil visar nu vilket bryggeri du är mest lojal mot och din
              genomsnittliga alkoholhalt, och topplistan är uppdelad så att
              riktiga och fejkade öl får varsin kategori.
            </p>
          </div>
          <Link
            href="/"
            className="grid h-12 place-items-center rounded border-b-4 border-amber-700 bg-amber-950 px-4 font-bold text-white uppercase transition-colors hover:border-amber-500 hover:bg-amber-400"
          >
            Till startsidan
          </Link>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <StatCard
            eyebrow="Din statistik"
            title="Mest lojala bryggeri"
            value={loyalBrewery?.name ?? "Ingen data än"}
            detail={
              loyalBrewery
                ? `Du har sett öl från det här bryggeriet ${loyalBrewery.totalGuesses} gånger: ${loyalBrewery.realGuesses} riktiga och ${loyalBrewery.fakeGuesses} fejkade.`
                : "Slutför en runda först för att låsa upp din bryggerilojalitet."
            }
          />
          <StatCard
            eyebrow="Din statistik"
            title="Genomsnittlig alkoholhalt"
            value={averageAbv ? formatAbv(averageAbv.overall) : "Ingen data än"}
            detail={
              averageAbv
                ? `Riktiga öl ligger i snitt på ${averageAbv.real !== null ? formatAbv(averageAbv.real) : "saknas"} och fejkade öl ligger i snitt på ${averageAbv.fake !== null ? formatAbv(averageAbv.fake) : "saknas"}.`
                : "Slutför en runda först för att se din genomsnittliga ABV för riktiga och fejkade öl."
            }
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <StatCard
            eyebrow="Totalt • Riktig öl"
            title="Mest igenkända öl"
            value={realStats.mostKnownBeer?.name ?? "Inga gissningar än"}
            detail={
              realStats.mostKnownBeer
                ? `${realStats.mostKnownBeer.brewery}. Spelare gissar rätt ${formatAccuracy(realStats.mostKnownBeer.accuracy)} av gångerna över ${realStats.mostKnownBeer.totalGuesses} gissningar.`
                : "Spela några rundor så vaknar det här kortet till liv."
            }
          />
          <StatCard
            eyebrow="Totalt • Riktig öl"
            title="Minst igenkända öl"
            value={realStats.mostUnknownBeer?.name ?? "Inga gissningar än"}
            detail={
              realStats.mostUnknownBeer
                ? `${realStats.mostUnknownBeer.brewery}. Spelare missar den ${formatAccuracy(1 - realStats.mostUnknownBeer.accuracy)} av gångerna över ${realStats.mostUnknownBeer.totalGuesses} gissningar.`
                : "Spela några rundor så vaknar det här kortet till liv."
            }
          />
          <StatCard
            eyebrow="Totalt • Fejköl"
            title="Mest igenkända öl"
            value={fakeStats.mostKnownBeer?.name ?? "Inga gissningar än"}
            detail={
              fakeStats.mostKnownBeer
                ? `${fakeStats.mostKnownBeer.brewery}. Spelare gissar rätt ${formatAccuracy(fakeStats.mostKnownBeer.accuracy)} av gångerna över ${fakeStats.mostKnownBeer.totalGuesses} gissningar.`
                : "Spela några rundor så vaknar det här kortet till liv."
            }
          />
          <StatCard
            eyebrow="Totalt • Fejköl"
            title="Minst igenkända öl"
            value={fakeStats.mostUnknownBeer?.name ?? "Inga gissningar än"}
            detail={
              fakeStats.mostUnknownBeer
                ? `${fakeStats.mostUnknownBeer.brewery}. Spelare missar den ${formatAccuracy(1 - fakeStats.mostUnknownBeer.accuracy)} av gångerna över ${fakeStats.mostUnknownBeer.totalGuesses} gissningar.`
                : "Spela några rundor så vaknar det här kortet till liv."
            }
          />
        </section>

        <section className="grid gap-4 rounded-3xl border border-amber-700/60 bg-amber-950/70 p-5 text-amber-50 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
              Totalt
            </p>
            <p className="mt-3 text-3xl font-black text-amber-200">
              {stats.overall.totalCompletedGames}
            </p>
            <p className="mt-2 text-sm text-amber-50/75">
              avslutade spel ligger till grund för den här statistiken.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
              Underlag
            </p>
            <p className="mt-3 text-3xl font-black text-amber-200">
              {stats.overall.totalGuesses}
            </p>
            <p className="mt-2 text-sm text-amber-50/75">
              registrerade gissningar från alla avslutade rundor.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
