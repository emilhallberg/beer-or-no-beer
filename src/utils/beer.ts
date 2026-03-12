"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/types";

export type Beer = Tables<"beers">;
export type Beers = Beer[];

export async function getBeerCount() {
  const supabase = await createClient();
  const result = await supabase
    .from("beers")
    .select("id", { count: "exact", head: true });

  if (result.error) {
    console.debug("Beer count not fetched", result.error);
    return 0;
  }

  return result.count ?? 0;
}

export async function getBeers() {
  const supabase = await createClient();
  const result = await supabase.from("random_beers").select().limit(100);

  if (result.error) {
    console.debug("Beers not fetched", result.error);
    return [];
  }

  return result.data.flatMap((beer) => {
    if (
      beer.abv === null ||
      beer.brewery === null ||
      beer.id === null ||
      beer.meta === null ||
      beer.name === null ||
      beer.description === null ||
      beer.real === null ||
      beer.type === null ||
      beer.createdAt === null
    ) {
      return [];
    }

    return [
      {
        abv: beer.abv,
        brewery: beer.brewery,
        id: beer.id,
        meta: beer.meta,
        name: beer.name,
        description: beer.description,
        real: beer.real,
        type: beer.type,
        createdAt: beer.createdAt,
      },
    ];
  });
}
