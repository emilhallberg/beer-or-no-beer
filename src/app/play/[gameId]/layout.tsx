import { ReactNode } from "react";

import GameProvider from "@/app/play/_/game-provider";
import { getBeers } from "@/utils/beer";
import { getUserEntry } from "@/utils/leaderboard";

type Props = {
  game: ReactNode;
  params: Promise<{ gameId: string }>;
  result: ReactNode;
};

export default async function PlayGameLayout({ game, params, result }: Props) {
  const { gameId } = await params;
  const beerPromise = getBeers();
  const userEntryPromise = getUserEntry();

  return (
    <GameProvider
      beerPromise={beerPromise}
      gameId={gameId}
      userEntryPromise={userEntryPromise}
    >
      {game}
      {result}
    </GameProvider>
  );
}
