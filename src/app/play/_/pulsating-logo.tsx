"use client";

export default function PulsatingLogo() {
  return (
    <div className="grid place-items-center gap-4 text-white select-none">
      <div className="size-24 rounded-full bg-amber-500/20 ring-4 ring-amber-500/40 grid place-items-center animate-pulse">
        <span className="text-5xl drop-shadow-sm">🍺</span>
      </div>
      <div className="text-sm uppercase tracking-widest opacity-80">
        Loading game…
      </div>
    </div>
  );
}
