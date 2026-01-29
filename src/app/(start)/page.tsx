import { SignedOut } from "@clerk/nextjs";

import PlayButton from "@/app/(start)/_/play-button";
import ResetLocalStorage from "@/app/(start)/_/reset-local-storage";
import SignInButton from "@/app/play/_/sign-in-button";

export default async function StartPage() {
  return (
    <div className="grid">
      <div className="grid place-content-center p-4 gap-4">
        <PlayButton />
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <ResetLocalStorage />
      </div>
    </div>
  );
}
