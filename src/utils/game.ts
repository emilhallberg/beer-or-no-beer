"use server";

import { auth } from "@clerk/nextjs/server";

import { createClient } from "@/utils/supabase/server";

const STARTING_LIVES = 3 as const;

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

export async function createGame() {
  const { userId } = await auth();
  const supabase = await createClient();

  const createdGame = await supabase
    .from("games")
    .insert({
      userId,
      score: 0,
      bestStreak: 0,
      correctGuesses: 0,
      totalGuesses: 0,
      startingLives: STARTING_LIVES,
      livesRemaining: STARTING_LIVES,
    })
    .select("id")
    .single();

  if (createdGame.error) {
    console.error("Game not created", createdGame.error);
    throw new Error("Unable to create game");
  }

  return createdGame.data.id;
}

export async function completeGame(
  gameId: number,
  payload: CompletedGameInput,
) {
  const { userId } = await auth();
  const supabase = await createClient();

  const updatedGame = await supabase
    .from("games")
    .update({
      userId,
      playerName: payload.playerName,
      score: payload.score,
      bestStreak: payload.bestStreak,
      correctGuesses: payload.correctGuesses,
      totalGuesses: payload.totalGuesses,
      startingLives: payload.startingLives,
      livesRemaining: payload.livesRemaining,
      endedAt: payload.endedAt,
      endReason: payload.endReason,
    })
    .eq("id", gameId)
    .select("id")
    .single();

  if (updatedGame.error) {
    console.error("Game not completed", updatedGame.error);
    return null;
  }

  const deletedGuesses = await supabase
    .from("game_guesses")
    .delete()
    .eq("gameId", gameId);

  if (deletedGuesses.error) {
    console.error("Existing guesses not cleared", deletedGuesses.error);
    return null;
  }

  const guessesInsert = await supabase.from("game_guesses").insert(
    payload.guesses.map((guess) => ({
      gameId,
      beerId: guess.beerId,
      guess: guess.guess,
      correctAnswer: guess.correctAnswer,
      isCorrect: guess.isCorrect,
      streakBeforeGuess: guess.streakBeforeGuess,
      streakAfterGuess: guess.streakAfterGuess,
      pointsAwarded: guess.pointsAwarded,
      lifeDelta: guess.lifeDelta,
      createdAt: guess.createdAt,
    })),
  );

  if (guessesInsert.error) {
    console.error("Game guesses not saved", guessesInsert.error);
    return null;
  }

  return updatedGame.data;
}
