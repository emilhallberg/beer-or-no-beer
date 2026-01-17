"use server";

import BEERS from "@/assets/beers.json";

export default async function getBeers() {
  return BEERS.sort(() => Math.random() - 0.5);
}

export type Beers = Awaited<ReturnType<typeof getBeers>>;
export type Beer = Beers[number];
