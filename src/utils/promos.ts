export type PromoPlacement = "challenge" | "summary";
export type PromoKind = "affiliate" | "internal" | "sponsor";

export type PromoConfig = {
  activeFrom?: string;
  activeTo?: string;
  body: string;
  ctaLabel: string;
  disclaimer?: string;
  href: string;
  id: string;
  imageSrc?: string;
  kind: PromoKind;
  label?: string;
  placement: PromoPlacement;
  title: string;
};

const promos: PromoConfig[] = [
  {
    id: "challenge-leaderboard",
    placement: "challenge",
    kind: "internal",
    label: "Utvalt",
    title: "Topplistan väntar",
    body: "Skapa en profil och se hur långt dina ölkunskaper kan ta dig när poängen faktiskt räknas.",
    ctaLabel: "Se startsidan",
    href: "/",
  },
  {
    id: "summary-stats",
    placement: "summary",
    kind: "internal",
    label: "Fortsätt",
    title: "Djupdyk i din ölstatistik",
    body: "Öppna statistikläget och se vilka bryggerier, stilar och rundor som definierar ditt spel.",
    ctaLabel: "Öppna statistik",
    href: "/stats",
  },
];

function isActiveDate(
  value: string | undefined,
  now: number,
  direction: "from" | "to",
) {
  if (!value) return true;

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) return false;

  return direction === "from" ? timestamp <= now : timestamp >= now;
}

export function getActivePromoForPlacement(
  placement: PromoPlacement,
): PromoConfig | null {
  const now = Date.now();

  return (
    promos.find((promo) => {
      if (promo.placement !== placement) return false;

      return (
        isActiveDate(promo.activeFrom, now, "from") &&
        isActiveDate(promo.activeTo, now, "to")
      );
    }) ?? null
  );
}
