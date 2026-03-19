"use server";

import { GUEST_PREFIX } from "@/utils/actor";
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/types";

type UserInsightGame = Pick<
  Tables<"games">,
  "createdAt" | "endedAt" | "score" | "totalGuesses" | "userId"
>;

type UserInsightProfile = Pick<
  Tables<"profiles">,
  "createdAt" | "displayName" | "id" | "imageUrl"
>;

export type AdminUserRow = {
  bestScore: number;
  completedGames: number;
  displayName: string | null;
  firstPlayedAt: string | null;
  gamesPlayed: number;
  imageUrl: string | null;
  lastPlayedAt: string | null;
  totalGuesses: number;
  type: "guest" | "signed_in";
  userId: string;
};

export type AdminUserInsights = {
  overview: {
    activeUsersLast30Days: number;
    activeUsersLast7Days: number;
    averageGamesPerSignedInPlayer: number;
    completedGames: number;
    guestActors: number;
    guestGames: number;
    oneGamePlayers: number;
    repeatPlayers: number;
    signedInGames: number;
    signedInUsersWithGames: number;
    totalGames: number;
    totalProfiles: number;
  };
  recentUsers: AdminUserRow[];
};

function isGuestActor(
  userId: string | null,
): userId is `${typeof GUEST_PREFIX}${string}` {
  return typeof userId === "string" && userId.startsWith(GUEST_PREFIX);
}

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export async function getAdminUserInsights(): Promise<AdminUserInsights> {
  const supabase = await createClient();
  const [gamesResult, profilesResult] = await Promise.all([
    supabase
      .from("games")
      .select("userId, createdAt, endedAt, score, totalGuesses")
      .order("createdAt", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, displayName, imageUrl, createdAt")
      .order("createdAt", { ascending: false }),
  ]);

  if (gamesResult.error) {
    console.error(
      "Games not fetched for admin user insights",
      gamesResult.error,
    );
  }

  if (profilesResult.error) {
    console.error(
      "Profiles not fetched for admin user insights",
      profilesResult.error,
    );
  }

  const games = (gamesResult.data ?? []) as UserInsightGame[];
  const profiles = (profilesResult.data ?? []) as UserInsightProfile[];
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const profilesById = new Map(
    profiles.map((profile) => [profile.id, profile]),
  );
  const byUser = new Map<
    string,
    {
      bestScore: number;
      completedGames: number;
      firstPlayedAt: string | null;
      gamesPlayed: number;
      lastPlayedAt: string | null;
      totalGuesses: number;
      type: "guest" | "signed_in";
    }
  >();

  let completedGames = 0;
  let guestGames = 0;
  let signedInGames = 0;

  for (const game of games) {
    if (!game.userId) continue;

    const type = isGuestActor(game.userId) ? "guest" : "signed_in";
    const activityAt = game.endedAt ?? game.createdAt;
    const current = byUser.get(game.userId) ?? {
      bestScore: 0,
      completedGames: 0,
      firstPlayedAt: activityAt,
      gamesPlayed: 0,
      lastPlayedAt: activityAt,
      totalGuesses: 0,
      type,
    };

    current.gamesPlayed += 1;
    current.totalGuesses += game.totalGuesses;
    current.bestScore = Math.max(current.bestScore, game.score);

    if (game.endedAt) {
      current.completedGames += 1;
      completedGames += 1;
    }

    if (type === "guest") {
      guestGames += 1;
    } else {
      signedInGames += 1;
    }

    if (!current.firstPlayedAt || activityAt < current.firstPlayedAt) {
      current.firstPlayedAt = activityAt;
    }

    if (!current.lastPlayedAt || activityAt > current.lastPlayedAt) {
      current.lastPlayedAt = activityAt;
    }

    byUser.set(game.userId, current);
  }

  const rows = Array.from(byUser.entries()).map(([userId, aggregate]) => {
    const profile = profilesById.get(userId);

    return {
      userId,
      type: aggregate.type,
      displayName: profile?.displayName ?? null,
      imageUrl: profile?.imageUrl ?? null,
      gamesPlayed: aggregate.gamesPlayed,
      completedGames: aggregate.completedGames,
      bestScore: aggregate.bestScore,
      totalGuesses: aggregate.totalGuesses,
      firstPlayedAt: aggregate.firstPlayedAt,
      lastPlayedAt: aggregate.lastPlayedAt,
    } satisfies AdminUserRow;
  });

  const signedInRows = rows.filter((row) => row.type === "signed_in");
  const guestRows = rows.filter((row) => row.type === "guest");
  const activeUsersLast7Days = signedInRows.filter((row) => {
    if (!row.lastPlayedAt) return false;
    return new Date(row.lastPlayedAt).getTime() >= sevenDaysAgo;
  }).length;
  const activeUsersLast30Days = signedInRows.filter((row) => {
    if (!row.lastPlayedAt) return false;
    return new Date(row.lastPlayedAt).getTime() >= thirtyDaysAgo;
  }).length;

  return {
    overview: {
      totalProfiles: profiles.length,
      signedInUsersWithGames: signedInRows.length,
      guestActors: guestRows.length,
      totalGames: games.length,
      completedGames,
      signedInGames,
      guestGames,
      activeUsersLast7Days,
      activeUsersLast30Days,
      oneGamePlayers: signedInRows.filter((row) => row.gamesPlayed === 1)
        .length,
      repeatPlayers: signedInRows.filter((row) => row.gamesPlayed > 1).length,
      averageGamesPerSignedInPlayer:
        signedInRows.length === 0
          ? 0
          : roundToSingleDecimal(signedInGames / signedInRows.length),
    },
    recentUsers: rows.sort((a, b) => {
      const left = a.lastPlayedAt ?? "";
      const right = b.lastPlayedAt ?? "";

      if (right !== left) return right.localeCompare(left);
      if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
      return a.userId.localeCompare(b.userId);
    }),
  };
}
