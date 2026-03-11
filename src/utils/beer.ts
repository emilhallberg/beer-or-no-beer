"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/types";

export type Beer = Tables<"beers">;
export type Beers = Beer[];

export async function getBeers() {
  const supabase = await createClient();
  const result = await supabase.from("random_beers").select().limit(100);

  if (result.error) {
    console.debug("Beers not fetched", result.error);
    return [];
  }

  return result.data.flatMap((beer) => {
    if (
      beer.id === null ||
      beer.name === null ||
      beer.description === null ||
      beer.real === null ||
      beer.createdAt === null
    ) {
      return [];
    }

    return [
      {
        id: beer.id,
        name: beer.name,
        description: beer.description,
        real: beer.real,
        createdAt: beer.createdAt,
      },
    ];
  });
}
