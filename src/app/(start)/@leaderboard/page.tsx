import Image from "next/image";

import LeaderboardNumber from "@/app/(start)/@leaderboard/leaderboard-number";
import { getLeaderboard } from "@/utils/leaderboard";

export default async function LeaderboardSlot() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="flex min-h-[80vh] flex-col rounded-t-3xl border-t-4 border-amber-500 bg-[var(--background)] p-4 text-white">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-amber-200/20 pb-3">
        <h1 className="text-2xl uppercase">Leaderboard</h1>
        <p className="text-right text-xs uppercase tracking-[0.28em] text-amber-200/70">
          Best runs only
        </p>
      </div>
      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 px-3 pb-2 text-[0.65rem] uppercase tracking-[0.28em] text-amber-200/60">
        <span>Rank</span>
        <span className="text-right">Score</span>
        <span className="text-right">Accuracy</span>
        <span className="text-right">Streak</span>
      </div>
      <ol className="grid gap-2">
        {leaderboard.map(
          ({ userId, name, score, accuracy, bestStreak, imageUrl }, index) => {
            return (
              <li
                key={userId}
                className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] items-center gap-3 rounded-2xl border border-amber-200/10 bg-amber-50/6 px-3 py-3 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-300/30 bg-amber-300/12 text-lg font-black text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:text-xl">
                    <LeaderboardNumber value={index + 1} />
                  </div>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`${name} avatar`}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full border border-amber-200/20 object-cover"
                    />
                  ) : (
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-amber-200/20 bg-amber-50/10 text-sm text-amber-100">
                      {name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-base sm:text-lg">{name}</p>
                  </div>
                </div>
                <p className="text-right text-lg sm:text-xl">
                  <LeaderboardNumber value={score} />
                </p>
                <p className="text-right text-lg sm:text-xl">
                  <LeaderboardNumber
                    suffix="%"
                    value={Math.round(accuracy * 100)}
                  />
                </p>
                <p className="text-right text-lg sm:text-xl">
                  <LeaderboardNumber value={bestStreak} />
                </p>
              </li>
            );
          },
        )}
      </ol>
    </div>
  );
}
