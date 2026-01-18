import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ from?: string; score?: string }>;
};

export default async function ChallengePage({ searchParams }: Props) {
  const { score } = await searchParams;

  if (!score) redirect("/");

  return (
    <div className="h-svh grid place-content-center">
      <h1>Your drinking knowledge is being challenged!</h1>
      <Link href="/play">{`Beat ${score} - Play Now`}</Link>
    </div>
  );
}
