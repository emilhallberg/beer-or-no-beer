import { ReactNode } from "react";

import GameProvider from "@/app/play/_/game-provider";
import getBeers from "@/utils/getBeers";

type Props = {
  game: ReactNode;
  result: ReactNode;
  children: ReactNode;
};

export default function PlayLayout({ game, result }: Props) {
  const beerPromise = getBeers();

  return (
    <GameProvider beerPromise={beerPromise}>
      {game}
      {result}
    </GameProvider>
  );
}
