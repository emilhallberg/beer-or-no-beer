import { notFound, redirect } from "next/navigation";

import GameProvider from "@/app/play/_/game-provider";
import GameScreen from "@/app/play/_/game-screen";
import { getGameState } from "@/utils/game";
import { getUserEntry } from "@/utils/leaderboard";

type Props = {
  params: Promise<{ gameId: string }>;
};

export default async function PlayGamePage({ params }: Props) {
  const { gameId } = await params;
  const numericGameId = Number(gameId);
  const [gameState, userEntry] = await Promise.all([
    getGameState(numericGameId),
    getUserEntry(),
  ]);

  if (!gameState) notFound();
  if (gameState.gameOver) redirect(`/play/${gameId}/summary`);

  return (
    <GameProvider
      gameId={gameId}
      initialGameState={gameState}
      userEntry={userEntry}
    >
      <GameScreen />
    </GameProvider>
  );
}
