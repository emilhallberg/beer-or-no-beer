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
    <article className="rounded-3xl border border-amber-700/60 bg-[#1b0f08]/82 p-5 text-amber-50 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      <p className="mt-6 text-3xl font-black text-amber-200 sm:text-4xl">
        {value}
      </p>
      <p className="mt-3 max-w-[28ch] text-sm leading-6 text-amber-50/82">
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
        <div className="flex flex-col gap-4 rounded-3xl border border-amber-700/70 bg-[#1a0f08]/80 p-5 text-amber-50 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300/80">
              Beer or No Beer
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
              Ölstatistik att skryta om
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-amber-50/80 sm:text-base">
              Här ser du bara din egen profil: vilka bryggerier som följer med
              dig genom rundorna och vilken alkoholhalt som präglar ditt spel.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-15 items-center justify-center rounded-2xl border border-amber-800/70 bg-black/14 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.06em] text-amber-100/92 transition-colors hover:border-amber-700/80 hover:bg-black/24 hover:text-amber-50"
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

        <section className="rounded-3xl border border-amber-700/60 bg-[#1b0f08]/80 p-5 text-amber-50 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
            Din profil
          </p>
          <p className="mt-3 text-sm leading-6 text-amber-50/82 sm:text-base">
            Vill du använda globala insikter i bryggeri- eller sponsorsamtal? I
            promo-admin ligger de nu tillsammans med klickdata och aktiva
            erbjudanden.
          </p>
        </section>
      </div>
    </div>
  );
}
