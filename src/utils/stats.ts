"use server";

import { getActorId } from "@/utils/actor";
import { createClient } from "@/utils/supabase/server";

type CompletedGame = {
  id: number;
  userId: string | null;
};

type GuessRow = {
  beerId: number;
  gameId: number;
  isCorrect: boolean;
};

type BeerRow = {
  abv: number;
  brewery: string;
  id: number;
  name: string;
  real: boolean;
  type: string;
};

type BeerRecognitionStat = {
  accuracy: number;
  brewery: string;
  correctGuesses: number;
  incorrectGuesses: number;
  name: string;
  totalGuesses: number;
};

type BeerRecognitionPair = {
  mostKnownBeer: BeerRecognitionStat | null;
  mostUnknownBeer: BeerRecognitionStat | null;
};

type AverageAbvStat = {
  fake: number | null;
  overall: number;
  real: number | null;
};

type LoyalBreweryStat = {
  fakeGuesses: number;
  name: string;
  realGuesses: number;
  totalGuesses: number;
};

export type BeerStatsPageData = {
  overall: {
    fake: BeerRecognitionPair;
    real: BeerRecognitionPair;
    totalCompletedGames: number;
    totalGuesses: number;
  };
  user: {
    averageAbv: AverageAbvStat | null;
    mostLoyalBrewery: LoyalBreweryStat | null;
    totalGuesses: number;
  };
};

function compareMostKnown(a: BeerRecognitionStat, b: BeerRecognitionStat) {
  if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
  if (b.totalGuesses !== a.totalGuesses) return b.totalGuesses - a.totalGuesses;
  return a.name.localeCompare(b.name);
}

function compareMostUnknown(a: BeerRecognitionStat, b: BeerRecognitionStat) {
  if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
  if (b.totalGuesses !== a.totalGuesses) return b.totalGuesses - a.totalGuesses;
  return a.name.localeCompare(b.name);
}

function buildRecognitionStats(guesses: GuessRow[], beers: BeerRow[]) {
  if (guesses.length === 0 || beers.length === 0) return [];

  const beersById = new Map(beers.map((beer) => [beer.id, beer]));
  const aggregates = new Map<
    number,
    {
      correctGuesses: number;
      totalGuesses: number;
    }
  >();

  for (const guess of guesses) {
    const beer = beersById.get(guess.beerId);

    if (!beer) continue;

    const current = aggregates.get(guess.beerId) ?? {
      totalGuesses: 0,
      correctGuesses: 0,
    };

    current.totalGuesses += 1;

    if (guess.isCorrect) {
      current.correctGuesses += 1;
    }

    aggregates.set(guess.beerId, current);
  }

  return Array.from(aggregates.entries()).flatMap(([beerId, aggregate]) => {
    const beer = beersById.get(beerId);

    if (!beer) return [];

    const incorrectGuesses = aggregate.totalGuesses - aggregate.correctGuesses;

    return [
      {
        name: beer.name,
        brewery: beer.brewery,
        totalGuesses: aggregate.totalGuesses,
        correctGuesses: aggregate.correctGuesses,
        incorrectGuesses,
        accuracy: aggregate.correctGuesses / aggregate.totalGuesses,
      },
    ];
  });
}

function pickRecognitionPair(
  stats: BeerRecognitionStat[],
): BeerRecognitionPair {
  return {
    mostKnownBeer: [...stats].sort(compareMostKnown)[0] ?? null,
    mostUnknownBeer: [...stats].sort(compareMostUnknown)[0] ?? null,
  };
}

function roundAbv(value: number) {
  return Math.round(value * 10) / 10;
}

function buildAverageAbvStat(guesses: GuessRow[], beers: BeerRow[]) {
  if (guesses.length === 0 || beers.length === 0) return null;

  const beersById = new Map(beers.map((beer) => [beer.id, beer]));
  let totalAbv = 0;
  let totalCount = 0;
  let realAbv = 0;
  let realCount = 0;
  let fakeAbv = 0;
  let fakeCount = 0;

  for (const guess of guesses) {
    const beer = beersById.get(guess.beerId);

    if (!beer) continue;

    totalAbv += beer.abv;
    totalCount += 1;

    if (beer.real) {
      realAbv += beer.abv;
      realCount += 1;
      continue;
    }

    fakeAbv += beer.abv;
    fakeCount += 1;
  }

  if (totalCount === 0) return null;

  return {
    overall: roundAbv(totalAbv / totalCount),
    real: realCount > 0 ? roundAbv(realAbv / realCount) : null,
    fake: fakeCount > 0 ? roundAbv(fakeAbv / fakeCount) : null,
  };
}

