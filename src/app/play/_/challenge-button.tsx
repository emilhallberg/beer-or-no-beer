"use client";

import { useGame } from "@/app/play/_/game-provider";

export default function ChallengeButton() {
  const { score } = useGame();

  return (
    <button
      onClick={async () => {
        const query = new URLSearchParams({});

        query.set("score", score.toString());

        const url = `/challenge?${query}`;

        void navigator
          .share({ title: "Beer or No Beer?", url })
          .catch((error) => {
            console.debug(error);
          });
      }}
    >
      Challenge
    </button>
  );
}
