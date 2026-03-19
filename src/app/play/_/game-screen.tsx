"use client";

import BeerButton from "@/app/play/_/beer-button";
import BeerHearts from "@/app/play/_/beer-hearts";
import BeerHero from "@/app/play/_/beer-hero";
import BeerMenu from "@/app/play/_/beer-menu";
import BeerScore from "@/app/play/_/beer-score";
import NoBeerButton from "@/app/play/_/no-beer-button";

export default function GameScreen() {
  return (
    <div className="h-svh grid grid-rows-[max-content_1fr_max-content]">
      <div className="relative z-20">
        <header className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 rounded-b-3xl border-b-4 border-amber-700 bg-[var(--background)] px-4 pt-4 pb-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-6">
          <div className="justify-self-start">
            <BeerHearts />
          </div>
          <div className="justify-self-end sm:justify-self-center">
            <BeerMenu />
          </div>
          <div className="hidden items-center justify-self-end sm:flex">
            <BeerScore />
          </div>
        </header>
        <div className="flex justify-center px-4 pt-3 sm:hidden">
          <BeerScore />
        </div>
      </div>
      <main className="p-6 h-full grid place-content-center">
        <BeerHero />
      </main>
      <footer className="p-4 pb-4 grid grid-cols-2 gap-4 bg-[var(--background)] rounded-t-3xl border-t-4 border-amber-700">
        <BeerButton />
        <NoBeerButton />
      </footer>
    </div>
  );
}
