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
      <div className="h-svh grid grid-rows-[max-content_1fr_max-content] p-6">
        <header className="h-20 flex place-content-between">
          <BeerHearts />
          <SignedIn>
            <UserAvatar />
          </SignedIn>
          <BeerScore />
        </header>
        <main className="h-full grid place-content-center">
          <BeerHero />
        </main>
        <footer className="h-20 grid grid-cols-2 gap-4">
          <BeerButton />
          <NoBeerButton />
        </footer>
      </div>
    </Activity>
  );
}
