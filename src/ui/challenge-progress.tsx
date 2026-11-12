"use client";

import { useSyncExternalStore } from "react";
import { Flag, Trophy } from "lucide-react";

export function challengeStorageKey(gameId: number | string) {
  return `beer-challenge:${gameId}`;
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

function readTarget(gameId: number | string) {
  try {
    const value = sessionStorage.getItem(challengeStorageKey(gameId));
    const parsed = value === null ? NaN : Number(value);
    return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function useChallengeTarget(gameId: number | string) {
  return useSyncExternalStore(
    subscribe,
    () => readTarget(gameId),
    () => null,
  );
}

export function ChallengeProgress({
  gameId,
  score,
}: {
  gameId: number | string;
  score: number;
}) {
  const target = useChallengeTarget(gameId);
  if (target === null) return null;
  return (
    <p className="challenge-progress">
      <Flag size={15} aria-hidden="true" />
      <strong>
        {score > target ? "Utmaningen slagen!" : `Slå ${target} poäng`}
      </strong>
      <span>
        {score > target
          ? `${score - target} poäng före`
          : `${target - score + 1} poäng kvar till seger`}
      </span>
    </p>
  );
}

export function ChallengeOutcome({
  gameId,
  score,
}: {
  gameId: number | string;
  score: number;
}) {
  const target = useChallengeTarget(gameId);
  if (target === null) return null;
  return (
    <p className="challenge-outcome">
      <Trophy className="mr-2 inline size-5" aria-hidden="true" />
      {score > target
        ? `Utmaningen slagen! Du tog ${score} poäng mot ${target}.`
        : `Du nådde ${score} av ${target + 1} poäng som behövdes. Dags för revansch?`}
    </p>
  );
}
