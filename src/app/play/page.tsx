import { redirect } from "next/navigation";

import { createGame } from "@/utils/game";

export default async function PlayIndexPage() {
  const gameId = await createGame();

  redirect(`/play/${gameId}`);
}
