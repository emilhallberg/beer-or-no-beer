"use client";

import { createContext, ReactNode, use, useState } from "react";

import { Beer, Beers } from "@/utils/getBeers";

type Game = {
  beers: Beers;
  beer: Beer;
  onBeer: (guess: boolean) => void;
  score: number;
  hearts: number;
  gameOver: boolean;
};

const GameContext = createContext<Game | undefined>(undefined);

type Props = { children: ReactNode; beerPromise: Promise<Beers> };

export default function GameProvider({ children, beerPromise }: Props) {
  const beers = use(beerPromise);
  const [beer, setBeer] = useState(beers[0]);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);

  const onBeer = (guess: boolean) => {
    "use memo";
    const correct = beer.real === guess;

    setScore((prevScore) => prevScore + (correct ? 1 : 0));
    setHearts((prevHearts) => (correct ? prevHearts : prevHearts - 1));
    setBeer((prevBeer) => beers[beers.indexOf(prevBeer) + 1]);
  };

  const gameOver = hearts === 0;

  return (
    <GameContext.Provider
      value={{ beers, beer, onBeer, score, hearts, gameOver }}
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
