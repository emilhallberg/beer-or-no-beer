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
  real: boolean;
  name: string;
  totalGuesses: number;
  type: string;
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

export type RankedBeerInsight = BeerRecognitionStat & {
  rank: number;
};

export type BreweryInsight = {
  accuracy: number;
  beerCount: number;
  name: string;
  topBeer: string | null;
  totalGuesses: number;
  weakestBeer: string | null;
};

export type AdminBeerInsights = {
  breweries: BreweryInsight[];
  fakeMostConvincing: RankedBeerInsight[];
  fakeMostTransparent: RankedBeerInsight[];
  realMostKnown: RankedBeerInsight[];
  realMostMissed: RankedBeerInsight[];
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
        type: beer.type,
        real: beer.real,
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

function buildRankedBeerInsights(
  stats: BeerRecognitionStat[],
  compare: (a: BeerRecognitionStat, b: BeerRecognitionStat) => number,
  limit = 100,
): RankedBeerInsight[] {
  return [...stats]
    .sort(compare)
    .slice(0, limit)
    .map((stat, index) => ({
      ...stat,
      rank: index + 1,
    }));
}

function buildBreweryInsights(stats: BeerRecognitionStat[], limit = 100) {
  const byBrewery = new Map<
    string,
    {
      beerCount: number;
      topBeer: BeerRecognitionStat | null;
      totalCorrectGuesses: number;
      totalGuesses: number;
      weakestBeer: BeerRecognitionStat | null;
    }
  >();

  for (const stat of stats) {
    const current = byBrewery.get(stat.brewery) ?? {
      beerCount: 0,
      topBeer: null,
      totalCorrectGuesses: 0,
      totalGuesses: 0,
      weakestBeer: null,
    };

    current.beerCount += 1;
    current.totalCorrectGuesses += stat.correctGuesses;
    current.totalGuesses += stat.totalGuesses;

    if (!current.topBeer || compareMostKnown(stat, current.topBeer) < 0) {
      current.topBeer = stat;
    }

    if (
      !current.weakestBeer ||
      compareMostUnknown(stat, current.weakestBeer) < 0
    ) {
      current.weakestBeer = stat;
    }

    byBrewery.set(stat.brewery, current);
  }

  return Array.from(byBrewery.entries())
    .map(([name, aggregate]) => ({
      name,
      beerCount: aggregate.beerCount,
      totalGuesses: aggregate.totalGuesses,
      accuracy:
        aggregate.totalGuesses === 0
          ? 0
          : aggregate.totalCorrectGuesses / aggregate.totalGuesses,
      topBeer: aggregate.topBeer?.name ?? null,
      weakestBeer: aggregate.weakestBeer?.name ?? null,
    }))
    .sort((a, b) => {
      if (b.totalGuesses !== a.totalGuesses) {
        return b.totalGuesses - a.totalGuesses;
      }

      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
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

export async function getAdminBeerInsights(): Promise<AdminBeerInsights> {
  const stats = await getBeerStatsPageData();
  const [supabase] = await Promise.all([createClient()]);
  const completedGames = await supabase
    .from("games")
    .select("id")
    .not("endedAt", "is", null);

  if (completedGames.error) {
    console.error(
      "Completed games not fetched for admin insights",
      completedGames.error,
    );
    return {
      realMostKnown: [],
      realMostMissed: [],
      fakeMostConvincing: [],
      fakeMostTransparent: [],
      breweries: [],
    };
  }

  const gameIds = completedGames.data.map((game) => game.id);

  if (gameIds.length === 0) {
    return {
      realMostKnown: [],
      realMostMissed: [],
      fakeMostConvincing: [],
      fakeMostTransparent: [],
      breweries: [],
    };
  }

  const guessesResult = await supabase
    .from("game_guesses")
    .select("beerId, gameId, isCorrect")
    .in("gameId", gameIds);

  if (guessesResult.error) {
    console.error(
      "Game guesses not fetched for admin insights",
      guessesResult.error,
    );
    return {
      realMostKnown: [],
      realMostMissed: [],
      fakeMostConvincing: [],
      fakeMostTransparent: [],
      breweries: [],
    };
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
    console.error(
      "Beer metadata not fetched for admin insights",
      beersResult.error,
    );
    return {
      realMostKnown: [],
      realMostMissed: [],
      fakeMostConvincing: [],
      fakeMostTransparent: [],
      breweries: [],
    };
  }

  const beers = (beersResult.data ?? []) as BeerRow[];
  const realBeers = beers.filter((beer) => beer.real);
  const fakeBeers = beers.filter((beer) => !beer.real);
  const realBeerIds = new Set(realBeers.map((beer) => beer.id));
  const fakeBeerIds = new Set(fakeBeers.map((beer) => beer.id));
  const realStats = buildRecognitionStats(
    guesses.filter((guess) => realBeerIds.has(guess.beerId)),
    realBeers,
  );
  const fakeStats = buildRecognitionStats(
    guesses.filter((guess) => fakeBeerIds.has(guess.beerId)),
    fakeBeers,
  );
  const allStats = [...realStats, ...fakeStats];

  void stats;

  return {
    realMostKnown: buildRankedBeerInsights(realStats, compareMostKnown),
    realMostMissed: buildRankedBeerInsights(realStats, compareMostUnknown),
    fakeMostConvincing: buildRankedBeerInsights(fakeStats, compareMostUnknown),
    fakeMostTransparent: buildRankedBeerInsights(fakeStats, compareMostKnown),
    breweries: buildBreweryInsights(allStats),
  };
}
