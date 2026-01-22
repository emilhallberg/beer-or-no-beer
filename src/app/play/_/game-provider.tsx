"use client";

import { createContext, ReactNode, use, useEffect, useReducer } from "react";
import { useUser } from "@clerk/nextjs";

import { Beer, Beers } from "@/utils/beer";
import { updateLeaderboard, UserEntry } from "@/utils/leaderboard";

const BEER_STORAGE_KEY = "beer-storage" as const;

type State = {
  beers: Beers;
  beer: Beer;
  score: number;
  hearts: number;
  gameOver: boolean;
  userEntry: UserEntry | null;
  newHighScore: boolean;
  showHint: boolean;
  result: Array<{ beer: Beer; correct: boolean }>;
};

type Game = State & {
  onBeer: (guess: boolean) => void;
  reset: () => void;
};

const GameContext = createContext<Game | undefined>(undefined);

type Action =
  | { type: "GUESS"; payload: boolean }
  | { type: "RESET" }
  | { type: "HINT"; payload: boolean };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "GUESS":
      const correct = state.beer.real === action.payload;
      const score = state.score + (correct ? 1 : 0);
      const hearts = state.hearts - (correct ? 0 : 1);
      const gameOver = hearts === 0;

      if (gameOver) {
        localStorage.setItem(BEER_STORAGE_KEY, JSON.stringify(state));
      }

      return {
        ...state,
        score,
        hearts,
        beer: gameOver
          ? state.beer
          : state.beers[state.beers.indexOf(state.beer) + 1],
        result: [...state.result, { beer: state.beer, correct }],
        gameOver,
        showHint: false,
        newHighScore: !!state.userEntry && state.userEntry.score < score,
      } satisfies State;
    case "HINT":
      return { ...state, showHint: action.payload };
    case "RESET":
      localStorage.removeItem(BEER_STORAGE_KEY);
      return initialState;
    default:
      return state;
  }
};

const initialState: State = {
  beers: [{ name: "", real: true, description: "" }],
  beer: { name: "", real: true, description: "" },
  score: 0,
  hearts: 3,
  gameOver: false,
  userEntry: null,
  newHighScore: false,
  showHint: false,
  result: [],
};

type Props = {
  children: ReactNode;
  beerPromise: Promise<Beers>;
  userEntryPromise: Promise<UserEntry | null>;
};

export default function GameProvider({
  children,
  beerPromise,
  userEntryPromise,
}: Props) {
  const beers = use(beerPromise);
  const userEntry = use(userEntryPromise);
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    beers,
    beer: beers[0],
    userEntry,
  });

  const { user } = useUser();

  const onBeer: Game["onBeer"] = (guess) => {
    dispatch({ type: "GUESS", payload: guess });
  };

  const reset: Game["reset"] = () => {
    dispatch({ type: "RESET" });
  };

  useEffect(() => {
    if (state.userEntry && state.userEntry.score < state.score) {
      void updateLeaderboard(state.userEntry.name, state.score).then(() => {
        localStorage.removeItem(BEER_STORAGE_KEY);
      });
    } else if (user && user.fullName && userEntry === null) {
      void updateLeaderboard(user.fullName, state.score).then(() => {
        localStorage.removeItem(BEER_STORAGE_KEY);
      });
    }
  }, [state.gameOver, state.score, state.userEntry, user, userEntry]);

  useEffect(() => {
    const id = setTimeout(
      () => dispatch({ type: "HINT", payload: true }),
      15000,
    );
    return () => clearTimeout(id);
  }, []);

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
