"use client";

import { type KeyboardEvent, type PointerEvent, useRef, useState } from "react";
import NumberFlow from "@number-flow/react";

import { useGame } from "@/app/play/_/game-provider";

const SWIPE_THRESHOLD = 72;
const MAX_DRAG_OFFSET = 140;

type DragStart = {
  pointerId: number;
  x: number;
  y: number;
};

export default function BeerHero() {
  const { beer, gameOver, onBeer, showHint } = useGame();
  const dragStartRef = useRef<DragStart | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const resetDrag = () => {
    dragStartRef.current = null;
    setDragX(0);
    setIsDragging(false);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (gameOver || !event.isPrimary) return;

    dragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 24) {
      resetDrag();
      return;
    }

    const clampedDeltaX = Math.max(
      -MAX_DRAG_OFFSET,
      Math.min(MAX_DRAG_OFFSET, deltaX),
    );

    setDragX(clampedDeltaX);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    const shouldSubmit =
      Math.abs(deltaX) >= SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY);

    resetDrag();

    if (shouldSubmit) {
      onBeer(deltaX > 0);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (gameOver) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onBeer(true);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onBeer(false);
    }
  };

  const swipeDirection =
    Math.abs(dragX) >= SWIPE_THRESHOLD / 2
      ? dragX > 0
        ? "beer"
        : "no-beer"
      : null;

  return (
    <div
      aria-label="Swipe right for Beer, left for No Beer"
      className="relative w-full max-w-xl touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]"
      onKeyDown={onKeyDown}
      onPointerCancel={resetDrag}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="group"
      style={{
        transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)`,
        transition: isDragging ? "none" : "transform 180ms ease-out",
      }}
      tabIndex={0}
    >
      <div
        className={`pointer-events-none absolute -left-3 top-1/2 -translate-y-1/2 rounded-xl border border-emerald-300/60 bg-emerald-500/20 px-4 py-2 text-sm font-black uppercase tracking-[0.08em] text-emerald-100 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-opacity ${
          swipeDirection === "beer" ? "opacity-100" : "opacity-0"
        }`}
      >
        Beer
      </div>
      <div
        className={`pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 rounded-xl border border-rose-300/60 bg-rose-500/20 px-4 py-2 text-sm font-black uppercase tracking-[0.08em] text-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-opacity ${
          swipeDirection === "no-beer" ? "opacity-100" : "opacity-0"
        }`}
      >
        No Beer
      </div>
      <div className="rounded-2xl border border-amber-700/60 bg-black/12 px-6 py-8 shadow-[0_18px_55px_rgba(0,0,0,0.2)]">
        <h1 className="text-center text-4xl font-bold">{beer.name}</h1>
        <p className="mt-1 text-center text-sm font-medium text-white">
          {beer.type} · <NumberFlow value={beer.abv} suffix="%" />
        </p>
        <p
          className={`mt-2 text-center ${showHint ? "opacity-100" : "opacity-0"}`}
        >
          {beer.description}
        </p>
      </div>
    </div>
  );
}
