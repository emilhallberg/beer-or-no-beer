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

  // Deduplicate by userId in case historical duplicates exist
  const byUser = leaderboard.data.reduce<Map<string, UserEntry>>(
    (map, row: any) => {
      const entry = row as UserEntry;
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
  console.debug("Update leaderboard (upsert by userId)", payload);

  // Try UPDATE first to avoid accidental duplicate INSERTs if unique constraints are missing
  const updated = await supabase
    .from("leaderboard")
    .update({ name, score })
    .eq("userId", userId)
    .select();

  if (updated.error) {
    console.error("Leaderboard update failed", updated.error);
  }

  if (updated.data && updated.data.length > 0) {
    console.debug("Leaderboard updated", updated.data);
    return updated.data;
  }

  // No existing row, INSERT new
  const inserted = await supabase.from("leaderboard").insert(payload).select();

  if (inserted.error) {
    console.error("Leaderboard insert failed", inserted.error);
    return null;
  }

  console.debug("Leaderboard inserted", inserted.data);
  return inserted.data;
}

export type Leaderboard = Awaited<ReturnType<typeof getLeaderboard>>;
