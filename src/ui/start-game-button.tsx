"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { createGame } from "@/utils/game";

export default function StartGameButton({
  label = "Nytt spel",
  disabled = false,
}: {
  label?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function start() {
    if (pending) return;
    setPending(true);
    setError(false);
    try {
      const gameId = await createGame();
      router.push(`/play/${gameId}`);
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <button
        className="button-primary w-full"
        disabled={disabled || pending}
        onClick={() => void start()}
      >
        {pending ? "Startar…" : label}
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-raspberry-200">
          Spelet kunde inte startas. Försök igen.
        </p>
      ) : null}
    </div>
  );
}
