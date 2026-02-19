import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import DrinkBackground from "@/ui/DrinkBackground";

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

export const viewport: Viewport = {
  themeColor: "#0a0c10",
  viewportFit: "cover",
};

type Props = Readonly<{ children: ReactNode }>;

export default function RootLayout({ children }: Props) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <DrinkBackground />
          <div className="max-w-screen-sm mx-auto min-h-screen">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
