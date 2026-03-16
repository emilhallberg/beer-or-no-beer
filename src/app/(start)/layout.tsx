import { ReactNode } from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";

import Image from "next/image";

type Props = {
  children: ReactNode;
  leaderboard: ReactNode;
};

export default function StartLayout({ children, leaderboard }: Props) {
  return (
    <div className="grid">
      <div className="grid justify-center rounded-b-3xl border-b-4 border-amber-700 bg-[var(--background)] p-6 pt-4 pb-4">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      <div className="h-[80vh] grid place-content-center">
        <Image
          src="/logo.svg"
          alt="Logotyp"
          width={300}
          height={300}
          loading="eager"
        />
        {children}
      </div>
      {leaderboard}
    </div>
  );
}
