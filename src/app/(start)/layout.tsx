import { ReactNode } from "react";

import Brand from "@/ui/brand";

type Props = { children: ReactNode; leaderboard: ReactNode };

export default function StartLayout({ children, leaderboard }: Props) {
  return (
    <div className="pub-start">
      <section className="pub-hero">
        <Brand />
        {children}
      </section>
      <div className="pub-leaderboard-wrap">{leaderboard}</div>
    </div>
  );
}
