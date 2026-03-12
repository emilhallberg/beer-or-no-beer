import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

import { cookies, headers } from "next/headers";

import { createClient } from "@/utils/supabase/server";

const GUEST_COOKIE_NAME = "guestId" as const;
const GUEST_HEADER_NAME = "x-guest-id" as const;
const GUEST_PREFIX = "guest:" as const;

const migrateGuestGamesToUser = cache(
  async (guestId: string, userId: string) => {
    const supabase = await createClient();
    const migration = await supabase
      .from("games")
      .update({ userId })
      .eq("userId", guestId);

    if (migration.error) {
      console.error("Guest games not migrated", migration.error);
    }
  },
);

function isGuestId(
  value: string | null | undefined,
): value is `${typeof GUEST_PREFIX}${string}` {
  return typeof value === "string" && value.startsWith(GUEST_PREFIX);
}

function persistGuestIdCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  guestId: string,
) {
  try {
    cookieStore.set(GUEST_COOKIE_NAME, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch {
    // Server Components cannot mutate cookies. Proxy covers normal requests.
  }
}

export async function getActorId() {
  const [{ userId }, cookieStore, headerStore] = await Promise.all([
    auth(),
    cookies(),
    headers(),
  ]);

  const guestId = [
    cookieStore.get(GUEST_COOKIE_NAME)?.value,
    headerStore.get(GUEST_HEADER_NAME),
  ].find(isGuestId);

  if (userId) {
    if (guestId && guestId !== userId) {
      await migrateGuestGamesToUser(guestId, userId);
    }

    return userId;
  }

  if (guestId) {
    persistGuestIdCookie(cookieStore, guestId);
    return guestId;
  }

  // Fallback for contexts that do not pass through proxy, such as isolated tests.
  const generatedGuestId = `${GUEST_PREFIX}${randomUUID()}`;
  persistGuestIdCookie(cookieStore, generatedGuestId);
  return generatedGuestId;
}

export function isActorGuest(actorId: string) {
  return isGuestId(actorId);
}

export { GUEST_COOKIE_NAME, GUEST_HEADER_NAME, GUEST_PREFIX };
