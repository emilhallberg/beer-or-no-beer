import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import DrinkBackground from "@/ui/DrinkBackground";
import { getLeaderboard, getUserEntry } from "@/utils/leaderboard";

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

export default async function RootLayout({ children }: Props) {
  const [leaderboard, userEntry] = await Promise.all([
    getLeaderboard(),
    getUserEntry(),
  ]);
  const highScore = leaderboard[0]?.score ?? 0;
  const userHighScore = userEntry?.score ?? 0;

  return (
    <ClerkProvider>
      <html lang="sv">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative isolate overflow-x-hidden`}
        >
          <main className="relative z-10 w-screen">{children}</main>
          <DrinkBackground
            highScore={highScore}
            userHighScore={userHighScore}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
