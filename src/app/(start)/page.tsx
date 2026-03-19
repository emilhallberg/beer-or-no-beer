import { SignedOut } from "@clerk/nextjs";

import Link from "next/link";

import PlayButton from "@/app/(start)/_/play-button";
import ResetLocalStorage from "@/app/(start)/_/reset-local-storage";
import StatsLink from "@/app/(start)/_/stats-link";
import SignInButton from "@/app/play/_/sign-in-button";
import { isCurrentUserAdmin } from "@/utils/admin";
import { getBeerCount } from "@/utils/beer";

export default async function StartPage() {
  const [beerCount, isAdmin] = await Promise.all([
    getBeerCount(),
    isCurrentUserAdmin(),
  ]);

  return (
    <div className="grid">
      <div className="grid w-64 place-content-center gap-4 p-4 justify-self-center">
        <PlayButton disabled={beerCount === 0} />
        <StatsLink />
        {isAdmin ? (
          <>
            <Link
              href="/admin/promos"
              className="grid h-15 w-full place-items-center rounded-2xl border-b-4 border-sky-200/35 bg-[linear-gradient(180deg,#d9f0ff_0%,#8fd3ff_100%)] px-4 py-2 font-bold uppercase text-sky-950 transition-colors hover:border-sky-100/55 hover:bg-[linear-gradient(180deg,#e8f7ff_0%,#9bd8ff_100%)]"
            >
              Promo Admin
            </Link>
            <Link
              href="/admin/users"
              className="grid h-15 w-full place-items-center rounded-2xl border-b-4 border-sky-950/50 bg-[linear-gradient(180deg,#223853_0%,#152335_100%)] px-4 py-2 font-bold uppercase text-sky-50 transition-colors hover:border-sky-800/60 hover:bg-[linear-gradient(180deg,#29456a_0%,#1a2b42_100%)]"
            >
              User Admin
            </Link>
          </>
        ) : null}
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <ResetLocalStorage />
      </div>
    </div>
  );
}
