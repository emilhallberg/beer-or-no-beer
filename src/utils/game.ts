"use server";

import { getActorId, isActorGuest } from "@/utils/actor";
import { Beer, Beers } from "@/utils/beer";
import { getLeaderboard } from "@/utils/leaderboard";
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/types";

const STARTING_LIVES = 3 as const;
const DEFAULT_DECK_SIZE = 100 as const;

type GameRow = Tables<"games">;
type PersistedGuessRow = Pick<
  Tables<"game_guesses">,
  | "beerId"
  | "correctAnswer"
  | "createdAt"
  | "guess"
  | "isCorrect"
  | "lifeDelta"
  | "pointsAwarded"
  | "streakAfterGuess"
  | "streakBeforeGuess"
>;

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

export type InProgressGameInput = Omit<
  CompletedGameInput,
  "endReason" | "endedAt"
>;

async function syncProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  profile: Pick<CompletedGameInput, "playerImageUrl" | "playerName">,
) {
  if (isActorGuest(actorId)) return true;

  const syncedProfile = await supabase.from("profiles").upsert(
    {
      id: actorId,
      displayName: profile.playerName,
      imageUrl: profile.playerImageUrl,
      updatedAt: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (syncedProfile.error) {
    console.error("Profile not synced", syncedProfile.error);
    return false;
  }

  return true;
}

export type PersistedGuessResult = {
  beer: Beer;
  correct: boolean;
  correctAnswer: boolean;
  createdAt: string;
  guess: boolean;
  lifeDelta: 0 | -1;
  pointsAwarded: number;
  streakAfterGuess: number;
  streakBeforeGuess: number;
};

export type PersistedGameState = {
  beer: Beer;
  beers: Beers;
  bestStreak: number;
  correctGuesses: number;
  endedAt: string | null;
  endReason: "abandoned" | "lives_exhausted" | null;
  gameOver: boolean;
  lives: number;
  result: PersistedGuessResult[];
  score: number;
  streak: number;
  totalGuesses: number;
};

export type CompletedGameSummary = {
  overallRank: number | null;
  stats: {
    accuracy: number;
    averageAbv: number | null;
    bestStreak: number;
    correctFakeGuesses: number;
    correctGuesses: number;
    correctRealGuesses: number;
    fakeBeers: number;
    livesRemaining: number;
    mostSeenBeerType: string | null;
    realBeers: number;
    totalGuesses: number;
    totalPointsAwarded: number;
    uniqueBreweries: number;
  };
  newHighScore: boolean;
  result: PersistedGuessResult[];
  score: number;
  totalRankedPlayers: number;
};

function shuffleIds(ids: number[]): number[] {
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function buildCompletedGameStats(
  result: PersistedGuessResult[],
  game: Pick<
    GameRow,
    "bestStreak" | "correctGuesses" | "livesRemaining" | "totalGuesses"
  >,
): CompletedGameSummary["stats"] {
  const typeCounts = new Map<string, number>();
  const breweryNames = new Set<string>();
  let realBeers = 0;
  let fakeBeers = 0;
  let correctRealGuesses = 0;
  let correctFakeGuesses = 0;
  let totalAbv = 0;

  for (const guess of result) {
    breweryNames.add(guess.beer.brewery);
    typeCounts.set(guess.beer.type, (typeCounts.get(guess.beer.type) ?? 0) + 1);
    totalAbv += guess.beer.abv;

    if (guess.beer.real) {
      realBeers += 1;

      if (guess.correct) {
        correctRealGuesses += 1;
      }

      continue;
    }

    fakeBeers += 1;

    if (guess.correct) {
      correctFakeGuesses += 1;
    }
  }

  const [mostSeenBeerType] = Array.from(typeCounts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0], "sv");
  });

  return {
    accuracy:
      game.totalGuesses === 0 ? 0 : game.correctGuesses / game.totalGuesses,
    averageAbv:
      result.length > 0 ? roundToSingleDecimal(totalAbv / result.length) : null,
    bestStreak: game.bestStreak,
    correctFakeGuesses,
    correctGuesses: game.correctGuesses,
    correctRealGuesses,
    fakeBeers,
    livesRemaining: game.livesRemaining,
    mostSeenBeerType: mostSeenBeerType?.[0] ?? null,
    realBeers,
    totalGuesses: game.totalGuesses,
    totalPointsAwarded: result.reduce(
      (total, guess) => total + guess.pointsAwarded,
      0,
    ),
    uniqueBreweries: breweryNames.size,
  };
}

