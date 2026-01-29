"use server";

import { createClient } from "@/utils/supabase/server";

export async function getBeers() {
  const supabase = await createClient();

  const result = await supabase.from("random_beers").select().limit(100);

  if (result.error) {
    console.debug("Beers not fetched", result.error);
    return [];
  }

  return result.data;
}

export type Beers = Awaited<ReturnType<typeof getBeers>>;
export type Beer = Beers[number];
