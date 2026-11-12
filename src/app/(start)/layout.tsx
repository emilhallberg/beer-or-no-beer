import { ReactNode } from "react";

import Link from "next/link";

import Brand from "@/ui/brand";
import { SoundToggle } from "@/ui/game-feel";

type Props = { children: ReactNode; leaderboard: ReactNode };

export default function StartLayout({ children, leaderboard }: Props) {
  return (
    <div className="pub-start">
      <header className="site-header">
        <Brand compact linked />
        <div className="header-actions">
          <Link href="/stats" className="text-link">
            Din ölprofil
          </Link>
          <SoundToggle />
        </div>
      </header>
      {children}
      <section className="pub-leaderboard-wrap" aria-label="Topplista">
        {leaderboard}
      </section>
      <footer className="site-footer">
        <span>Små beslut. Stora ölnamn.</span>
        <span>Beer or No Beer? · Spela med magkänslan.</span>
      </footer>
    </div>
  );
}
