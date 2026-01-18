import { ReactNode } from "react";

import Image from "next/image";

type Props = {
  children: ReactNode;
  leaderboard: ReactNode;
};

export default function StartLayout({ children, leaderboard }: Props) {
  return (
    <div className="grid">
      <div className="grid place-content-center p-4">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={100}
          height={100}
          loading="eager"
        />
      </div>
      {children}
      {leaderboard}
    </div>
  );
}
