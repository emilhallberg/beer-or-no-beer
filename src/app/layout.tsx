import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { GameFeel } from "@/ui/game-feel";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beer or No Beer?",
  description:
    "Sätt smaklökarna och ölkunskaperna på prov i Beer or No Beer?, quizet där du måste avgöra om ett ölnamn är på riktigt eller inte.",
};

type Props = Readonly<{ children: ReactNode }>;

export default function RootLayout({ children }: Props) {
  return (
    <ClerkProvider>
      <html lang="sv">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative isolate overflow-x-hidden`}
        >
          <GameFeel>
            <main className="relative z-10 w-full">{children}</main>
          </GameFeel>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
