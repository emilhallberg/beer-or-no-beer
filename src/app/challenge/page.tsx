import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ from?: string; score?: string }>;
};

export default async function ChallengePage({ searchParams }: Props) {
  const { from, score } = await searchParams;

  if (!score) redirect("/");

  return (
    <div className="h-svh grid place-content-center text-center">
      <div className="grid place-content-center p-4">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={150}
          height={150}
          loading="eager"
        />
      </div>
      {from ? (
        <h1>{from} is challenging your beer knowledge!</h1>
      ) : (
        <h1>Your beer knowledge is being challenged!</h1>
      )}
      {score && Number(score) > 0 ? (
        <Link href="/play">
          <button className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase">{`Beat ${score} - Play Now`}</button>
        </Link>
      ) : (
        <Link href="/play">
          <button className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase">
            Play Now
          </button>
        </Link>
      )}
    </div>
  );
}
