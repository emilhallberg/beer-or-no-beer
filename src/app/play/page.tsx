import BeerButton from "@/app/play/_/beer-button";
import BeerHearts from "@/app/play/_/beer-hearts";
import BeerHero from "@/app/play/_/beer-hero";
import BeerScore from "@/app/play/_/beer-score";
import GameProvider from "@/app/play/_/game-provider";
import NoBeerButton from "@/app/play/_/no-beer-button";
import getBeers from "@/utils/getBeers";

export default function PlayPage() {
  const beerPromise = getBeers();

  return (
    <GameProvider beerPromise={beerPromise}>
      <div className="h-svh grid grid-rows-[max-content_1fr_max-content] p-6">
        <header className="h-20 flex place-content-between">
          <BeerHearts />
          <BeerScore />
        </header>
        <main className="h-full grid place-content-center">
          <BeerHero />
        </main>
        <footer className="h-20 flex place-content-between">
          <BeerButton />
          <NoBeerButton />
        </footer>
      </div>
    </GameProvider>
  );
}
