import { Show, UserButton } from "@clerk/nextjs";

import Link from "next/link";

import PlayButton from "@/app/(start)/_/play-button";
import ResetLocalStorage from "@/app/(start)/_/reset-local-storage";
import SignInButton from "@/app/play/_/sign-in-button";
import { CardFan } from "@/ui/beer-art";
import RetryButton from "@/ui/retry-button";
import { isCurrentUserAdmin } from "@/utils/admin";
import { getBeerCount } from "@/utils/beer";

export default async function StartPage() {
  const [beerCount, isAdmin] = await Promise.all([
    getBeerCount(),
    isCurrentUserAdmin(),
  ]);

  return (
    <>
      <section className="pub-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-star" aria-hidden="true">
              ✦
            </span>{" "}
            Ett namn. Ett beslut. Tre liv.
          </p>
          <h1 className="pub-hero-title">
            BRYGGD.
            <br />
            <em>eller</em> <span>BLUFF?</span>
          </h1>
          <p className="hero-description">
            Vissa ölnamn låter för galna för att vara sanna.
            <br className="hidden sm:block" /> Det är precis det som är grejen.
          </p>
          <div className="hero-play">
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
            <p className="play-note">Spela direkt · Inget konto behövs</p>
          </div>
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
            <div className="hero-sign-in">
              <span>Redan stammis?</span>
              <SignInButton />
            </div>
          </Show>
          <Show when="signed-in">
            <div className="flex justify-center py-2">
              <UserButton />
            </div>
          </Show>
          <ResetLocalStorage />
        </div>
        <CardFan />
      </section>
      <div className="ticker-strip" aria-hidden="true">
        <span>RIKTIG ÖL</span>
        <b>✦</b>
        <span>REN BLUFF</span>
        <b>✦</b>
        <span>LITA PÅ MAGKÄNSLAN</span>
        <b>✦</b>
        <span>BEER OR NO BEER?</span>
      </div>
      <section className="how-to-play" aria-label="Så spelar du">
        <article>
          <span className="step-number">01</span>
          <div>
            <h2>Syna namnet.</h2>
            <p>Riktig öl eller kreativt påhitt?</p>
          </div>
        </article>
        <article>
          <span className="step-number">02</span>
          <div>
            <h2>Gå på känsla.</h2>
            <p>Svep eller tryck. Ett fel kostar ett liv.</p>
          </div>
        </article>
        <article>
          <span className="step-number">03</span>
          <div>
            <h2>Skåla. Utmana.</h2>
            <p>Bygg din svit och slå kompisens poäng.</p>
          </div>
        </article>
      </section>
    </>
  );
}
