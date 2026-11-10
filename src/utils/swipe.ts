export function dragOffset(distance: number, limit = 140) {
  const overshoot = Math.max(0, Math.abs(distance) - limit);
  return (
    Math.sign(distance) *
    (Math.min(Math.abs(distance), limit) +
      (overshoot * limit) / (limit + overshoot))
  );
}

// Analytic, critically damped spring; stable across frame rates and interruptions.
export function settleSpring(
  position: number,
  velocity: number,
  seconds: number,
) {
  const frequency = 20;
  const decay = Math.exp(-frequency * seconds);
  const coefficient = velocity + frequency * position;
  return {
    position: (position + coefficient * seconds) * decay,
    velocity: (velocity - frequency * coefficient * seconds) * decay,
  };
}

export function swipeAnswer(
  distance: number,
  verticalDistance: number,
  velocity: number,
) {
  if (
    Math.abs(distance) < 10 ||
    Math.abs(distance) <= Math.abs(verticalDistance)
  )
    return null;
  const projected = distance + Math.max(-1500, Math.min(1500, velocity)) * 0.12;
  return Math.abs(projected) >= 72 ? projected > 0 : null;
}

export function pointerVelocity(
  samples: { x: number; time: number }[],
  now: number,
) {
  const recent = samples.filter((sample) => now - sample.time <= 80);
  const first = recent[0];
  const last = recent[recent.length - 1];
  if (!first || !last || last.time - first.time < 8) return 0;
  return Math.max(
    -1500,
    Math.min(1500, ((last.x - first.x) / (last.time - first.time)) * 1000),
  );
}

export function advanceWheelGesture(
  state: { distance: number; answered: boolean },
  delta: number,
) {
  const distance = state.distance + delta;
  const answer = state.answered ? null : swipeAnswer(distance, 0, 0);
  return { distance, answered: state.answered || answer !== null, answer };
}
