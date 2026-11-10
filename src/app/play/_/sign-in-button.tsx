"use client";

import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";

import { usePathname } from "next/navigation";

export default function SignInButton() {
  const pathname = usePathname();

  return (
    <ClerkSignInButton fallbackRedirectUrl={pathname}>
      <button className="button-secondary w-full">Logga in</button>
    </ClerkSignInButton>
  );
}
