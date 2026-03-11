"use client";

import {
  createContext,
  ReactNode,
  use,
  useEffect,
  useReducer,
  useSyncExternalStore,
} from "react";
import { useUser } from "@clerk/nextjs";

import { useRouter } from "next/navigation";

import { Beer, Beers } from "@/utils/beer";
import { completeGame, createGame } from "@/utils/game";
import { UserEntry } from "@/utils/leaderboard";

export const BEER_STORAGE_KEY = "beer-storage" as const;
const STARTING_LIVES = 3 as const;

export function getBeerStorageKey(gameId: string) {
  return `${BEER_STORAGE_KEY}:${gameId}`;
}

type GuessResult = {
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

type State = {
  beer: Beer;
  beers: Beers;
  bestStreak: number;
  correctGuesses: number;
  endedAt: string | null;
  endReason: "abandoned" | "lives_exhausted" | null;
  gameOver: boolean;
  isSavingGame: boolean;
  lives: number;
  newHighScore: boolean;
  result: GuessResult[];
  savedGameId: number | null;
  saveStatus: "error" | "idle" | "saved" | "saving";
  score: number;
  showHint: boolean;
  streak: number;
  totalGuesses: number;
  userEntry: UserEntry | null;
};

type Game = State & {
  onBeer: (guess: boolean) => void;
  reset: () => void;
};

const GameContext = createContext<Game | undefined>(undefined);

type Action =
  | { type: "GUESS"; payload: boolean }
  | { type: "HINT"; payload: boolean }
  | { type: "INIT"; payload: State }
  | { type: "SAVE_ERROR" }
  | { type: "SAVE_PENDING" }
  | { type: "SAVE_SUCCESS"; payload: number };

const initialBeer = {
  id: 0,
  name: "",
  real: true,
  description: "",
  createdAt: "",
} satisfies Beer;

const initialState: State = {
  beers: [initialBeer],
  beer: initialBeer,
  bestStreak: 0,
  correctGuesses: 0,
  endedAt: null,
  endReason: null,
  gameOver: false,
  isSavingGame: false,
  lives: STARTING_LIVES,
  newHighScore: false,
  result: [],
  savedGameId: null,
  saveStatus: "idle",
  score: 0,
  showHint: false,
  streak: 0,
  totalGuesses: 0,
  userEntry: null,
};

function ensureBeers(beers: Beers): Beers {
  return beers.length > 0 ? beers : [initialBeer];
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "GUESS": {
      const currentBeerIndex = state.beers.indexOf(state.beer);
      const nextBeer = state.beers[currentBeerIndex + 1] ?? state.beer;
      const correct = state.beer.real === action.payload;
      const streakBeforeGuess = state.streak;
      const streakAfterGuess = correct ? streakBeforeGuess + 1 : 0;
      const pointsAwarded = correct ? 100 + streakAfterGuess : 0;
      const lives = state.lives - (correct ? 0 : 1);
      const gameOver = lives === 0;
      const createdAt = new Date().toISOString();
      const nextScore = state.score + pointsAwarded;

      const nextState: State = {
        ...state,
        score: nextScore,
        lives,
        streak: streakAfterGuess,
        bestStreak: Math.max(state.bestStreak, streakAfterGuess),
        totalGuesses: state.totalGuesses + 1,
        correctGuesses: state.correctGuesses + (correct ? 1 : 0),
        beer: gameOver ? state.beer : nextBeer,
        result: [
          ...state.result,
          {
            beer: state.beer,
            correct,
            guess: action.payload,
            correctAnswer: state.beer.real,
            streakBeforeGuess,
            streakAfterGuess,
            pointsAwarded,
            lifeDelta: correct ? 0 : -1,
            createdAt,
          },
        ],
        gameOver,
        endedAt: gameOver ? createdAt : null,
        endReason: gameOver ? "lives_exhausted" : null,
        showHint: false,
        newHighScore: !!state.userEntry && state.userEntry.score < nextScore,
      };

      return nextState;
    }
    case "HINT":
      return { ...state, showHint: action.payload };
    case "INIT":
      return action.payload;
    case "SAVE_PENDING":
      return { ...state, isSavingGame: true, saveStatus: "saving" };
    case "SAVE_SUCCESS":
      return {
        ...state,
        isSavingGame: false,
        savedGameId: action.payload,
        saveStatus: "saved",
      };
    case "SAVE_ERROR":
      return { ...state, isSavingGame: false, saveStatus: "error" };
    default:
      return state;
  }
};

