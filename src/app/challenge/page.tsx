import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import Brand from "@/ui/brand";
import PromoCard from "@/ui/promo-card";
import StartGameButton from "@/ui/start-game-button";
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

  if (!Number.isFinite(parsedScore) || parsedScore < 0) {
    return null;
  }

  return Math.floor(parsedScore);
}

function buildChallengeCopy(from?: string, score?: string) {
  const challengerName = from?.trim();
  const normalizedScore = normalizeScore(score);

  if (challengerName && normalizedScore !== null) {
    return {
      title: `${challengerName} utmanar dig i Beer or No Beer?`,
      description: `Slå ${challengerName}s poäng på ${normalizedScore} och visa vem som faktiskt känner igen ett riktigt ölnamn.`,
      heading: `${challengerName} utmanar dina ölkunskaper!`,
      cta: `Slå ${normalizedScore} poäng`,
    };
  }

  if (normalizedScore !== null) {
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
  const promo = await getActivePromoForPlacement("challenge");

  if (!normalizedScore && !score) redirect("/");

  if (score && normalizedScore === null) redirect("/");

  return (
    <div className="min-h-svh px-4 py-6 text-gold-50 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="surface overflow-hidden p-6 text-center sm:p-8">
          <div className="mx-auto grid max-w-2xl place-items-center">
            <Brand compact linked />
            <p className="mt-4 text-xs font-semibold tracking-[0.04em] text-gold-200/70">
              Utmaning
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-balance sm:text-5xl">
              {copy.heading}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-gold-50/80 sm:text-base">
              {copy.description}
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-sm">
            <StartGameButton label={copy.cta} />
            <p className="mt-4 text-sm text-gold-100/80">
              Tre liv · Rätt svar ger poäng · Spela utan konto
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex min-h-11 items-center text-sm text-gold-200 underline underline-offset-4"
            >
              Till startsidan
            </Link>
          </div>
        </section>

        {promo ? <PromoCard promo={promo} /> : null}
      </div>
    </div>
  );
}
