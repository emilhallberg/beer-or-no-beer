import { getLeaderboard } from "@/utils/leaderboard";

export default async function LeaderboardSlot() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="flex flex-col p-4 text-center bg-amber-500 border-8 border-amber-950 rounded-4xl min-h-[80vh] mb-6">
      <h1 className="text-2xl uppercase">Leaderboard</h1>
      <ol>
        {leaderboard.map(({ userId, name, score }, index) => {
          return (
            <li
              key={userId}
              className="h-15 grid items-center text-xl uppercase"
            >
              {index + 1}. {name} - {score}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
