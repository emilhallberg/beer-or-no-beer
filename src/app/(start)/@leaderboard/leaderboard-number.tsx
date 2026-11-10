"use client";

import NumberFlow from "@number-flow/react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

type Props = {
  suffix?: string;
  value: number;
};

export default function LeaderboardNumber({ suffix, value }: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <span className="inline-flex items-baseline justify-end">
      <NumberFlow
        animated={!reducedMotion}
        className="tabular-nums"
        value={value}
      />
      {suffix ? <span>{suffix}</span> : null}
    </span>
  );
}
