"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import NumberFlow from "@number-flow/react";

import { useGame } from "@/app/play/_/game-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  advanceWheelGesture,
  dragOffset,
  pointerVelocity,
  settleSpring,
  swipeAnswer,
} from "@/utils/swipe";

type DragStart = {
  pointerId: number;
  x: number;
  y: number;
  offset: number;
  horizontal: boolean;
  samples: { x: number; time: number }[];
};

export default function BeerHero() {
  const { beer, gameOver, onBeer, showHint } = useGame();
  const reducedMotion = useReducedMotion();
  const dragStartRef = useRef<DragStart | null>(null);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const frameRef = useRef(0);
  const [dragX, setDragX] = useState(0);
  const wheelRef = useRef({ distance: 0, answered: false, active: false });
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(wheelTimerRef.current);
    },
    [],
  );

  function updatePosition(x: number) {
    positionRef.current = x;
    setDragX(x);
  }

  function release() {
    dragStartRef.current = null;
    cancelAnimationFrame(frameRef.current);
    if (reducedMotion) {
      updatePosition(0);
      velocityRef.current = 0;
      return;
    }
    let previous = performance.now();
    function tick(now: number) {
      const next = settleSpring(
        positionRef.current,
        velocityRef.current,
        Math.min((now - previous) / 1000, 0.05),
      );
      previous = now;
      velocityRef.current = next.velocity;
      if (Math.abs(next.position) < 0.1 && Math.abs(next.velocity) < 1) {
        updatePosition(0);
        velocityRef.current = 0;
        return;
      }
      updatePosition(next.position);
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (gameOver || !event.isPrimary || event.button !== 0) return;
    clearTimeout(wheelTimerRef.current);
    wheelRef.current = { distance: 0, answered: false, active: false };
    cancelAnimationFrame(frameRef.current);
    dragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offset: positionRef.current,
      horizontal: false,
      samples: [{ x: event.clientX, time: event.timeStamp }],
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.25) {
        release();
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
        return;
      }
      if (Math.abs(dx) <= Math.abs(dy)) return;
      start.horizontal = true;
    }
    start.samples.push({ x: event.clientX, time: event.timeStamp });
    start.samples = start.samples.filter(
      (sample) => event.timeStamp - sample.time <= 100,
    );
    velocityRef.current = pointerVelocity(start.samples, event.timeStamp);
    updatePosition(start.offset + dragOffset(dx));
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const velocity = pointerVelocity(
      [...start.samples, { x: event.clientX, time: event.timeStamp }],
      event.timeStamp,
    );
    const answer = swipeAnswer(
      event.clientX - start.x,
      event.clientY - start.y,
      velocity,
    );
    velocityRef.current = velocity;
    release();
    if (answer !== null) onBeer(answer);
  }

  const onWheel = useEffectEvent((event: WheelEvent) => {
    if (gameOver || event.ctrlKey || dragStartRef.current) return;
    const wheel = wheelRef.current;
    if (!wheel.active && Math.abs(event.deltaX) <= Math.abs(event.deltaY))
      return;
    event.preventDefault();
    clearTimeout(wheelTimerRef.current);
    wheel.active = true;
    if (!wheel.answered) {
      cancelAnimationFrame(frameRef.current);
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerWidth
            : 1;
      // Wheel deltas describe scrolling; the content follows the fingers in the opposite direction.
      const next = advanceWheelGesture(wheel, -event.deltaX * unit);
      wheelRef.current = { ...next, active: true };
      updatePosition(dragOffset(next.distance));
      if (next.answer !== null) {
        release();
        onBeer(next.answer);
      }
    }
    // Consume the rest of this gesture's momentum, so it cannot answer the next card.
    wheelTimerRef.current = setTimeout(() => {
      if (!wheelRef.current.answered) release();
      wheelRef.current = { distance: 0, answered: false, active: false };
    }, 220);
  });

  useEffect(() => {
    const card = cardRef.current;
    function handleWheel(event: WheelEvent) {
      onWheel(event);
    }
    card?.addEventListener("wheel", handleWheel, { passive: false });
    return () => card?.removeEventListener("wheel", handleWheel);
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (gameOver || event.repeat) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      onBeer(event.key === "ArrowRight");
    }
  }

  return (
    <div className="w-[calc(100vw-3rem)] max-w-md">
      <div
        ref={cardRef}
        aria-label="Svep eller tryck höger för Beer, vänster för No Beer"
        className="relative w-full max-w-xl touch-pan-y select-none cursor-grab active:cursor-grabbing rounded-3xl outline-none"
        onKeyDown={onKeyDown}
        onPointerCancel={release}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onLostPointerCapture={() => {
          if (dragStartRef.current) release();
        }}
        role="group"
        style={{
          transform: reducedMotion
            ? undefined
            : `translateX(${dragX}px) rotate(${dragX / 24}deg)`,
        }}
        tabIndex={0}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-3 rounded-lg bg-pub-950 px-3 py-1 text-sm font-semibold text-pub-100 ${dragX > 36 ? "opacity-100" : "opacity-0"}`}
        >
          Beer →
        </div>
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-3 rounded-lg bg-raspberry-950 px-3 py-1 text-sm font-semibold text-raspberry-100 ${dragX < -36 ? "opacity-100" : "opacity-0"}`}
        >
          ← No Beer
        </div>
        <div className="surface px-6 py-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-balance text-gold-50">
            {beer.name}
          </h1>
          <p className="mt-3 text-sm text-gold-100/80">
            {beer.type} ·{" "}
            <NumberFlow value={beer.abv} suffix="%" animated={!reducedMotion} />
          </p>
          <p
            aria-hidden={!showHint}
            className={`mt-5 text-sm leading-6 text-gold-100/80 ${showHint ? "visible" : "invisible"}`}
          >
            {beer.description}
          </p>
        </div>
      </div>
    </div>
  );
}
