"use client";

import { useState } from "react";
import { ArrowUpRight, BadgeInfo } from "lucide-react";

import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { trackPromoClick } from "@/utils/promo-tracking";
import type { Promo } from "@/utils/promo-types";

type Props = {
  gameId?: number;
  promo: Promo;
};

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

export default function PromoCard({ gameId, promo }: Props) {
  const { push } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isExternal = isExternalHref(promo.href);

  async function onActivate() {
    if (isSubmitting) return;

    const externalTab = isExternal
      ? window.open("", "_blank", "noopener,noreferrer")
      : null;

    setIsSubmitting(true);

    try {
      await trackPromoClick({
        gameId,
        href: promo.href,
        kind: promo.kind,
        placement: promo.placement,
        promoId: promo.id,
      });
    } catch (error) {
      console.debug(error);
    }

    if (isExternal) {
      if (externalTab) {
        externalTab.opener = null;
        externalTab.location.href = promo.href;
      } else {
        window.location.assign(promo.href);
      }

      return;
    }

    push(promo.href as Route);
  }

  return (
    <aside className="rounded-[1.75rem] border border-sky-300/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(8,47,73,0.95))] p-5 text-left text-sky-50 shadow-[0_22px_70px_rgba(2,12,27,0.32)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {promo.label ? (
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/70">
              {promo.label}
            </p>
          ) : null}
          {promo.imageSrc ? (
            <div className="mt-3 inline-flex rounded-2xl border border-sky-200/15 bg-white/95 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
              <Image
                src={promo.imageSrc}
                alt=""
                width={96}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </div>
          ) : null}
          <h2 className="mt-2 text-2xl font-black tracking-tight text-balance text-white sm:text-3xl">
            {promo.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-sky-50/78 sm:text-base">
            {promo.body}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex min-h-15 items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-100/45 bg-[linear-gradient(180deg,#d9f0ff_0%,#8fd3ff_100%)] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.08em] text-sky-950 shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition-transform transition-colors hover:-translate-y-0.5 hover:border-sky-50/70 hover:bg-[linear-gradient(180deg,#e8f7ff_0%,#9bd8ff_100%)] active:translate-y-0.5 active:border-b-2 disabled:cursor-wait disabled:opacity-80"
          disabled={isSubmitting}
          onClick={() => {
            void onActivate();
          }}
        >
          <span>{promo.ctaLabel}</span>
          {isExternal ? (
            <ArrowUpRight className="size-4" strokeWidth={2.2} />
          ) : (
            <BadgeInfo className="size-4" strokeWidth={2.2} />
          )}
        </button>
      </div>

      {promo.disclaimer ? (
        <p className="mt-4 text-xs leading-5 text-sky-100/60">
          {promo.disclaimer}
        </p>
      ) : null}
    </aside>
  );
}
