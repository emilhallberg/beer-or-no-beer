import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import PromoCard from "@/ui/promo-card";
import { createGame } from "@/utils/game";
import { getActivePromoForPlacement } from "@/utils/promos";

type SearchParams = {
  from?: string;
  score?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

function normalizeScore(score?: string) {
  const parsedScore = Number(score);

  if (!Number.isFinite(parsedScore) || parsedScore <= 0) {
    return null;
  }

  return Math.floor(parsedScore);
}

function buildChallengeCopy(from?: string, score?: string) {
  const challengerName = from?.trim();
  const normalizedScore = normalizeScore(score);

  if (challengerName && normalizedScore) {
    return {
      title: `${challengerName} utmanar dig i Beer or No Beer?`,
      description: `Slå ${challengerName}s poäng på ${normalizedScore} och visa vem som faktiskt känner igen ett riktigt ölnamn.`,
      heading: `${challengerName} utmanar dina ölkunskaper!`,
      cta: `Slå ${normalizedScore} poäng`,
    };
  }

  if (normalizedScore) {
    return {
      title: `Kan du slå ${normalizedScore} poäng i Beer or No Beer?`,
      description:
        "Tre liv, en poängjakt och en enkel fråga: är ölnamnet på riktigt eller fejk?",
      heading: "Dina ölkunskaper utmanas!",
      cta: `Slå ${normalizedScore} poäng`,
    };
  }

  return {
    title: "Beer or No Beer? Challenge",
    description:
      "Tre liv, snabba beslut och en enkel fråga: är ölnamnet på riktigt eller inte?",
    heading: "Dina ölkunskaper utmanas!",
    cta: "Spela nu",
  };
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { from, score } = await searchParams;
  const copy = buildChallengeCopy(from, score);

  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: copy.title,
      description: copy.description,
    },
  };
}

export default async function ChallengePage({ searchParams }: Props) {
  const { from, score } = await searchParams;
  const normalizedScore = normalizeScore(score);
  const copy = buildChallengeCopy(from, score);
  const promo = getActivePromoForPlacement("challenge");

  if (!normalizedScore && !score) redirect("/");

  if (score && normalizedScore === null) redirect("/");

  async function startGame() {
    "use server";

    const gameId = await createGame();
    redirect(`/play/${gameId}`);
  }

  return (
    <div className="min-h-svh px-4 py-6 text-amber-50 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-amber-400/20 bg-[linear-gradient(145deg,rgba(120,53,15,0.92),rgba(41,19,8,0.98))] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-8">
          <div className="mx-auto grid max-w-2xl place-items-center">
            <Image
              src="/logo.svg"
              alt="Beer or No Beer?"
              width={150}
              height={150}
              loading="eager"
              priority
            />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">
              Challenge Mode
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
              {copy.heading}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-amber-50/80 sm:text-base">
              {copy.description}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-amber-800/70 bg-black/18 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-400/70">
                Mål
              </p>
              <p className="mt-2 text-3xl font-black text-amber-100">
                {normalizedScore ?? "Fri runda"}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-amber-800/70 bg-black/18 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-400/70">
                Liv
              </p>
              <p className="mt-2 text-3xl font-black text-amber-100">3</p>
            </div>
            <div className="rounded-[1.75rem] border border-amber-800/70 bg-black/18 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-400/70">
                Uppdrag
              </p>
              <p className="mt-2 text-3xl font-black text-amber-100">
                Beer or No Beer
              </p>
            </div>
          </div>

          <div className="mt-9">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300/70">
              Anta utmaningen
            </p>
          </div>

          <form action={startGame} className="mt-3">
            <button className="inline-flex min-h-16 items-center justify-center rounded-2xl border-b-4 border-amber-200/40 bg-[linear-gradient(180deg,#f7d774_0%,#e4b63c_100%)] px-8 py-3 text-lg font-black uppercase tracking-[0.06em] text-amber-950 shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition-transform transition-colors hover:-translate-y-0.5 hover:border-amber-100/60 hover:bg-[linear-gradient(180deg,#fde08a_0%,#efbe44_100%)] active:translate-y-0.5 active:border-b-2">
              {copy.cta}
            </button>
          </form>
        </section>

        {promo ? <PromoCard promo={promo} /> : null}
      </div>
    </div>
  );
}
