import Link from "next/link";

import { requireAdminUser } from "@/utils/admin";
import { getAdminUserInsights } from "@/utils/user-insights";

export const metadata = {
  title: "User Admin | Beer or No Beer?",
};

function formatDate(value: string | null) {
  if (!value) return "Ingen aktivitet än";

  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatName(
  displayName: string | null,
  type: "guest" | "signed_in",
  userId: string,
) {
  if (displayName?.trim()) return displayName;
  if (type === "guest") return "Gästspelare";
  return userId;
}

export default async function AdminUsersPage() {
  await requireAdminUser();

  const data = await getAdminUserInsights();
  const { overview, recentUsers } = data;

  return (
    <div className="min-h-svh px-4 py-6 text-gold-50 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="surface p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/72">
                User Admin
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
                Spelarinsikter och aktivitet
              </h1>
              <p className="mt-4 text-sm leading-6 text-gold-50/82 sm:text-base">
                Här följer du hur många spelare som faktiskt använder spelet,
                när de senast var aktiva och vilka som kommer tillbaka för fler
                rundor.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/promos"
                className="inline-flex min-h-15 items-center justify-center rounded-2xl border border-gold-300/35 bg-gold-300/12 px-4 py-3 text-sm font-bold tracking-[0.06em] text-gold-50 transition-colors hover:border-gold-200/55 hover:bg-gold-300/18"
              >
                Promo Admin
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-15 items-center justify-center rounded-2xl border border-gold-900/70 bg-pub-950/90 px-4 py-3 text-sm font-bold tracking-[0.06em] text-gold-100 transition-colors hover:border-gold-500 hover:bg-pub-900/90"
              >
                Till startsidan
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                Profiler
              </p>
              <p className="mt-2 text-3xl font-black text-gold-50">
                {overview.totalProfiles}
              </p>
            </article>
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                Signerade spelare
              </p>
              <p className="mt-2 text-3xl font-black text-gold-50">
                {overview.signedInUsersWithGames}
              </p>
            </article>
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                Gästaktörer
              </p>
              <p className="mt-2 text-3xl font-black text-gold-50">
                {overview.guestActors}
              </p>
            </article>
            <article className="surface px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                Totala rundor
              </p>
              <p className="mt-2 text-3xl font-black text-gold-50">
                {overview.totalGames}
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="surface p-5">
            <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
              Aktivitet
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gold-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                  Aktiva senaste 7 dgr
                </p>
                <p className="mt-2 text-2xl font-black text-gold-50">
                  {overview.activeUsersLast7Days}
                </p>
              </div>
              <div className="rounded-2xl border border-gold-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                  Aktiva senaste 30 dgr
                </p>
                <p className="mt-2 text-2xl font-black text-gold-50">
                  {overview.activeUsersLast30Days}
                </p>
              </div>
              <div className="rounded-2xl border border-gold-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                  Avslutade rundor
                </p>
                <p className="mt-2 text-2xl font-black text-gold-50">
                  {overview.completedGames}
                </p>
              </div>
              <div className="rounded-2xl border border-gold-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                  Snitt rundor per spelare
                </p>
                <p className="mt-2 text-2xl font-black text-gold-50">
                  {overview.averageGamesPerSignedInPlayer}
                </p>
              </div>
            </div>
          </article>

          <article className="surface p-5">
            <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
              Fördelning
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gold-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                  Engångsspelare
                </p>
                <p className="mt-2 text-2xl font-black text-gold-50">
                  {overview.oneGamePlayers}
                </p>
              </div>
              <div className="rounded-2xl border border-gold-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                  Återkommande spelare
                </p>
                <p className="mt-2 text-2xl font-black text-gold-50">
                  {overview.repeatPlayers}
                </p>
              </div>
              <div className="rounded-2xl border border-gold-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                  Rundor inloggade
                </p>
                <p className="mt-2 text-2xl font-black text-gold-50">
                  {overview.signedInGames}
                </p>
              </div>
              <div className="rounded-2xl border border-gold-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold-300/70">
                  Rundor gäster
                </p>
                <p className="mt-2 text-2xl font-black text-gold-50">
                  {overview.guestGames}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/72">
              Senaste aktivitet
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-balance sm:text-4xl">
              Vilka spelare rör sig i produkten just nu
            </h2>
            <p className="mt-4 text-sm leading-6 text-gold-50/82 sm:text-base">
              Tabellen blandar inloggade spelare och gäster så du snabbt ser vem
              som faktiskt spelar, hur mycket de spelar och när de senast var
              inne.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-gold-900/70 bg-pub-950/90 p-2 shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[0.65rem] tracking-[0.04em] text-gold-300/72">
                <tr>
                  <th className="pb-3 pl-3 pr-3">Spelare</th>
                  <th className="pb-3 pr-3">Typ</th>
                  <th className="pb-3 pr-3 text-right">Rundor</th>
                  <th className="pb-3 pr-3 text-right">Avsl.</th>
                  <th className="pb-3 pr-3 text-right">Bästa</th>
                  <th className="pb-3 pr-3 text-right">Gissn.</th>
                  <th className="pb-3 pr-3">Först spelad</th>
                  <th className="pb-3 pr-3">Senast spelad</th>
                  <th className="pb-3 pr-3">Id</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-950/45">
                {recentUsers.slice(0, 50).map((user) => (
                  <tr key={user.userId}>
                    <td className="px-3 py-3 font-semibold text-gold-50">
                      {formatName(user.displayName, user.type, user.userId)}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={
                          user.type === "guest"
                            ? "rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.04em] text-gold-100"
                            : "rounded-full border border-pub-400/25 bg-pub-400/10 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.04em] text-pub-100"
                        }
                      >
                        {user.type === "guest" ? "Gäst" : "Inloggad"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right text-gold-100">
                      {user.gamesPlayed}
                    </td>
                    <td className="py-3 pr-3 text-right text-gold-100">
                      {user.completedGames}
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-gold-50">
                      {user.bestScore}
                    </td>
                    <td className="py-3 pr-3 text-right text-gold-100">
                      {user.totalGuesses}
                    </td>
                    <td className="py-3 pr-3 text-gold-50/78">
                      {formatDate(user.firstPlayedAt)}
                    </td>
                    <td className="py-3 pr-3 text-gold-50/78">
                      {formatDate(user.lastPlayedAt)}
                    </td>
                    <td className="max-w-44 truncate py-3 pr-3 text-xs text-gold-200/60">
                      {user.userId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
