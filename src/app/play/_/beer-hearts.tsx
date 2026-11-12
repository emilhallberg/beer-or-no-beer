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
      {Array.from({ length: 3 }, (_, i) => (
        <Beer
          aria-hidden="true"
          key={i}
          className={`life-mug size-5 sm:size-6 ${i < lives ? "" : "life-empty"}`}
          strokeWidth={2.25}
        />
      ))}
    </div>
  );
}
