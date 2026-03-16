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

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function getBeers() {
  const supabase = await createClient();

  const [realResult, fakeResult] = await Promise.all([
    supabase.from("random_beers").select().eq("real", true).limit(50),
    supabase.from("random_beers").select().eq("real", false).limit(50),
  ]);

  if (realResult.error) {
    console.debug("Real beers not fetched", realResult.error);
    return [];
  }

  if (fakeResult.error) {
    console.debug("Fake beers not fetched", fakeResult.error);
    return [];
  }

  const result = shuffle([...realResult.data, ...fakeResult.data]);

  return result.flatMap((beer) => {
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
