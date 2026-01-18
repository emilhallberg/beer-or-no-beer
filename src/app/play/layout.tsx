import { ReactNode } from "react";

import GameProvider from "@/app/play/_/game-provider";
import { getBeers } from "@/utils/beer";
import { getUserEntry } from "@/utils/leaderboard";

type Props = {
  game: ReactNode;
  result: ReactNode;
  children: ReactNode;
};

export default function PlayLayout({ game, result }: Props) {
  const beerPromise = getBeers();
  const userEntryPromise = getUserEntry();

  return (
    <GameProvider beerPromise={beerPromise} userEntryPromise={userEntryPromise}>
      {game}
      {result}
    </GameProvider>
  );
}
