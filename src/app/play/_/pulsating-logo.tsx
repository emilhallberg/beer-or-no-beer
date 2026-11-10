"use client";

export default function PulsatingLogo() {
  return (
    <div className="grid place-items-center gap-4 text-white select-none">
      <div className="size-24 rounded-full bg-gold-500/20 ring-4 ring-gold-500/40 grid place-items-center animate-pulse">
        <span className="font-serif text-4xl text-gold-200">B.</span>
      </div>
      <div className="text-sm tracking-widest opacity-80">Laddar spel…</div>
    </div>
  );
}
