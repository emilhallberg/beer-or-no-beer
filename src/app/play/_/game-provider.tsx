"use client";

import {
  createContext,
  ReactNode,
  use,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { useUser } from "@clerk/nextjs";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { GAME_SCORE_EVENT } from "@/app/play/_/game-events";
import { Beer, Beers } from "@/utils/beer";
import {
  completeGame,
  PersistedGameState,
  saveGameProgress,
} from "@/utils/game";
import { UserEntry } from "@/utils/leaderboard";

export const BEER_STORAGE_KEY = "beer-storage" as const;
const STARTING_LIVES = 3 as const;
const BASE_POINTS_PER_CORRECT_GUESS = 100 as const;
const STREAK_BONUS_STEP = 10 as const;

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
  lives: number;
  newHighScore: boolean;
  result: GuessResult[];
  saveStatus: "error" | "idle" | "saved" | "saving";
  score: number;
  showHint: boolean;
  streak: number;
  totalGuesses: number;
  userEntry: UserEntry | null;
};

type Game = State & {
  onBeer: (guess: boolean) => void;
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
  abv: 0,
  brewery: "",
  id: 0,
  meta: {},
  name: "",
  real: true,
  type: "",
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
  lives: STARTING_LIVES,
  newHighScore: false,
  result: [],
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

function getPointsAwarded(streakAfterGuess: number, correct: boolean) {
  if (!correct) return 0;

  return BASE_POINTS_PER_CORRECT_GUESS + streakAfterGuess * STREAK_BONUS_STEP;
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "GUESS": {
      const currentBeerIndex = state.beers.indexOf(state.beer);
      const nextBeer = state.beers[currentBeerIndex + 1] ?? state.beer;
      const correct = state.beer.real === action.payload;
      const streakBeforeGuess = state.streak;
      const streakAfterGuess = correct ? streakBeforeGuess + 1 : 0;
      const pointsAwarded = getPointsAwarded(streakAfterGuess, correct);
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
      return { ...state, saveStatus: "saving" };
    case "SAVE_SUCCESS":
      return { ...state, saveStatus: "saved" };
    case "SAVE_ERROR":
      return { ...state, saveStatus: "error" };
    default:
      return state;
  }
};

function initState(
  game: PersistedGameState,
  userEntry: UserEntry | null,
): State {
  return {
    ...initialState,
    ...game,
    beers: ensureBeers(game.beers),
    beer: game.beer,
    userEntry,
  };
}

type Props = {
  children: ReactNode;
  gameId: string;
  initialGameState: PersistedGameState;
  userEntry: UserEntry | null;
};

export default function GameProvider({
  children,
  gameId,
  initialGameState,
  userEntry,
}: Props) {
  const { replace } = useRouter();
  const { user } = useUser();
  const summaryPath = `/play/${gameId}/summary` as Route;
  const lastPersistedResultCountRef = useRef(initialGameState.result.length);

  const [state, dispatch] = useReducer(
    reducer,
    initState(initialGameState, userEntry),
  );

  const onBeer: Game["onBeer"] = (guess) => {
    dispatch({ type: "GUESS", payload: guess });
  };

  useEffect(() => {
    if (!state.gameOver || state.saveStatus !== "idle" || !state.endedAt)
      return;
    dispatch({ type: "SAVE_PENDING" });

    void completeGame(Number(gameId), {
      playerImageUrl: user?.imageUrl ?? null,
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
      replace(summaryPath);
    });
  }, [
    gameId,
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
    user?.imageUrl,
    replace,
    summaryPath,
  ]);

  useEffect(() => {
    if (state.gameOver) return;
    if (state.result.length === lastPersistedResultCountRef.current) return;

    lastPersistedResultCountRef.current = state.result.length;

    void saveGameProgress(Number(gameId), {
      playerImageUrl: user?.imageUrl ?? null,
      playerName: user?.fullName ?? null,
      score: state.score,
      bestStreak: state.bestStreak,
      correctGuesses: state.correctGuesses,
      totalGuesses: state.totalGuesses,
      startingLives: STARTING_LIVES,
      livesRemaining: state.lives,
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
    });
  }, [
    gameId,
    state.bestStreak,
    state.correctGuesses,
    state.gameOver,
    state.lives,
    state.result,
    state.score,
    state.totalGuesses,
    user?.fullName,
    user?.imageUrl,
  ]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(GAME_SCORE_EVENT, {
        detail: { score: state.score },
      }),
    );
  }, [state.score]);

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
    <GameContext.Provider value={{ ...state, onBeer }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const game = use(GameContext);

  if (!game) throw new Error("useGame must be used within a GameProvider");

  return game;
}
