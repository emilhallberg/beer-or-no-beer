"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { useRouter } from "next/navigation";

import { challengeStorageKey } from "@/ui/challenge-progress";
import { createGame } from "@/utils/game";

export default function StartGameButton({
  label = "Spela nu",
  challengeTarget,
  disabled = false,
}: {
  label?: string;
  challengeTarget?: number;
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
      if (challengeTarget !== undefined) {
        try {
          sessionStorage.setItem(
            challengeStorageKey(gameId),
            String(challengeTarget),
          );
        } catch {
          /* A storage restriction must not block the game. */
        }
      }
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
        <ArrowRight size={19} aria-hidden="true" />
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-raspberry-200">
          Spelet kunde inte startas. Försök igen.
        </p>
      ) : null}
    </div>
  );
}
