"use client";

import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";

import { usePathname } from "next/navigation";

export default function SignInButton() {
  const pathname = usePathname();

  return (
    <ClerkSignInButton fallbackRedirectUrl={pathname}>
      <button className="h-15 w-full rounded border-b-4 border-amber-700 bg-amber-950 px-4 py-2 font-bold text-white uppercase hover:border-amber-500 hover:bg-amber-400 active:border-b-0">
        Logga in
      </button>
    </ClerkSignInButton>
  );
}
