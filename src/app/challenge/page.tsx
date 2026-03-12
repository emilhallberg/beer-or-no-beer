import Image from "next/image";
import { redirect } from "next/navigation";

import { createGame } from "@/utils/game";

type Props = {
  searchParams: Promise<{ from?: string; score?: string }>;
};

export default async function ChallengePage({ searchParams }: Props) {
  const { from, score } = await searchParams;

  if (!score) redirect("/");

  async function startGame() {
    "use server";

    const gameId = await createGame();
    redirect(`/play/${gameId}`);
  }

  return (
    <div className="h-svh grid place-content-center text-center">
      <div className="grid place-content-center p-4">
        <Image
          src="/logo.svg"
          alt="Logotyp"
          width={150}
          height={150}
          loading="eager"
        />
      </div>
      {from ? (
        <h1>{from} utmanar dina ölkunskaper!</h1>
      ) : (
        <h1>Dina ölkunskaper utmanas!</h1>
      )}
      <form action={startGame}>
        {score && Number(score) > 0 ? (
          <button className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase">{`Slå ${score} - Spela nu`}</button>
        ) : (
          <button className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase">
            Spela nu
          </button>
        )}
      </form>
    </div>
  );
}
