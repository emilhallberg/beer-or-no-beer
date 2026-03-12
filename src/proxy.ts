import { clerkMiddleware } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import {
  GUEST_COOKIE_NAME,
  GUEST_HEADER_NAME,
  GUEST_PREFIX,
} from "@/utils/actor";

function createGuestId() {
  return `${GUEST_PREFIX}${randomUUID()}`;
}

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const requestHeaders = new Headers(request.headers);
  const guestId = request.cookies.get(GUEST_COOKIE_NAME)?.value;

  if (userId) {
    if (guestId?.startsWith(GUEST_PREFIX)) {
      requestHeaders.set(GUEST_HEADER_NAME, guestId);
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    if (guestId?.startsWith(GUEST_PREFIX)) {
      response.cookies.delete(GUEST_COOKIE_NAME);
    }

    return response;
  }

  const ensuredGuestId = guestId?.startsWith(GUEST_PREFIX)
    ? guestId
    : createGuestId();

  requestHeaders.set(GUEST_HEADER_NAME, ensuredGuestId);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set(GUEST_COOKIE_NAME, ensuredGuestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
