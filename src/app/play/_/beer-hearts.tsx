"use client";

import { Beer } from "lucide-react";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHearts() {
  const { lives } = useGame();

  return (
    <h2 className="flex w-20 items-center gap-1 text-amber-300">
      {Array.from({ length: lives }, (_, i) => (
        <Beer key={i} className="size-6" strokeWidth={2.25} />
      ))}
    </h2>
  );
}
