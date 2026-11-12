import { Flame, Medal, Target, Trophy } from "lucide-react";

import Image from "next/image";

import LeaderboardNumber from "@/app/(start)/@leaderboard/leaderboard-number";
import RetryButton from "@/ui/retry-button";
import { getLeaderboardResult } from "@/utils/leaderboard";

export default async function LeaderboardSlot() {
  const { entries: leaderboard, error } = await getLeaderboardResult();

  return (
    <div className="pub-leaderboard">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-gold-200/20 pb-3">
        <div>
          <p className="eyebrow mb-1">Ära, berömmelse & ölkunskap</p>
          <h2 className="text-3xl font-normal tracking-tight">
            Pubens topplista
          </h2>
        </div>
        <Trophy className="size-7 text-gold-300" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.55fr)_minmax(0,0.55fr)] gap-3 px-3 pb-2 text-[0.6rem] tracking-[0.04em] text-gold-200/60 sm:text-[0.65rem] sm:tracking-[0.04em]">
        <span>
          <span className="flex sm:hidden">
            <Medal className="size-3.5" strokeWidth={2.1} />
          </span>
          <span className="hidden sm:inline">Placering</span>
        </span>
        <span className="text-right">
          <span className="inline-flex sm:hidden">
            <Trophy className="size-3.5" strokeWidth={2.1} />
          </span>
          <span className="hidden sm:inline">Poäng</span>
        </span>
        <span className="text-right">
          <span className="inline-flex sm:hidden">
            <Target className="size-3.5" strokeWidth={2.1} />
          </span>
          <span className="hidden sm:inline">Träffsäkerhet</span>
        </span>
        <span className="text-right">
          <span className="inline-flex sm:hidden">
            <Flame className="size-3.5" strokeWidth={2.1} />
          </span>
          <span className="hidden sm:inline">Streak</span>
        </span>
      </div>
      {leaderboard.length === 0 ? (
        <div className="py-8 text-center" role="status">
          <p className="mb-4 text-sm text-gold-100/80">
            {error
              ? "Topplistan kunde inte hämtas just nu."
              : "Ingen har spelat klart ännu. Bli först på topplistan!"}
          </p>
          {error ? <RetryButton /> : null}
        </div>
      ) : null}
      <ol className="grid gap-2">
        {leaderboard.map(
          ({ userId, name, score, accuracy, bestStreak, imageUrl }, index) => {
            return (
              <li
                key={userId}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.55fr)_minmax(0,0.55fr)] items-center gap-3 rounded-2xl border border-gold-200/10 bg-gold-50/6 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-gold-300/30 bg-gold-300/12 text-sm font-black text-gold-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-11 sm:w-11 sm:rounded-2xl sm:text-xl">
                    <LeaderboardNumber value={index + 1} />
                  </div>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`${name} profilbild`}
                      width={44}
                      height={44}
                      className="hidden h-11 w-11 rounded-full border border-gold-200/20 object-cover sm:block"
                    />
                  ) : (
                    <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-gold-200/20 bg-gold-50/10 text-sm text-gold-100 sm:grid">
                      {name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm sm:text-lg">{name}</p>
                  </div>
                </div>
                <p className="text-right text-sm sm:text-xl">
                  <LeaderboardNumber value={score} />
                </p>
                <p className="text-right text-sm sm:text-xl">
                  <LeaderboardNumber
                    suffix="%"
                    value={Math.round(accuracy * 100)}
                  />
                </p>
                <p className="text-right text-sm sm:text-xl">
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
