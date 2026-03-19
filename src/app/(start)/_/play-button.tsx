import { redirect } from "next/navigation";

import { createGame } from "@/utils/game";

type Props = {
  disabled?: boolean;
};

export default function PlayButton({ disabled = false }: Props) {
  async function startGame() {
    "use server";

    const gameId = await createGame();
    redirect(`/play/${gameId}`);
  }

  return (
    <form action={startGame} className="w-full">
      <button
        disabled={disabled}
        className="h-15 w-full rounded-2xl border-b-4 border-amber-700 bg-amber-950 px-4 py-2 font-bold text-white uppercase hover:border-amber-500 hover:bg-amber-400 active:border-b-0 disabled:cursor-not-allowed disabled:border-amber-950 disabled:bg-amber-950/60 disabled:text-amber-100/50 disabled:hover:border-amber-950 disabled:hover:bg-amber-950/60"
      >
        {disabled ? "Inga öl tillgängliga" : "Nytt spel"}
      </button>
    </form>
  );
}