function initState(
  { beers, userEntry }: Pick<State, "beers" | "userEntry">,
  gameId: string,
  store: string | null,
): State {
  const safeBeers = ensureBeers(beers);
  const fallback: State = {
    ...initialState,
    beers: safeBeers,
    beer: safeBeers[0],
    userEntry,
  };

  try {
    if (!store) return fallback;

    const parsed = JSON.parse(store) as Partial<State>;
    const beer = parsed.beer
      ? (safeBeers.find((candidate) => candidate.name === parsed.beer?.name) ??
        safeBeers[0])
      : safeBeers[0];

    return {
      ...fallback,
      ...parsed,
      beers: safeBeers,
      beer,
      userEntry,
      savedGameId: parsed.savedGameId ?? Number(gameId),
      isSavingGame: false,
      saveStatus: (parsed.savedGameId
        ? "saved"
        : "idle") satisfies State["saveStatus"],
    };
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

type Props = {
  beerPromise: Promise<Beers>;
  children: ReactNode;
  gameId: string;
  userEntryPromise: Promise<UserEntry | null>;
};

export default function GameProvider({
  children,
  beerPromise,
  gameId,
  userEntryPromise,
}: Props) {
  const { push, refresh } = useRouter();
  const beers = ensureBeers(use(beerPromise));
  const userEntry = use(userEntryPromise);
  const { user } = useUser();
  const storageKey = getBeerStorageKey(gameId);

  const store = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => localStorage.getItem(storageKey) ?? null,
    () => null,
  );

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    beers,
    beer: beers[0],
    savedGameId: Number(gameId),
    userEntry,
  });

  const onBeer: Game["onBeer"] = (guess) => {
    dispatch({ type: "GUESS", payload: guess });
  };

  const reset: Game["reset"] = () => {
    void createGame().then((nextGameId) => {
      localStorage.removeItem(storageKey);
      push(`/play/${nextGameId}`);
    });
  };

  useEffect(() => {
    dispatch({
      type: "INIT",
      payload: initState({ beers, userEntry }, gameId, store),
    });
  }, [beers, gameId, store, userEntry]);

  useEffect(() => {
    if (!state.gameOver || state.saveStatus !== "idle" || !state.endedAt)
      return;

    dispatch({ type: "SAVE_PENDING" });

    void completeGame(Number(gameId), {
      playerName: user?.fullName ?? null,
      score: state.score,
      bestStreak: state.bestStreak,
      correctGuesses: state.correctGuesses,
      totalGuesses: state.totalGuesses,
      startingLives: STARTING_LIVES,
      livesRemaining: state.lives,
      endedAt: state.endedAt,
      endReason: state.endReason ?? "lives_exhausted",
      guesses: state.result.map((item) => ({
        beerId: item.beer.id,
        guess: item.guess,
        correctAnswer: item.correctAnswer,
        isCorrect: item.correct,
        streakBeforeGuess: item.streakBeforeGuess,
        streakAfterGuess: item.streakAfterGuess,
        pointsAwarded: item.pointsAwarded,
        lifeDelta: item.lifeDelta,
        createdAt: item.createdAt,
      })),
    }).then((savedGame) => {
      if (!savedGame) {
        dispatch({ type: "SAVE_ERROR" });
        return;
      }

      dispatch({ type: "SAVE_SUCCESS", payload: savedGame.id });
      refresh();
    });
  }, [
    gameId,
    refresh,
    state.bestStreak,
    state.correctGuesses,
    state.endedAt,
    state.endReason,
    state.gameOver,
    state.lives,
    state.result,
    state.saveStatus,
    state.score,
    state.totalGuesses,
    user?.fullName,
  ]);

  useEffect(() => {
    if (!state.gameOver) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  useEffect(() => {
    if (state.gameOver) return;

    dispatch({ type: "HINT", payload: false });

    const id = setTimeout(
      () => dispatch({ type: "HINT", payload: true }),
      15000,
    );

    return () => clearTimeout(id);
  }, [state.beer, state.gameOver]);

  return (
    <GameContext.Provider value={{ ...state, onBeer, reset }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const game = use(GameContext);

  if (!game) throw new Error("useGame must be used within a GameProvider");

  return game;
}
