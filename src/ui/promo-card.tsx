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
    <aside className="surface pub-promo p-5 text-left text-gold-50">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {promo.label ? (
            <p className="text-xs font-semibold tracking-[0.04em] text-gold-200/70">
              {promo.label}
            </p>
          ) : null}
          {promo.imageSrc ? (
            <div className="mt-3 inline-flex rounded-2xl border border-gold-200/15 bg-white/95 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
              <Image
                src={promo.imageSrc}
                alt=""
                width={96}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </div>
          ) : null}
          <h2 className="mt-2 text-2xl font-black tracking-tight text-balance text-gold-50 sm:text-3xl">
            {promo.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-gold-50/78 sm:text-base">
            {promo.body}
          </p>
        </div>

        <button
          type="button"
          className="button-secondary"
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
        <p className="mt-4 text-xs leading-5 text-gold-100/60">
          {promo.disclaimer}
        </p>
      ) : null}
    </aside>
  );
}
