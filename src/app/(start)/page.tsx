import { Show, UserButton } from "@clerk/nextjs";

import Link from "next/link";

import PlayButton from "@/app/(start)/_/play-button";
import ResetLocalStorage from "@/app/(start)/_/reset-local-storage";
import StatsLink from "@/app/(start)/_/stats-link";
import SignInButton from "@/app/play/_/sign-in-button";
import RetryButton from "@/ui/retry-button";
import { isCurrentUserAdmin } from "@/utils/admin";
import { getBeerCount } from "@/utils/beer";

export default async function StartPage() {
  const [beerCount, isAdmin] = await Promise.all([
    getBeerCount(),
    isCurrentUserAdmin(),
  ]);

  return (
    <div className="grid">
      <div className="grid w-full max-w-sm gap-3 justify-self-center text-center">
        <h1 className="pub-hero-title">Har du känsla för öl?</h1>
        <p className="mb-3 text-sm leading-6 text-gold-100/80">
          Riktigt ölnamn eller välgjord bluff? Tre liv. En plats på topplistan.
        </p>
        {beerCount === null || beerCount === 0 ? (
          <div className="surface p-4" role="status">
            <p className="mb-3 text-sm text-gold-100">
              {beerCount === null
                ? "Vi kunde inte hämta spelet just nu."
                : "Det finns inga öl att spela med ännu. Prova igen om en stund."}
            </p>
            <RetryButton />
          </div>
        ) : (
          <PlayButton />
        )}
        <StatsLink />
        {isAdmin ? (
          <>
            <Link href="/admin/promos" className="button-secondary w-full">
              Promo Admin
            </Link>
            <Link href="/admin/users" className="button-secondary w-full">
              User Admin
            </Link>
          </>
        ) : null}
        <Show when="signed-out">
          <SignInButton />
        </Show>
        <Show when="signed-in">
          <div className="flex justify-center py-2">
            <UserButton />
          </div>
        </Show>
        <ResetLocalStorage />
      </div>
    </div>
  );
}
