"use server";

import { auth } from "@clerk/nextjs/server";
import { list, put } from "@vercel/blob";

const KEY = "leaderboard";

export type UserEntry = { userId: string; name: string; score: number };

export async function getLeaderboard() {
  const leaderboard = await list({ prefix: `${KEY}/` });

  return Promise.all(
    leaderboard.blobs.map(({ url }) =>
      fetch(url, { cache: "no-cache" })
        .then((response) => response.json())
        .catch(() => null),
    ),
  ).then((blobs) => {
    return blobs
      .reduce<Array<UserEntry>>((arr, blob) => {
        if (blob) return [...arr, blob];
        return arr;
      }, [])
      .sort((a, b) => b.score - a.score);
  });
}

export async function getUserEntry(): Promise<UserEntry | null> {
  const { userId } = await auth();

  return getLeaderboard().then(
    (leaderboard) =>
      leaderboard.find(({ userId }) => userId === userId) ?? null,
  );
}

export async function updateLeaderboard(name: string, score: number) {
  const { userId } = await auth();

  const blob = { userId, name, score };
  console.debug("Update leaderboard", blob);

  return put(`${KEY}/${userId}`, JSON.stringify(blob), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  })
    .then((result) => {
      console.debug("Leaderboard updated", result);
      return result;
    })
    .catch((error) => {
      console.error("Leaderboard not updated", error);
      return null;
    });
}

export type Leaderboard = Awaited<ReturnType<typeof getLeaderboard>>;
