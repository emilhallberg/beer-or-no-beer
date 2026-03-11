import { redirect } from "next/navigation";

import { createGame } from "@/utils/game";

export default function PlayButton() {
  async function startGame() {
    "use server";

    const gameId = await createGame();
    redirect(`/play/${gameId}`);
  }

  return (
    <form action={startGame}>
      <button className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase">
        New Game
      </button>
    </form>
  );
}
