import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import Link from "next/link";

export default function StartPage() {
  return (
    <div className="grid">
      <SignedIn>
        <div className="grid place-content-center p-4">
          <UserButton />
        </div>
      </SignedIn>
      <div className="grid place-content-center p-4">
        <Link href="/play">
          <button>Start Game</button>
        </Link>
      </div>
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
    </div>
  );
}