async function fetchRandomBeerIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  excludeIds: number[] = [],
): Promise<number[]> {
  const half = DEFAULT_DECK_SIZE / 2;
  const exclusion = excludeIds.length > 0 ? `(${excludeIds.join(",")})` : null;

  let realQuery = supabase.from("random_beers").select("id").eq("real", true);
  let fakeQuery = supabase.from("random_beers").select("id").eq("real", false);

  if (exclusion) {
    realQuery = realQuery.not("id", "in", exclusion);
    fakeQuery = fakeQuery.not("id", "in", exclusion);
  }

  const [realBeers, fakeBeers] = await Promise.all([
    realQuery.limit(half),
    fakeQuery.limit(half),
  ]);

  if (realBeers.error) {
    console.error("Real beer deck not fetched", realBeers.error);
    throw new Error("Unable to create beer deck");
  }

  if (fakeBeers.error) {
    console.error("Fake beer deck not fetched", fakeBeers.error);
    throw new Error("Unable to create beer deck");
  }

  const ids = [
    ...realBeers.data.flatMap((b) => (b.id === null ? [] : [b.id])),
    ...fakeBeers.data.flatMap((b) => (b.id === null ? [] : [b.id])),
  ];

  return shuffleIds(ids);
}

async function getOrCreateBeerIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  game: Pick<GameRow, "beerIds" | "id">,
) {
  if (game.beerIds.length > 0) return game.beerIds;

  const beerIds = await fetchRandomBeerIds(supabase);
  const update = await supabase
    .from("games")
    .update({ beerIds })
    .eq("id", game.id);

  if (update.error) {
    console.error("Beer deck not persisted", update.error);
    throw new Error("Unable to persist beer deck");
  }

  return beerIds;
}

async function getBeersByIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  beerIds: number[],
): Promise<Beers> {
  if (beerIds.length === 0) return [];

  const beers = await supabase
    .from("beers")
    .select("id, name, brewery, abv, type, meta, description, real, createdAt")
    .in("id", beerIds);

  if (beers.error) {
    console.error("Deck beers not fetched", beers.error);
    throw new Error("Unable to fetch deck beers");
  }

  const byId = new Map(beers.data.map((beer) => [beer.id, beer]));

  return beerIds.flatMap((id) => {
    const beer = byId.get(id);
    return beer ? [beer] : [];
  });
}

async function getGameRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gameId: number,
  actorId: string,
) {
  const game = await supabase
    .from("games")
    .select(
      "id, userId, playerName, score, bestStreak, correctGuesses, totalGuesses, startingLives, livesRemaining, endedAt, endReason, createdAt, beerIds",
    )
    .eq("id", gameId)
    .eq("userId", actorId)
    .maybeSingle();

  if (game.error) {
    console.error("Game not fetched", game.error);
    return null;
  }

  return game.data;
}

async function getGameGuesses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gameId: number,
) {
  const guesses = await supabase
    .from("game_guesses")
    .select(
      "beerId, guess, correctAnswer, isCorrect, streakBeforeGuess, streakAfterGuess, pointsAwarded, lifeDelta, createdAt",
    )
    .eq("gameId", gameId)
    .order("createdAt", { ascending: true });

  if (guesses.error) {
    console.error("Game guesses not fetched", guesses.error);
    return [];
  }

  return guesses.data;
}

function buildGuessResults(
  guesses: PersistedGuessRow[],
  beers: Beers,
): PersistedGuessResult[] {
  const beerById = new Map(beers.map((beer) => [beer.id, beer]));

  return guesses.flatMap((guess) => {
    const beer = beerById.get(guess.beerId);

    if (!beer) return [];

    return [
      {
        beer,
        correct: guess.isCorrect,
        guess: guess.guess,
        correctAnswer: guess.correctAnswer,
        streakBeforeGuess: guess.streakBeforeGuess,
        streakAfterGuess: guess.streakAfterGuess,
        pointsAwarded: guess.pointsAwarded,
        lifeDelta: guess.lifeDelta as 0 | -1,
        createdAt: guess.createdAt,
      },
    ];
  });
}

