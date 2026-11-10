"use client";

import { useUser } from "@clerk/nextjs";

import { useChallengeShare } from "@/hooks/use-challenge-share";

export default function ChallengeButton({ score }: { score: number }) {
  const { user } = useUser();
  const { share, pending, message } = useChallengeShare(score, user?.fullName);
  return (
    <div>
      <button
        className="button-secondary w-full"
        disabled={pending}
        onClick={() => void share()}
      >
        {pending ? "Delar…" : "Utmana en vän"}
      </button>
      <p role="status" className="mt-2 text-sm text-gold-100">
        {message}
      </p>
    </div>
  );
}
