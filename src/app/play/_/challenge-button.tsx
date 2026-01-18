"use client";

import { useUser } from "@clerk/nextjs";

import { useGame } from "@/app/play/_/game-provider";

export default function ChallengeButton() {
  const { user } = useUser();
  const { score } = useGame();

  return (
    <button
      className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase"
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
