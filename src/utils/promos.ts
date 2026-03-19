"use server";

import {
  isPromoKind,
  isPromoPlacement,
  Promo,
  PromoPlacement,
} from "@/utils/promo-types";
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/types";

type PromoRow = Tables<"promos">;
type PromoClickRow = Pick<Tables<"promo_clicks">, "createdAt" | "promoId">;

export type PromoAdminPageData = {
  promos: Array<
    Promo & {
      clicks: number;
      lastClickAt: string | null;
    }
  >;
  summary: {
    activePromos: number;
    lastClickAt: string | null;
    totalClicks: number;
  };
};

function isActiveDate(
  value: string | null,
  now: number,
  direction: "from" | "to",
) {
  if (!value) return true;

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) return false;

  return direction === "from" ? timestamp <= now : timestamp >= now;
}

function toPromo(row: PromoRow): Promo | null {
  if (!isPromoKind(row.kind) || !isPromoPlacement(row.placement)) {
    return null;
  }

  return {
    activeFrom: row.activeFrom,
    activeTo: row.activeTo,
    body: row.body,
    createdAt: row.createdAt,
    ctaLabel: row.ctaLabel,
    disclaimer: row.disclaimer,
    href: row.href,
    id: row.id,
    imageSrc: row.imageSrc,
    isActive: row.isActive,
    kind: row.kind,
    label: row.label,
    placement: row.placement,
    sortOrder: row.sortOrder,
    title: row.title,
    updatedAt: row.updatedAt,
  };
}

async function getPromos() {
  const supabase = await createClient();
  const result = await supabase
    .from("promos")
    .select(
      "id, title, body, ctaLabel, href, kind, placement, label, disclaimer, imageSrc, sortOrder, isActive, activeFrom, activeTo, createdAt, updatedAt",
    )
    .order("placement", { ascending: true })
    .order("sortOrder", { ascending: true })
    .order("createdAt", { ascending: false });

  if (result.error) {
    console.error("Promos not fetched", result.error);
    return [];
  }

  return result.data.flatMap((row) => {
    const promo = toPromo(row);
    return promo ? [promo] : [];
  });
}

export async function getActivePromoForPlacement(
  placement: PromoPlacement,
): Promise<Promo | null> {
  const promos = await getPromos();
  const now = Date.now();

  return (
    promos.find((promo) => {
      if (promo.placement !== placement || !promo.isActive) return false;

      return (
        isActiveDate(promo.activeFrom, now, "from") &&
        isActiveDate(promo.activeTo, now, "to")
      );
    }) ?? null
  );
}

export async function getPromoAdminPageData(): Promise<PromoAdminPageData> {
  const [promos, clickResult] = await Promise.all([
    getPromos(),
    createClient().then((supabase) =>
      supabase
        .from("promo_clicks")
        .select("promoId, createdAt")
        .order("createdAt", { ascending: false }),
    ),
  ]);

  const clicks = clickResult.error ? [] : clickResult.data;

  if (clickResult.error) {
    console.error("Promo clicks not fetched", clickResult.error);
  }

  const clickStats = clicks.reduce<
    Map<string, { count: number; lastClickAt: string | null }>
  >((map, click: PromoClickRow) => {
    const current = map.get(click.promoId) ?? {
      count: 0,
      lastClickAt: null,
    };

    current.count += 1;
    current.lastClickAt ??= click.createdAt;
    map.set(click.promoId, current);

    return map;
  }, new Map());

  return {
    promos: promos.map((promo) => {
      const stats = clickStats.get(promo.id);

      return {
        ...promo,
        clicks: stats?.count ?? 0,
        lastClickAt: stats?.lastClickAt ?? null,
      };
    }),
    summary: {
      activePromos: promos.filter((promo) => promo.isActive).length,
      totalClicks: clicks.length,
      lastClickAt: clicks[0]?.createdAt ?? null,
    },
  };
}