async function persistGame(
  gameId: number,
  payload:
    | CompletedGameInput
    | (InProgressGameInput & {
        endedAt: string | null;
        endReason: "abandoned" | "lives_exhausted" | null;
      }),
) {
  const actorId = await getActorId();
  const supabase = await createClient();
  const profileSynced = await syncProfile(supabase, actorId, payload);

  if (!profileSynced) return null;

  const updatedGame = await supabase
    .from("games")
    .update({
      userId: actorId,
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
    console.error("Game not persisted", updatedGame.error);
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

  if (payload.guesses.length === 0) return updatedGame.data;

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

export async function createGame() {
  const actorId = await getActorId();
  const supabase = await createClient();
  const beerIds = await fetchRandomBeerIds(supabase);

  const createdGame = await supabase
    .from("games")
    .insert({
      userId: actorId,
      beerIds,
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

export async function getGameState(
  gameId: number,
): Promise<PersistedGameState | null> {
  const actorId = await getActorId();
  const supabase = await createClient();
  const game = await getGameRow(supabase, gameId, actorId);

  if (!game) return null;

  const [beerIds, guesses] = await Promise.all([
    getOrCreateBeerIds(supabase, game),
    getGameGuesses(supabase, game.id),
  ]);
  const beers = await getBeersByIds(supabase, beerIds);
  const result = buildGuessResults(guesses, beers);
  const beer = beers[result.length] ?? beers.at(-1);

  if (!beer) return null;

  return {
    beers,
    beer,
    bestStreak: game.bestStreak,
    correctGuesses: game.correctGuesses,
    endedAt: game.endedAt,
    endReason:
      game.endReason === "abandoned" || game.endReason === "lives_exhausted"
        ? game.endReason
        : null,
    gameOver: !!game.endedAt,
    lives: game.livesRemaining,
    result,
    score: game.score,
    streak: result.at(-1)?.streakAfterGuess ?? 0,
    totalGuesses: game.totalGuesses,
  };
}

export async function saveGameProgress(
  gameId: number,
  payload: InProgressGameInput,
) {
  return persistGame(gameId, {
    ...payload,
    endedAt: null,
    endReason: null,
  });
}

export async function completeGame(
  gameId: number,
  payload: CompletedGameInput,
) {
  return persistGame(gameId, payload);
}

export async function extendGameDeck(
  gameId: number,
  excludeIds: number[],
): Promise<Beers> {
  const supabase = await createClient();

  const newIds = await fetchRandomBeerIds(supabase, excludeIds);

  if (newIds.length === 0) return [];

  const gameRow = await supabase
    .from("games")
    .select("beerIds")
    .eq("id", gameId)
    .single();

  if (gameRow.error) {
    console.error("Game not found for deck extension", gameRow.error);
    return [];
  }

  const updatedBeerIds = [...(gameRow.data.beerIds ?? []), ...newIds];

  const update = await supabase
    .from("games")
    .update({ beerIds: updatedBeerIds })
    .eq("id", gameId);

  if (update.error) {
    console.error("Game deck not extended", update.error);
    return [];
  }

  return getBeersByIds(supabase, newIds);
}

export async function getCompletedGameSummary(
  gameId: number,
): Promise<CompletedGameSummary | null> {
  const actorId = await getActorId();
  const supabase = await createClient();
  const game = await getGameRow(supabase, gameId, actorId);

  if (!game?.endedAt) return null;

  const guesses = await getGameGuesses(supabase, game.id);
  const beers = await getBeersByIds(
    supabase,
    guesses.map((guess) => guess.beerId),
  );
  const result = buildGuessResults(guesses, beers);
  const previousBestPromise = supabase
    .from("games")
    .select("score")
    .eq("userId", actorId)
    .neq("id", game.id)
    .not("endedAt", "is", null)
    .order("score", { ascending: false })
    .order("endedAt", { ascending: false })
    .limit(1)
    .maybeSingle();
  const leaderboardPromise = isActorGuest(actorId)
    ? Promise.resolve([])
    : getLeaderboard();
  const [previousBest, leaderboard] = await Promise.all([
    previousBestPromise,
    leaderboardPromise,
  ]);

  if (previousBest.error) {
    console.error("Previous best score not fetched", previousBest.error);
  }

  const overallRank = leaderboard.findIndex(
    (entry) => entry.userId === actorId,
  );

  return {
    newHighScore:
      previousBest.data !== null ? previousBest.data.score < game.score : false,
    overallRank: overallRank >= 0 ? overallRank + 1 : null,
    result,
    score: game.score,
    stats: buildCompletedGameStats(result, game),
    totalRankedPlayers: leaderboard.length,
  };
}
