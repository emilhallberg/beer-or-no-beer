"use server";

import { auth } from "@clerk/nextjs/server";

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

export type UserEntry = {
  accuracy: number;
  bestStreak: number;
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
  playerName: string | null;
  score: number;
  startingLives: number;
  totalGuesses: number;
};

function toUserEntry(game: CompletedGameRow): UserEntry | null {
  if (!game.userId || !game.endedAt) return null;

  return {
    userId: game.userId,
    name: game.playerName ?? "Anonymous",
    score: game.score,
    bestStreak: game.bestStreak,
    accuracy:
      game.totalGuesses === 0 ? 0 : game.correctGuesses / game.totalGuesses,
  };
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
    .order("score", { ascending: false })
    .order("endedAt", { ascending: false });

  if (games.error) {
    console.error("Leaderboard not fetched", games.error);
    return [];
  }

  const byUser = games.data.reduce<Map<string, UserEntry>>((map, game) => {
    const entry = toUserEntry(game);

    if (!entry) return map;
    if (!map.has(entry.userId)) map.set(entry.userId, entry);

    return map;
  }, new Map());

  return Array.from(byUser.values()).sort((a, b) => b.score - a.score);
}

export async function getUserEntry(): Promise<UserEntry | null> {
  const { userId } = await auth();

  if (!userId) return null;

  const supabase = await createClient();
  const bestGame = await supabase
    .from("games")
    .select(
      "id, userId, playerName, score, bestStreak, correctGuesses, totalGuesses, livesRemaining, endedAt",
    )
    .eq("userId", userId)
    .not("endedAt", "is", null)
    .order("score", { ascending: false })
    .order("endedAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (bestGame.error) {
    console.error("User entry not fetched", bestGame.error);
    return null;
  }

  return bestGame.data ? toUserEntry(bestGame.data) : null;
}

export type Leaderboard = Awaited<ReturnType<typeof getLeaderboard>>;
