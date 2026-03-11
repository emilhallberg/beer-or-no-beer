"use client";

import { useEffect } from "react";

import { BEER_STORAGE_KEY } from "@/app/play/_/game-provider";

export default function ResetLocalStorage() {
  useEffect(() => {
    for (const key of Object.keys(localStorage)) {
      if (key === BEER_STORAGE_KEY || key.startsWith(`${BEER_STORAGE_KEY}:`)) {
        localStorage.removeItem(key);
      }
    }
  }, []);

  return null;
}
