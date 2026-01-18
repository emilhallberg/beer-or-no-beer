import { list } from "@vercel/blob";

export default async function LeaderboardSlot() {
  const leaderboard = await list();

  return (
    <div className="grid place-content-center p-4">
      <h1>Leaderboard</h1>
      {JSON.stringify(leaderboard)}
    </div>
  );
}
