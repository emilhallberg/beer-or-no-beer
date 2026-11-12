"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import NumberFlow from "@number-flow/react";

import CanFoam from "@/app/play/_/can-foam";
import { useGame } from "@/app/play/_/game-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import BeerArt, { getBeerCharacter } from "@/ui/beer-art";
import {
  advanceWheelGesture,
  dragOffset,
  pointerVelocity,
  settleSpring,
  swipeAnswer,
} from "@/utils/swipe";

const condensation = [
  [6, 17, 5],
  [92, 26, 7],
  [8, 45, 8],
  [94, 62, 5],
  [5, 76, 4],
  [91, 83, 7],
  [31, 27, 4],
  [72, 38, 5],
] as const;

type DragStart = {
  pointerId: number;
  x: number;
  y: number;
  offset: number;
  horizontal: boolean;
  samples: { x: number; time: number }[];
};

export default function BeerHero() {
  const {
    beer,
    gameOver,
    onBeer,
    showHint,
    totalGuesses,
    isAnswering,
    answerCorrect,
  } = useGame();
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
    if (gameOver || isAnswering || !event.isPrimary || event.button !== 0)
      return;
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
    if (!start) {
      if (event.pointerType === "mouse" && !reducedMotion && !isAnswering) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (event.clientX - rect.left) / rect.width),
        );
        const y = Math.max(
          0,
          Math.min(1, (event.clientY - rect.top) / rect.height),
        );
        event.currentTarget.style.setProperty(
          "--can-yaw",
          `${(x - 0.5) * 12}deg`,
        );
        event.currentTarget.style.setProperty("--can-pitch", `${4 - y * 5}deg`);
        event.currentTarget.style.setProperty("--can-glint", `${24 + x * 12}%`);
      }
      return;
    }
    if (start.pointerId !== event.pointerId) return;
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
    if (gameOver || isAnswering || event.ctrlKey || dragStartRef.current)
      return;
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
    if (gameOver || isAnswering || event.repeat) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      onBeer(event.key === "ArrowRight");
    }
  }

  return (
    <div className="beer-can-wrap">
      <div
        ref={cardRef}
        aria-label="Svep burken höger för Beer, vänster för No Beer"
        className="can-interactive relative w-full max-w-xl touch-pan-y select-none cursor-grab active:cursor-grabbing rounded-3xl outline-none"
        onKeyDown={onKeyDown}
        onPointerCancel={release}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={(event) => {
          if (dragStartRef.current) return;
          event.currentTarget.style.removeProperty("--can-yaw");
          event.currentTarget.style.removeProperty("--can-pitch");
          event.currentTarget.style.removeProperty("--can-glint");
        }}
        onPointerUp={onPointerUp}
        onLostPointerCapture={() => {
          if (dragStartRef.current) release();
        }}
        role="group"
        aria-busy={isAnswering}
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
        <div
          className={`beer-can ${isAnswering && answerCorrect ? "is-opening" : ""}`}
          key={totalGuesses}
        >
          {isAnswering && answerCorrect ? <CanFoam /> : null}
          <div className="can-lid" aria-hidden="true">
            <span className="can-opening" />
            <span className="can-tab" />
            <span className="can-rivet" />
          </div>
          <div className="can-shoulder" aria-hidden="true" />
          <div
            className={`beer-playing-card can-label theme-${getBeerCharacter(beer.id, beer.name).theme} ${isAnswering ? "card-revealing" : ""}`}
          >
            <div className="can-condensation" aria-hidden="true">
              {condensation.map(([x, y, size], index) => (
                <span
                  key={index}
                  style={
                    {
                      "--drop-x": `${x}%`,
                      "--drop-y": `${y}%`,
                      "--drop-size": `${size}px`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            <div className="card-topline">
              <span>
                BEER OR
                <br />
                NO BEER?
              </span>
              <span>#{String(totalGuesses + 1).padStart(2, "0")}</span>
            </div>
            <div className="playing-card-art">
              <BeerArt seed={beer.id} beerName={beer.name} priority />
              <div className="card-stars" aria-hidden="true">
                ✦<br />✦<br />✦
              </div>
              {isAnswering ? (
                <div className="answer-stamp">
                  {beer.real ? "Beer" : "No Beer"}
                </div>
              ) : null}
            </div>
            <div className="playing-card-copy">
              <p className="card-question">VAD SÄGER MAGKÄNSLAN?</p>
              <h1 className="text-4xl font-bold tracking-tight text-balance">
                {beer.name}
              </h1>
              <p className="mt-3 text-sm opacity-75">
                {beer.type} ·{" "}
                <NumberFlow
                  value={beer.abv}
                  suffix="%"
                  animated={!reducedMotion}
                />
              </p>
              <p
                aria-live="polite"
                className="card-hint mt-5 text-sm leading-6"
              >
                {showHint
                  ? beer.description
                  : "Ledtråden dyker upp efter 15 sekunder…"}
              </p>
            </div>
          </div>
          <div className="can-base" aria-hidden="true" />
        </div>
      </div>
      <p className="art-caption">Spelillustration · ingen produktbild</p>
    </div>
  );
}
