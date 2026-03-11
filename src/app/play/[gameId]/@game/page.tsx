"use client";

import { Activity } from "react";
import { SignedIn, UserAvatar } from "@clerk/nextjs";

import BeerButton from "@/app/play/_/beer-button";
import BeerHearts from "@/app/play/_/beer-hearts";
import BeerHero from "@/app/play/_/beer-hero";
import BeerScore from "@/app/play/_/beer-score";
import { useGame } from "@/app/play/_/game-provider";
import NoBeerButton from "@/app/play/_/no-beer-button";

export default function GameSlot() {
  const { gameOver } = useGame();

  return (
    <Activity mode={gameOver ? "hidden" : "visible"}>
      <div className="h-svh grid grid-rows-[max-content_1fr_max-content]">
        <header className="p-6 pt-4 pb-4 flex place-content-between bg-[var(--background)] rounded-b-3xl border-b-4 border-amber-700">
          <BeerHearts />
          <SignedIn>
            <UserAvatar />
          </SignedIn>
          <BeerScore />
        </header>
        <main className="p-6 h-full grid place-content-center">
          <BeerHero />
        </main>
        <footer className="p-4 pb-4 grid grid-cols-2 gap-4 bg-[var(--background)] rounded-t-3xl border-t-4 border-amber-700">
          <BeerButton />
          <NoBeerButton />
        </footer>
      </div>
    </Activity>
  );
}
