"use server";

import { getActorId, isActorGuest } from "@/utils/actor";
import { createClient } from "@/utils/supabase/server";

type CompletedGameRow = {
  bestStreak: number;
  correctGuesses: number;
  endedAt: string | null;
  id: number;
  livesRemaining: number;
  playerName: string | null;
  score: number;
  totalGuesses: number;
  userId: string | null;
};

type ProfileRow = {
  displayName: string | null;
  id: string;
  imageUrl: string | null;
};

export type UserEntry = {
  accuracy: number;
  bestStreak: number;
  imageUrl: string | null;
  name: string;
  score: number;
  userId: string;
};

export type CompletedGameGuessInput = {
  beerId: number;
  correctAnswer: boolean;
  createdAt?: string;
  guess: boolean;
  isCorrect: boolean;
  lifeDelta: 0 | -1;
  pointsAwarded: number;
  streakAfterGuess: number;
  streakBeforeGuess: number;
};

export type CompletedGameInput = {
  bestStreak: number;
  correctGuesses: number;
  endReason: "abandoned" | "lives_exhausted";
  endedAt: string;
  guesses: CompletedGameGuessInput[];
  livesRemaining: number;
  playerImageUrl: string | null;
  playerName: string | null;
  score: number;
  startingLives: number;
  totalGuesses: number;
};

function normalizePlayerName(playerName: string | null) {
  const trimmedName = playerName?.trim();

  if (!trimmedName) return "Anonymous";

  if (/^anon(?:y|o)+m(?:o|u)+s$/i.test(trimmedName)) {
    return "Anonymous";
  }

  return trimmedName;
}

function toUserEntry(
  game: CompletedGameRow,
  profile?: ProfileRow,
): UserEntry | null {
  if (!game.userId || !game.endedAt) return null;

  return {
    userId: game.userId,
    name: normalizePlayerName(profile?.displayName ?? game.playerName),
    imageUrl: profile?.imageUrl ?? null,
    score: game.score,
    bestStreak: game.bestStreak,
    accuracy:
      game.totalGuesses === 0 ? 0 : game.correctGuesses / game.totalGuesses,
  };
}

async function getProfilesByIds(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, ProfileRow>();

  const supabase = await createClient();
  const profiles = await supabase
    .from("profiles")
    .select("id, displayName, imageUrl")
    .in("id", userIds);

  if (profiles.error) {
    console.error("Profiles not fetched", profiles.error);
    return new Map<string, ProfileRow>();
  }

  return new Map(profiles.data.map((profile) => [profile.id, profile]));
}

export async function getLeaderboard() {
  const supabase = await createClient();
  const games = await supabase
    .from("games")
    .select(
      "id, userId, playerName, score, bestStreak, correctGuesses, totalGuesses, livesRemaining, endedAt",
    )
    .not("endedAt", "is", null)
    .not("userId", "is", null)
    .not("userId", "like", "guest:%")
    .order("score", { ascending: false })
    .order("endedAt", { ascending: false });

  if (games.error) {
    console.error("Leaderboard not fetched", games.error);
    return [];
  }

  const profilesById = await getProfilesByIds(
    Array.from(
      new Set(games.data.flatMap((game) => (game.userId ? [game.userId] : []))),
    ),
  );

  const byUser = games.data.reduce<Map<string, UserEntry>>((map, game) => {
    const entry = toUserEntry(
      game,
      game.userId ? profilesById.get(game.userId) : undefined,
    );

    if (!entry) return map;
    if (!map.has(entry.userId)) map.set(entry.userId, entry);

    return map;
  }, new Map());

  return Array.from(byUser.values()).sort((a, b) => b.score - a.score);
}

export async function getUserEntry(): Promise<UserEntry | null> {
  const actorId = await getActorId();

  const supabase = await createClient();
  const bestGame = await supabase
    .from("games")
    .select(
      "id, userId, playerName, score, bestStreak, correctGuesses, totalGuesses, livesRemaining, endedAt",
    )
    .eq("userId", actorId)
    .not("endedAt", "is", null)
    .order("score", { ascending: false })
    .order("endedAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (bestGame.error) {
    console.error("User entry not fetched", bestGame.error);
    return null;
  }

  const profilesById = await getProfilesByIds([actorId]);
  const entry = bestGame.data
    ? toUserEntry(bestGame.data, profilesById.get(actorId))
    : null;

  if (!entry) return null;

  return isActorGuest(actorId) ? { ...entry, userId: actorId } : entry;
}

export type Leaderboard = Awaited<ReturnType<typeof getLeaderboard>>;
