"use client";

import { useRouter } from "next/navigation";

import { createGame } from "@/utils/game";

export default function PlayAgainButton() {
  const { push } = useRouter();

  return (
    <button
      className="inline-flex min-h-15 w-full items-center justify-center rounded-2xl border-b-4 border-amber-200/40 bg-[linear-gradient(180deg,#f7d774_0%,#e4b63c_100%)] px-4 py-3 text-center text-base font-black uppercase tracking-[0.06em] text-amber-950 shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition-transform transition-colors hover:-translate-y-0.5 hover:border-amber-100/60 hover:bg-[linear-gradient(180deg,#fde08a_0%,#efbe44_100%)] active:translate-y-0.5 active:border-b-2"
      onClick={() => {
        void createGame().then((nextGameId) => {
          push(`/play/${nextGameId}`);
        });
      }}
    >
      Spela igen
    </button>
  );
}
