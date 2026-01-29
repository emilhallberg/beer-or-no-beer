"use client";

import { useEffect } from "react";

import { BEER_STORAGE_KEY } from "@/app/play/_/game-provider";

export default function ResetLocalStorage() {
  useEffect(() => {
    localStorage.removeItem(BEER_STORAGE_KEY);
  }, []);

  return null;
}
