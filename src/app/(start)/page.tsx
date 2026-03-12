import { SignedOut } from "@clerk/nextjs";

import PlayButton from "@/app/(start)/_/play-button";
import ResetLocalStorage from "@/app/(start)/_/reset-local-storage";
import StatsLink from "@/app/(start)/_/stats-link";
import SignInButton from "@/app/play/_/sign-in-button";
import { getBeerCount } from "@/utils/beer";

export default async function StartPage() {
  const beerCount = await getBeerCount();

  return (
    <div className="grid">
      <div className="grid w-64 place-content-center gap-4 p-4 justify-self-center">
        <PlayButton disabled={beerCount === 0} />
        <StatsLink />
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <ResetLocalStorage />
      </div>
    </div>
  );
}
