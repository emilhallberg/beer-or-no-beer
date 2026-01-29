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

  return leaderboard.data.sort((a, b) => b.score - a.score);
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

  const blob = { userId, name, score };
  console.debug("Update leaderboard", blob);
  const result = await supabase.from("leaderboard").upsert(blob);

  if (result.error) {
    console.error("Leaderboard not updated", result.error);
    return null;
  }

  console.debug("Leaderboard updated", result.data);
  return result.data;
}

export type Leaderboard = Awaited<ReturnType<typeof getLeaderboard>>;
