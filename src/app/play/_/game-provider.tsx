"use client";

import { createContext, ReactNode, use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { Beer, Beers } from "@/utils/beer";
import { updateLeaderboard, UserEntry } from "@/utils/leaderboard";

type Game = {
  beers: Beers;
  beer: Beer;
  score: number;
  hearts: number;
  gameOver: boolean;
  onBeer: (guess: boolean) => void;
  reset: () => void;
  userEntry: UserEntry | null;
  newHighScore: boolean;
  showHint: boolean;
  result: Array<{ beer: Beer; correct: boolean }>;
};

const GameContext = createContext<Game | undefined>(undefined);

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
  const [beer, setBeer] = useState(beers[0]);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<Game["result"]>([]);
  const { user } = useUser();

  const nextBeer = () => {
    "use memo";
    setBeer((prevBeer) => beers[beers.indexOf(prevBeer) + 1]);
  };

  const onBeer = (guess: boolean) => {
    "use memo";
    setShowHint(false);
    const correct = beer.real === guess;
    setResult((prevResult) => [...prevResult, { beer, correct }]);

    setHearts((prevHearts) => {
      if (correct) {
        setScore((prevScore) => prevScore + 1);
        nextBeer();
        return prevHearts;
      }

      const newHearts = prevHearts - 1;

      if (newHearts === 0) {
        return newHearts;
      }

      nextBeer();
      return newHearts;
    });
  };

  const reset = () => {
    "use memo";
    setScore(0);
    setHearts(3);
    setBeer((prevBeer) => beers[beers.indexOf(prevBeer) + 1]);
  };

  const gameOver = hearts === 0;
  const newHighScore = !!userEntry && userEntry.score < score;

  useEffect(() => {
    if (gameOver) {
      if (userEntry && userEntry.score < score) {
        void updateLeaderboard(userEntry.name, score);
      } else if (user && user.fullName && userEntry === null) {
        void updateLeaderboard(user.fullName, score);
      }
    }
  }, [gameOver, score, user, userEntry]);

  useEffect(() => {
    const id = setTimeout(() => setShowHint(true), 15000);
    return () => clearTimeout(id);
  }, [beer]);

  return (
    <GameContext.Provider
      value={{
        beers,
        beer,
        onBeer,
        score,
        hearts,
        gameOver,
        reset,
        userEntry,
        newHighScore,
        showHint,
        result,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const game = use(GameContext);

  if (!game) throw new Error("useGame must be used within a GameProvider");

  return game;
}
