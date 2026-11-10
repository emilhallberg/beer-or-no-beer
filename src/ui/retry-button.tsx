"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

export default function RetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="button-secondary"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "Hämtar…" : "Försök igen"}
    </button>
  );
}
