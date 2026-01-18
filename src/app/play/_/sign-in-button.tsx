"use client";

import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";

import { usePathname } from "next/navigation";

export default function SignInButton() {
  const pathname = usePathname();

  return (
    <ClerkSignInButton
      mode="modal"
      oauthFlow="popup"
      fallbackRedirectUrl={pathname}
    >
      <button className="h-15 bg-amber-950 hover:bg-amber-400 text-white font-bold py-2 px-4 border-b-4 active:border-b-0 border-amber-700 hover:border-amber-500 rounded uppercase uppercase">
        Sign in
      </button>
    </ClerkSignInButton>
  );
}
