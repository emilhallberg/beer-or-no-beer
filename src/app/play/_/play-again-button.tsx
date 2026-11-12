"use client";

import { useChallengeTarget } from "@/ui/challenge-progress";
import StartGameButton from "@/ui/start-game-button";

export default function PlayAgainButton({
  gameId,
  score,
}: {
  gameId: number;
  score: number;
}) {
  const target = useChallengeTarget(gameId);
  return (
    <StartGameButton
      label={
        target === null
          ? "En runda till!"
          : score > target
            ? "En match till!"
            : "Ta revansch!"
      }
      challengeTarget={target ?? undefined}
    />
  );
}
