import Image from "next/image";
import Link from "next/link";

export default function StartPage() {
  return (
    <div className="grid">
      <div className="grid place-content-center p-4">
        <Image src="/logo.svg" alt="Logo" width={100} height={100} />
      </div>
      <div className="grid place-content-center p-4">
        <Link href="/play">
          <button>Start Game</button>
        </Link>
      </div>
      <div className="grid place-content-center p-4">
        <h1>Leaderboard</h1>
      </div>
    </div>
  );
}
