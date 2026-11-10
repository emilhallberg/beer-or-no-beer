"use client";

import { Beer } from "lucide-react";

import { useGame } from "@/app/play/_/game-provider";

export default function BeerHearts() {
  const { lives } = useGame();

  return (
    <div
      role="status"
      aria-label={`${lives} liv kvar`}
      className="flex shrink-0 items-center gap-1 text-gold-300"
    >
      {Array.from({ length: lives }, (_, i) => (
        <Beer
          aria-hidden="true"
          key={i}
          className="size-5 sm:size-6"
          strokeWidth={2.25}
        />
      ))}
    </div>
  );
}
