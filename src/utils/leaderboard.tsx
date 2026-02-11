"use server";

import { auth } from "@clerk/nextjs/server";

import { createClient } from "@/utils/supabase/server";

export type UserEntry = { userId: string; name: string; score: number };

export async function getLeaderboard() {
  const supabase = await createClient();
  const leaderboard = await supabase.from("leaderboard").select();

  if (leaderboard.error) {
    console.error("Leaderboard not fetched", leaderboard.error);
    return [];
  }

  const byUser = leaderboard.data.reduce<Map<string, UserEntry>>(
    (map, entry: UserEntry) => {
      const existing = map.get(entry.userId);
      if (!existing || entry.score > existing.score)
        map.set(entry.userId, entry);
      return map;
    },
    new Map(),
  );

  return Array.from(byUser.values()).sort((a, b) => b.score - a.score);
}

export async function getUserEntry(): Promise<UserEntry | null> {
  const { userId } = await auth();

  return getLeaderboard().then(
    (leaderboard) =>
      leaderboard.find((userEntry) => userEntry.userId === userId) ?? null,
  );
}

export async function updateLeaderboard(name: string, score: number) {
  const { userId } = await auth();

  if (!userId)
    throw new Error("Cannot update leaderboard without a logged in user");

  const supabase = await createClient();

  const payload = { userId, name, score };
  console.debug("Update leaderboard", payload);

  const updated = await supabase
    .from("leaderboard")
    .upsert(payload, { onConflict: "userId" });

  if (updated.error) {
    console.debug("Leaderboard not updated", updated.error);
    return null;
  }

  console.debug("Leaderboard updated", updated.data);

  return updated.data;
}

export type Leaderboard = Awaited<ReturnType<typeof getLeaderboard>>;