function buildMostLoyalBreweryStat(guesses: GuessRow[], beers: BeerRow[]) {
  if (guesses.length === 0 || beers.length === 0) return null;

  const beersById = new Map(beers.map((beer) => [beer.id, beer]));
  const breweryCounts = new Map<
    string,
    {
      fakeGuesses: number;
      realGuesses: number;
      totalGuesses: number;
    }
  >();

  for (const guess of guesses) {
    const beer = beersById.get(guess.beerId);

    if (!beer) continue;

    const current = breweryCounts.get(beer.brewery) ?? {
      totalGuesses: 0,
      realGuesses: 0,
      fakeGuesses: 0,
    };

    current.totalGuesses += 1;

    if (beer.real) {
      current.realGuesses += 1;
    } else {
      current.fakeGuesses += 1;
    }

    breweryCounts.set(beer.brewery, current);
  }

  const [winner] = Array.from(breweryCounts.entries()).sort((a, b) => {
    if (b[1].totalGuesses !== a[1].totalGuesses) {
      return b[1].totalGuesses - a[1].totalGuesses;
    }

    if (b[1].realGuesses !== a[1].realGuesses) {
      return b[1].realGuesses - a[1].realGuesses;
    }

    return a[0].localeCompare(b[0]);
  });

  if (!winner) return null;

  return {
    name: winner[0],
    totalGuesses: winner[1].totalGuesses,
    realGuesses: winner[1].realGuesses,
    fakeGuesses: winner[1].fakeGuesses,
  };
}

function emptyStats(
  totalCompletedGames = 0,
  totalGuesses = 0,
): BeerStatsPageData {
  return {
    user: {
      mostLoyalBrewery: null,
      averageAbv: null,
      totalGuesses: 0,
    },
    overall: {
      real: {
        mostKnownBeer: null,
        mostUnknownBeer: null,
      },
      fake: {
        mostKnownBeer: null,
        mostUnknownBeer: null,
      },
      totalCompletedGames,
      totalGuesses,
    },
  };
}

export async function getBeerStatsPageData(): Promise<BeerStatsPageData> {
  const [supabase, actorId] = await Promise.all([createClient(), getActorId()]);
  const completedGames = await supabase
    .from("games")
    .select("id, userId")
    .not("endedAt", "is", null);

  if (completedGames.error) {
    console.error("Completed games not fetched", completedGames.error);
    return emptyStats();
  }

  const games = completedGames.data as CompletedGame[];

  if (games.length === 0) {
    return emptyStats();
  }

  const gameIds = games.map((game) => game.id);
  const guessesResult = await supabase
    .from("game_guesses")
    .select("beerId, gameId, isCorrect")
    .in("gameId", gameIds);

  if (guessesResult.error) {
    console.error("Game guesses not fetched", guessesResult.error);
    return emptyStats(games.length);
  }

  const guesses = guessesResult.data as GuessRow[];
  const beerIds = Array.from(new Set(guesses.map((guess) => guess.beerId)));
  const beersResult =
    beerIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from("beers")
          .select("id, name, brewery, abv, real, type")
          .in("id", beerIds);

  if (beersResult.error) {
    console.error("Beer metadata not fetched", beersResult.error);
    return emptyStats(games.length, guesses.length);
  }

  const beers = (beersResult.data ?? []) as BeerRow[];
  const realBeers = beers.filter((beer) => beer.real);
  const fakeBeers = beers.filter((beer) => !beer.real);
  const realBeerIds = new Set(realBeers.map((beer) => beer.id));
  const fakeBeerIds = new Set(fakeBeers.map((beer) => beer.id));
  const realGuesses = guesses.filter((guess) => realBeerIds.has(guess.beerId));
  const fakeGuesses = guesses.filter((guess) => fakeBeerIds.has(guess.beerId));
  const userGameIds = new Set(
    games.filter((game) => game.userId === actorId).map((game) => game.id),
  );
  const userGuesses = guesses.filter((guess) => userGameIds.has(guess.gameId));

  return {
    user: {
      mostLoyalBrewery: buildMostLoyalBreweryStat(userGuesses, beers),
      averageAbv: buildAverageAbvStat(userGuesses, beers),
      totalGuesses: userGuesses.length,
    },
    overall: {
      real: pickRecognitionPair(buildRecognitionStats(realGuesses, realBeers)),
      fake: pickRecognitionPair(buildRecognitionStats(fakeGuesses, fakeBeers)),
      totalCompletedGames: games.length,
      totalGuesses: guesses.length,
    },
  };
}
