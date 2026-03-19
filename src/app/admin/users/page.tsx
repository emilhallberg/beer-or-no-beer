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
    <div className="min-h-svh px-4 py-6 text-amber-50 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-amber-400/20 bg-[linear-gradient(145deg,rgba(36,59,92,0.92),rgba(13,22,38,0.98))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200/72">
                User Admin
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
                Spelarinsikter och aktivitet
              </h1>
              <p className="mt-4 text-sm leading-6 text-sky-50/82 sm:text-base">
                Här följer du hur många spelare som faktiskt använder spelet,
                när de senast var aktiva och vilka som kommer tillbaka för fler
                rundor.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/promos"
                className="inline-flex min-h-15 items-center justify-center rounded-2xl border border-sky-300/35 bg-sky-300/12 px-4 py-3 text-sm font-bold uppercase tracking-[0.06em] text-sky-50 transition-colors hover:border-sky-200/55 hover:bg-sky-300/18"
              >
                Promo Admin
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-15 items-center justify-center rounded-2xl border border-sky-900/70 bg-[#111c2a]/82 px-4 py-3 text-sm font-bold uppercase tracking-[0.06em] text-sky-100 transition-colors hover:border-sky-500 hover:bg-[#152335]/90"
              >
                Till startsidan
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[1.75rem] border border-sky-900/70 bg-[#111c2a]/82 px-5 py-4 shadow-[0_16px_38px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/70">
                Profiler
              </p>
              <p className="mt-2 text-3xl font-black text-sky-50">
                {overview.totalProfiles}
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-sky-900/70 bg-[#111c2a]/82 px-5 py-4 shadow-[0_16px_38px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/70">
                Signerade spelare
              </p>
              <p className="mt-2 text-3xl font-black text-sky-50">
                {overview.signedInUsersWithGames}
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-sky-900/70 bg-[#111c2a]/82 px-5 py-4 shadow-[0_16px_38px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/70">
                Gästaktörer
              </p>
              <p className="mt-2 text-3xl font-black text-sky-50">
                {overview.guestActors}
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-sky-900/70 bg-[#111c2a]/82 px-5 py-4 shadow-[0_16px_38px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/70">
                Totala rundor
              </p>
              <p className="mt-2 text-3xl font-black text-sky-50">
                {overview.totalGames}
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-[1.75rem] border border-sky-900/70 bg-[#111c2a]/82 p-5 shadow-[0_18px_42px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/70">
              Aktivitet
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/70">
                  Aktiva senaste 7 dgr
                </p>
                <p className="mt-2 text-2xl font-black text-sky-50">
                  {overview.activeUsersLast7Days}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/70">
                  Aktiva senaste 30 dgr
                </p>
                <p className="mt-2 text-2xl font-black text-sky-50">
                  {overview.activeUsersLast30Days}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/70">
                  Avslutade rundor
                </p>
                <p className="mt-2 text-2xl font-black text-sky-50">
                  {overview.completedGames}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/70">
                  Snitt rundor per spelare
                </p>
                <p className="mt-2 text-2xl font-black text-sky-50">
                  {overview.averageGamesPerSignedInPlayer}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-sky-900/70 bg-[#111c2a]/82 p-5 shadow-[0_18px_42px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/70">
              Fördelning
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/70">
                  Engångsspelare
                </p>
                <p className="mt-2 text-2xl font-black text-sky-50">
                  {overview.oneGamePlayers}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/70">
                  Återkommande spelare
                </p>
                <p className="mt-2 text-2xl font-black text-sky-50">
                  {overview.repeatPlayers}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/70">
                  Rundor inloggade
                </p>
                <p className="mt-2 text-2xl font-black text-sky-50">
                  {overview.signedInGames}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-900/70 bg-black/24 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/70">
                  Rundor gäster
                </p>
                <p className="mt-2 text-2xl font-black text-sky-50">
                  {overview.guestGames}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-[2rem] border border-sky-400/20 bg-[linear-gradient(145deg,rgba(28,44,69,0.92),rgba(10,18,31,0.98))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200/72">
              Senaste aktivitet
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-balance sm:text-4xl">
              Vilka spelare rör sig i produkten just nu
            </h2>
            <p className="mt-4 text-sm leading-6 text-sky-50/82 sm:text-base">
              Tabellen blandar inloggade spelare och gäster så du snabbt ser vem
              som faktiskt spelar, hur mycket de spelar och när de senast var
              inne.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-sky-900/70 bg-[#111c2a]/82 p-2 shadow-[0_18px_42px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[0.65rem] uppercase tracking-[0.22em] text-sky-300/72">
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
              <tbody className="divide-y divide-sky-950/45">
                {recentUsers.slice(0, 50).map((user) => (
                  <tr key={user.userId}>
                    <td className="px-3 py-3 font-semibold text-sky-50">
                      {formatName(user.displayName, user.type, user.userId)}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={
                          user.type === "guest"
                            ? "rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-amber-100"
                            : "rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-100"
                        }
                      >
                        {user.type === "guest" ? "Gäst" : "Inloggad"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right text-sky-100">
                      {user.gamesPlayed}
                    </td>
                    <td className="py-3 pr-3 text-right text-sky-100">
                      {user.completedGames}
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-sky-50">
                      {user.bestScore}
                    </td>
                    <td className="py-3 pr-3 text-right text-sky-100">
                      {user.totalGuesses}
                    </td>
                    <td className="py-3 pr-3 text-sky-50/78">
                      {formatDate(user.firstPlayedAt)}
                    </td>
                    <td className="py-3 pr-3 text-sky-50/78">
                      {formatDate(user.lastPlayedAt)}
                    </td>
                    <td className="max-w-44 truncate py-3 pr-3 text-xs text-sky-200/60">
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
