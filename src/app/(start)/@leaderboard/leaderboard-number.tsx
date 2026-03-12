"use client";

import NumberFlow from "@number-flow/react";

type Props = {
  suffix?: string;
  value: number;
};

export default function LeaderboardNumber({ suffix, value }: Props) {
  return (
    <span className="inline-flex items-baseline justify-end">
      <NumberFlow className="tabular-nums" value={value} />
      {suffix ? <span>{suffix}</span> : null}
    </span>
  );
}
