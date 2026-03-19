import { auth } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";

function getAdminUserIds() {
  return new Set(
    (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export async function isCurrentUserAdmin() {
  const { userId } = await auth();

  if (!userId) return false;

  return getAdminUserIds().has(userId);
}

export async function requireAdminUser() {
  if (!(await isCurrentUserAdmin())) {
    redirect("/");
  }
}
