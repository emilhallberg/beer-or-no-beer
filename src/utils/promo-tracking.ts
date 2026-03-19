"use server";

import { getActorId } from "@/utils/actor";
import type { PromoKind, PromoPlacement } from "@/utils/promo-types";
import { createClient } from "@/utils/supabase/server";

type TrackPromoClickInput = {
  gameId?: number;
  href: string;
  kind: PromoKind;
  placement: PromoPlacement;
  promoId: string;
};

export async function trackPromoClick({
  gameId,
  href,
  kind,
  placement,
  promoId,
}: TrackPromoClickInput) {
  try {
    const [actorId, supabase] = await Promise.all([
      getActorId(),
      createClient(),
    ]);

    const result = await supabase.from("promo_clicks").insert({
      actorId,
      gameId: gameId ?? null,
      href,
      kind,
      placement,
      promoId,
    });

    if (result.error) {
      console.error("Promo click not tracked", result.error);
    }
  } catch (error) {
    console.error("Promo click tracking failed", error);
  }
}
