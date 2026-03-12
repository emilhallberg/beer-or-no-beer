import { notFound } from "next/navigation";

import SummaryScreen from "@/app/play/_/summary-screen";
import { getCompletedGameSummary } from "@/utils/game";

type Props = {
  params: Promise<{ gameId: string }>;
};

export default async function PlaySummaryPage({ params }: Props) {
  const { gameId } = await params;
  const summary = await getCompletedGameSummary(Number(gameId));

  if (!summary) notFound();

  return <SummaryScreen {...summary} />;
}
