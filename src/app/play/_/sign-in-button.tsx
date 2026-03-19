"use client";

import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";

import { usePathname } from "next/navigation";

export default function SignInButton() {
  const pathname = usePathname();

  return (
    <ClerkSignInButton fallbackRedirectUrl={pathname}>
      <button className="inline-flex min-h-15 w-full items-center justify-center rounded-2xl border border-amber-600/75 bg-amber-950/45 px-4 py-3 text-center font-bold uppercase tracking-[0.06em] text-amber-100 transition-colors hover:border-amber-400 hover:bg-amber-900/65">
        Logga in
      </button>
    </ClerkSignInButton>
  );
}
