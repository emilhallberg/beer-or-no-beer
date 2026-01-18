import { getLeaderboard } from "@/utils/leaderboard";

export default async function LeaderboardSlot() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="grid place-content-center p-4">
      <h1>Leaderboard</h1>
      <ol>
        {leaderboard.map(({ userId, name, score }, index) => {
          return (
            <li key={userId}>
              {index + 1}. {name} - {score}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
