import Link from "next/link";

import { getBeerStatsPageData } from "@/utils/stats";

function formatAbv(value: number) {
  return `${value.toFixed(1)}% ABV`;
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
    <article className="surface p-5 text-gold-50">
      <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/80">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      <p className="mt-6 text-3xl font-black text-gold-200 sm:text-4xl">
        {value}
      </p>
      <p className="mt-3 max-w-[28ch] text-sm leading-6 text-gold-50/82">
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

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="surface flex flex-col gap-4 p-5 text-gold-50 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/80">
              Beer or No Beer
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
              Ölstatistik att skryta om
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-gold-50/80 sm:text-base">
              Här ser du bara din egen profil: vilka bryggerier som följer med
              dig genom rundorna och vilken alkoholhalt som präglar ditt spel.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-15 items-center justify-center rounded-2xl border border-gold-800/70 bg-black/14 px-4 py-3 text-center text-sm font-bold tracking-[0.06em] text-gold-100/92 transition-colors hover:border-gold-700/80 hover:bg-black/24 hover:text-gold-50"
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
      </div>
    </div>
  );
}
