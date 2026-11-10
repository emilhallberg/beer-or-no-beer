"use client";

import { useEffect, useState } from "react";

import { shareChallenge } from "@/utils/share-challenge";

export function useChallengeShare(score: number, name?: string | null) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timeout);
  }, [message]);

  async function share() {
    if (pending) return;
    setPending(true);
    setMessage("");
    try {
      setMessage(await shareChallenge(score, name));
    } catch {
      setMessage(
        "Länken kunde inte delas. Försök igen eller använd webbläsarens delningsmeny.",
      );
    } finally {
      setPending(false);
    }
  }
  return { share, pending, message };
}
