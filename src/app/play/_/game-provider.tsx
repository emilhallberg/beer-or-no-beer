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

import Image from "next/image";

import { Beer, Beers } from "@/utils/beer";
import { UserEntry } from "@/utils/leaderboard";

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
  loading: boolean;
};

type Game = State & {
  onBeer: (guess: boolean) => void;
  reset: () => void;
};

const GameContext = createContext<Game | undefined>(undefined);

type Action =
  | { type: "GUESS"; payload: boolean }
  | { type: "RESET"; payload: { beers: Beers; userEntry: UserEntry | null } }
  | { type: "HINT"; payload: boolean }
  | { type: "LOADING"; payload: boolean }
  | { type: "INIT"; payload: State };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "GUESS":
      const correct = state.beer.real === action.payload;
      const score = state.score + (correct ? 1 : 0);
      const hearts = state.hearts - (correct ? 0 : 1);
      const gameOver = hearts === 0;

      const nextState: State = {
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
      };

      if (gameOver) {
        localStorage.setItem(BEER_STORAGE_KEY, JSON.stringify(nextState));
      }

      return nextState;
    case "HINT":
      return { ...state, showHint: action.payload };
    case "LOADING":
      return { ...state, loading: action.payload };
    case "RESET":
      localStorage.removeItem(BEER_STORAGE_KEY);
      return {
        ...initialState,
        beers: action.payload.beers,
        beer: action.payload.beers[0],
        userEntry: action.payload.userEntry,
        loading: false,
      };
    case "INIT":
      return action.payload;
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
  loading: true,
};

function initState(
  { beers, userEntry }: Pick<State, "userEntry" | "beers">,
  store: string | null,
): State {
  const fallback: State = {
    ...initialState,
    beers,
    beer: beers[0],
    userEntry: userEntry,
    loading: false,
  };

  try {
    if (!store) return fallback;

    const parsed = JSON.parse(store) as Partial<State>;

    const beer = parsed.beer
      ? (beers.find((b) => b.name === parsed.beer!.name) ?? beers[0])
      : beers[0];

    return {
      ...fallback,
      ...parsed,
      beers,
      beer,
      userEntry,
    };
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

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

  const store = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => {
      return localStorage.getItem(BEER_STORAGE_KEY) ?? null;
    },
    () => {
      return null;
    },
  );

  const [state, dispatch] = useReducer(reducer, initialState);

  const { user } = useUser();

  const onBeer: Game["onBeer"] = (guess) => {
    dispatch({ type: "GUESS", payload: guess });
  };

  const reset: Game["reset"] = () => {
    dispatch({ type: "RESET", payload: { beers, userEntry } });
  };

  useEffect(() => {
    dispatch({ type: "INIT", payload: initState({ beers, userEntry }, store) });
  }, [beers, store, userEntry]);

  useEffect(() => {
    if (state.gameOver) {
      if (state.userEntry && state.userEntry.score < state.score) {
        // void updateLeaderboard(state.userEntry.name, state.score);
      } else if (user && user.fullName && userEntry === null) {
        // void updateLeaderboard(user.fullName, state.score);
      }
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
      {state.loading ? (
        <div className="h-screen grid place-content-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={300}
            height={300}
            loading="eager"
            className="animate-pulse"
          />
        </div>
      ) : (
        children
      )}
    </GameContext.Provider>
  );
}

export function useGame() {
  const game = use(GameContext);

  if (!game) throw new Error("useGame must be used within a GameProvider");

  return game;
}
