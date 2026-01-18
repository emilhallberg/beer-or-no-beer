"use client";

import { Activity } from "react";
import { SignedIn, SignedOut, SignInButton, UserAvatar } from "@clerk/nextjs";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BeerScore from "@/app/play/_/beer-score";
import ChallengeButton from "@/app/play/_/challenge-button";
import { useGame } from "@/app/play/_/game-provider";
import PlayAgainButton from "@/app/play/_/play-again-button";

export default function ResultSlot() {
  const { gameOver } = useGame();
  const pathname = usePathname();

  return (
    <Activity mode={gameOver ? "visible" : "hidden"}>
      <div className="h-svh grid place-content-center">
        <SignedIn>
          <UserAvatar />
        </SignedIn>
        <BeerScore />
        <div className="grid grid-cols-3">
          <PlayAgainButton />
          <ChallengeButton />
          <Link href="/">
            <button>Home</button>
          </Link>
        </div>
        <SignedOut>
          Sign in to save your score!
          <SignInButton
            mode="modal"
            oauthFlow="popup"
            fallbackRedirectUrl={pathname}
          />
        </SignedOut>
      </div>
    </Activity>
  );
}
