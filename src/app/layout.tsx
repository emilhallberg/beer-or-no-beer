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
    "Put your taste (and trivia) skills to the test with Beer or No Beer, the quiz that challenges you to decide: Is it a real beer name or not?",
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
      <html lang="en">
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
