import Link from "next/link";

import { requireAdminUser } from "@/utils/admin";
import { getPromoAdminPageData } from "@/utils/promos";
import { getAdminBeerInsights, getBeerStatsPageData } from "@/utils/stats";

export const metadata = {
  title: "Promo Admin | Beer or No Beer?",
};

function formatDate(value: string | null) {
  if (!value) return "Ingen aktivitet än";

  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAccuracy(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default async function PromoAdminPage() {
  await requireAdminUser();

  const [data, insights, stats] = await Promise.all([
    getPromoAdminPageData(),
    getAdminBeerInsights(),
    getBeerStatsPageData(),
  ]);
  const realStats = stats.overall.real;
  const fakeStats = stats.overall.fake;
  const beerModes = [
    {
      title: "Riktiga • Mest igenkända",
      rows: insights.realMostKnown,
    },
    {
      title: "Riktiga • Mest missade",
      rows: insights.realMostMissed,
    },
    {
      title: "Fejköl • Mest trovärdiga",
      rows: insights.fakeMostConvincing,
    },
    {
      title: "Fejköl • Mest genomskådade",
      rows: insights.fakeMostTransparent,
    },
  ];

  return (
    <div className="min-h-svh px-4 py-6 text-gold-50 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="surface p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/70">
                Promo Admin
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
                Erbjudanden och klick
              </h1>
              <p className="mt-4 text-sm leading-6 text-gold-50/78 sm:text-base">
                Följ aktiva erbjudanden, klick och vilka öl spelarna känner
                igen.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/users"
                className="inline-flex min-h-15 items-center justify-center rounded-2xl border border-gold-300/30 bg-gold-300/10 px-4 py-3 text-sm font-bold tracking-[0.06em] text-gold-50 transition-colors hover:border-gold-200/45 hover:bg-gold-300/16"
              >
                User Admin
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-15 items-center justify-center rounded-2xl border border-gold-700/70 bg-pub-950/90 px-4 py-3 text-sm font-bold tracking-[0.06em] text-gold-100 transition-colors hover:border-gold-500 hover:bg-pub-900/90"
              >
                Till startsidan
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                Aktiva promos
              </p>
              <p className="mt-2 text-3xl font-black text-gold-100">
                {data.summary.activePromos}
              </p>
            </article>
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                Totala klick
              </p>
              <p className="mt-2 text-3xl font-black text-gold-100">
                {data.summary.totalClicks}
              </p>
            </article>
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                Senaste klick
              </p>
              <p className="mt-2 text-lg font-black text-gold-100">
                {formatDate(data.summary.lastClickAt)}
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-4">
          {data.promos.map((promo) => (
            <article key={promo.id} className="surface p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-gold-500/30 bg-gold-400/10 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.04em] text-gold-200">
                      {promo.placement}
                    </span>
                    <span className="rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.04em] text-gold-100">
                      {promo.kind}
                    </span>
                    <span className="rounded-full border border-pub-400/25 bg-pub-400/10 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.04em] text-pub-100">
                      {promo.isActive ? "Aktiv" : "Pausad"}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-black tracking-tight text-gold-100">
                    {promo.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gold-50/84">
                    {promo.body}
                  </p>
                  <p className="mt-3 text-sm text-gold-200/80">
                    CTA: {promo.ctaLabel}
                  </p>
                  <p className="mt-1 break-all text-xs text-gold-50/55">
                    {promo.href}
                  </p>
                </div>

                <div className="grid min-w-[15rem] gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-gold-800/70 bg-black/28 px-4 py-3">
                    <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                      Klick
                    </p>
                    <p className="mt-2 text-2xl font-black text-gold-100">
                      {promo.clicks}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gold-800/70 bg-black/28 px-4 py-3">
                    <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                      Senast klickad
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gold-100">
                      {formatDate(promo.lastClickAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gold-800/70 bg-black/28 px-4 py-3">
                    <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                      Sortering
                    </p>
                    <p className="mt-2 text-2xl font-black text-gold-100">
                      {promo.sortOrder}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/70">
              Globala insikter
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-balance sm:text-4xl">
              Det här kan du visa bryggerier
            </h2>
            <p className="mt-4 text-sm leading-6 text-gold-50/78 sm:text-base">
              Samlade insikter från alla avslutade rundor. Använd dem för att
              visa vilka öl som sitter direkt och vilka som spelare faktiskt
              blandar ihop.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                Avslutade rundor
              </p>
              <p className="mt-2 text-3xl font-black text-gold-100">
                {stats.overall.totalCompletedGames}
              </p>
            </article>
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                Totala gissningar
              </p>
              <p className="mt-2 text-3xl font-black text-gold-100">
                {stats.overall.totalGuesses}
              </p>
            </article>
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                Mest kända riktiga
              </p>
              <p className="mt-2 text-xl font-black text-gold-100">
                {realStats.mostKnownBeer?.name ?? "Ingen data än"}
              </p>
              <p className="mt-2 text-sm text-gold-50/72">
                {realStats.mostKnownBeer
                  ? `${formatAccuracy(realStats.mostKnownBeer.accuracy)} rätt`
                  : "Spela fler rundor för att se mönster."}
              </p>
            </article>
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/80">
                Mest lurande fejköl
              </p>
              <p className="mt-2 text-xl font-black text-gold-100">
                {fakeStats.mostUnknownBeer?.name ?? "Ingen data än"}
              </p>
              <p className="mt-2 text-sm text-gold-50/72">
                {fakeStats.mostUnknownBeer
                  ? `${formatAccuracy(1 - fakeStats.mostUnknownBeer.accuracy)} missas`
                  : "Spela fler rundor för att se mönster."}
              </p>
            </article>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <article className="rounded-[1.75rem] border border-pub-800/65 bg-pub-900/90 p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.04em] text-pub-300/80">
                Riktig öl
              </p>
              <h3 className="mt-3 text-2xl font-black text-pub-50">
                Mest igenkända öl
              </h3>
              <p className="mt-3 text-3xl font-black text-pub-100">
                {realStats.mostKnownBeer?.name ?? "Ingen data än"}
              </p>
              <p className="mt-3 text-sm leading-6 text-pub-50/80">
                {realStats.mostKnownBeer
                  ? `${realStats.mostKnownBeer.brewery}. Spelare gissar rätt ${formatAccuracy(realStats.mostKnownBeer.accuracy)} av gångerna över ${realStats.mostKnownBeer.totalGuesses} gissningar.`
                  : "Spela några rundor så vaknar det här kortet till liv."}
              </p>
              <h3 className="mt-6 text-2xl font-black text-pub-50">
                Minst igenkända öl
              </h3>
              <p className="mt-3 text-3xl font-black text-pub-100">
                {realStats.mostUnknownBeer?.name ?? "Ingen data än"}
              </p>
              <p className="mt-3 text-sm leading-6 text-pub-50/80">
                {realStats.mostUnknownBeer
                  ? `${realStats.mostUnknownBeer.brewery}. Spelare missar den ${formatAccuracy(1 - realStats.mostUnknownBeer.accuracy)} av gångerna över ${realStats.mostUnknownBeer.totalGuesses} gissningar.`
                  : "Spela några rundor så vaknar det här kortet till liv."}
              </p>
            </article>

            <article className="surface p-5">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/80">
                Fejköl
              </p>
              <h3 className="mt-3 text-2xl font-black text-gold-50">
                Mest igenkända öl
              </h3>
              <p className="mt-3 text-3xl font-black text-gold-100">
                {fakeStats.mostKnownBeer?.name ?? "Ingen data än"}
              </p>
              <p className="mt-3 text-sm leading-6 text-gold-50/80">
                {fakeStats.mostKnownBeer
                  ? `${fakeStats.mostKnownBeer.brewery}. Spelare gissar rätt ${formatAccuracy(fakeStats.mostKnownBeer.accuracy)} av gångerna över ${fakeStats.mostKnownBeer.totalGuesses} gissningar.`
                  : "Spela några rundor så vaknar det här kortet till liv."}
              </p>
              <h3 className="mt-6 text-2xl font-black text-gold-50">
                Minst igenkända öl
              </h3>
              <p className="mt-3 text-3xl font-black text-gold-100">
                {fakeStats.mostUnknownBeer?.name ?? "Ingen data än"}
              </p>
              <p className="mt-3 text-sm leading-6 text-gold-50/80">
                {fakeStats.mostUnknownBeer
                  ? `${fakeStats.mostUnknownBeer.brewery}. Spelare missar den ${formatAccuracy(1 - fakeStats.mostUnknownBeer.accuracy)} av gångerna över ${fakeStats.mostUnknownBeer.totalGuesses} gissningar.`
                  : "Spela några rundor så vaknar det här kortet till liv."}
              </p>
            </article>
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/70">
              Topplistor
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-balance sm:text-4xl">
              Mest värdefulla öl- och bryggeriinsikter
            </h2>
            <p className="mt-4 text-sm leading-6 text-gold-50/78 sm:text-base">
              Här ser du de 100 viktigaste ölen och bryggerierna att prata om
              när du vill visa vad som faktiskt presterar, förvirrar eller
              sticker ut i spelet.
            </p>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-2">
            {beerModes.map((mode) => (
              <article key={mode.title} className="surface p-5">
                <h3 className="text-xl font-black text-gold-100">
                  {mode.title}
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[0.65rem] tracking-[0.04em] text-gold-300/70">
                      <tr>
                        <th className="pb-3 pr-3">#</th>
                        <th className="pb-3 pr-3">Öl</th>
                        <th className="pb-3 pr-3">Bryggeri</th>
                        <th className="pb-3 pr-3">Typ</th>
                        <th className="pb-3 pr-3 text-right">Gissn.</th>
                        <th className="pb-3 text-right">Träff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-900/45">
                      {mode.rows.slice(0, 12).map((row) => (
                        <tr key={`${mode.title}-${row.rank}-${row.name}`}>
                          <td className="py-3 pr-3 font-black text-gold-100">
                            {row.rank}
                          </td>
                          <td className="py-3 pr-3 font-semibold text-gold-50">
                            {row.name}
                          </td>
                          <td className="py-3 pr-3 text-gold-50/78">
                            {row.brewery}
                          </td>
                          <td className="py-3 pr-3 text-gold-50/72">
                            {row.type}
                          </td>
                          <td className="py-3 pr-3 text-right text-gold-100">
                            {row.totalGuesses}
                          </td>
                          <td className="py-3 text-right font-semibold text-gold-100">
                            {formatAccuracy(row.accuracy)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>

          <article className="surface mt-6 p-5">
            <h3 className="text-xl font-black text-gold-100">
              Bryggerier • Mest spelade och mest insiktsrika
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[0.65rem] tracking-[0.04em] text-gold-300/70">
                  <tr>
                    <th className="pb-3 pr-3">Bryggeri</th>
                    <th className="pb-3 pr-3 text-right">Öl</th>
                    <th className="pb-3 pr-3 text-right">Gissn.</th>
                    <th className="pb-3 pr-3 text-right">Träff</th>
                    <th className="pb-3 pr-3">Bäst kända öl</th>
                    <th className="pb-3">Svagast kända öl</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-900/45">
                  {insights.breweries.slice(0, 20).map((brewery) => (
                    <tr key={brewery.name}>
                      <td className="py-3 pr-3 font-semibold text-gold-50">
                        {brewery.name}
                      </td>
                      <td className="py-3 pr-3 text-right text-gold-100">
                        {brewery.beerCount}
                      </td>
                      <td className="py-3 pr-3 text-right text-gold-100">
                        {brewery.totalGuesses}
                      </td>
                      <td className="py-3 pr-3 text-right font-semibold text-gold-100">
                        {formatAccuracy(brewery.accuracy)}
                      </td>
                      <td className="py-3 pr-3 text-gold-50/78">
                        {brewery.topBeer ?? "Ingen data"}
                      </td>
                      <td className="py-3 text-gold-50/78">
                        {brewery.weakestBeer ?? "Ingen data"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
