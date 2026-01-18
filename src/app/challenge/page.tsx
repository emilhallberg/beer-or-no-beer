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
        <Link href="/play">{`Beat ${score} - Play Now`}</Link>
      ) : (
        <Link href="/play">Play Now</Link>
      )}
    </div>
  );
}
