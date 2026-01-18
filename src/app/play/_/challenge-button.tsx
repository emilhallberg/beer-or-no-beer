"use client";

import { useUser } from "@clerk/nextjs";

import { useGame } from "@/app/play/_/game-provider";

export default function ChallengeButton() {
  const { user } = useUser();
  const { score } = useGame();

  return (
    <button
      onClick={async () => {
        const query = new URLSearchParams({});

        if (user?.fullName) {
          query.set("from", user.fullName);
        }

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
