export const PROMO_PLACEMENTS = ["challenge", "summary"] as const;
export const PROMO_KINDS = ["affiliate", "internal", "sponsor"] as const;

export type PromoPlacement = (typeof PROMO_PLACEMENTS)[number];
export type PromoKind = (typeof PROMO_KINDS)[number];

export type Promo = {
  activeFrom: string | null;
  activeTo: string | null;
  body: string;
  createdAt: string;
  ctaLabel: string;
  disclaimer: string | null;
  href: string;
  id: string;
  imageSrc: string | null;
  isActive: boolean;
  kind: PromoKind;
  label: string | null;
  placement: PromoPlacement;
  sortOrder: number;
  title: string;
  updatedAt: string;
};

export function isPromoPlacement(value: string): value is PromoPlacement {
  return PROMO_PLACEMENTS.includes(value as PromoPlacement);
}

export function isPromoKind(value: string): value is PromoKind {
  return PROMO_KINDS.includes(value as PromoKind);
}
