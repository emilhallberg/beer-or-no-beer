"use client";

import { useUser } from "@clerk/nextjs";

type Props = {
  score: number;
};

export default function ChallengeButton({ score }: Props) {
  const { user } = useUser();

  async function onShare() {
    const query = new URLSearchParams({});

    if (user?.fullName) {
      query.set("from", user.fullName);
    }

    query.set("score", score.toString());

    const relativeUrl = `/challenge?${query}`;
    const shareUrl = new URL(relativeUrl, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Beer or No Beer?",
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (error) {
      console.debug(error);
    }
  }

  return (
    <button
      className="inline-flex min-h-15 w-full items-center justify-center rounded-2xl border border-amber-700/70 bg-black/18 px-4 py-3 text-center text-base font-bold uppercase tracking-[0.06em] text-amber-100 transition-colors hover:border-amber-500 hover:bg-amber-950/60"
      onClick={() => {
        void onShare();
      }}
    >
      Utmana
    </button>
  );
}
