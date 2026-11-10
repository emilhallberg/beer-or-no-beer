import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";
import { readFile } from "node:fs/promises";

async function loadSource(file: string) {
  const source = await readFile(new URL(file, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}

const {
  advanceWheelGesture,
  dragOffset,
  pointerVelocity,
  settleSpring,
  swipeAnswer,
} = await loadSource("../src/utils/swipe.ts");
const { shareChallenge } = await loadSource("../src/utils/share-challenge.ts");

test("swipes match button directions and ignore vertical scrolling and accidental taps", () => {
  assert.equal(swipeAnswer(90, 10, 0), true);
  assert.equal(swipeAnswer(-90, 10, 0), false);
  assert.equal(swipeAnswer(40, 80, 1000), null);
  assert.equal(swipeAnswer(4, 0, 1000), null);
  assert.equal(swipeAnswer(25, 0, 600), true);
  assert.equal(swipeAnswer(-25, 0, -600), false);
  assert.equal(swipeAnswer(75, 0, -600), null);
});

test("trackpad momentum answers only once until the gesture is reset", () => {
  let state = { distance: 0, answered: false };
  const answers: boolean[] = [];
  for (const delta of [-12, -25, -40, -30, -20, -8, 4]) {
    const next = advanceWheelGesture(state, delta);
    if (next.answer !== null) answers.push(next.answer);
    state = next;
  }
  assert.deepEqual(answers, [false]);
  assert.equal(
    advanceWheelGesture({ distance: 0, answered: false }, 90).answer,
    true,
  );
});

test("release velocity uses recent movement rather than a noisy final event", () => {
  const velocity = pointerVelocity(
    [
      { x: 0, time: 0 },
      { x: 50, time: 40 },
      { x: 80, time: 70 },
      { x: 79, time: 72 },
    ],
    72,
  );
  assert.equal(swipeAnswer(79, 3, velocity), true);
  assert.equal(
    pointerVelocity(
      [
        { x: 79, time: 72 },
        { x: 79, time: 200 },
      ],
      200,
    ),
    0,
  );
});

test("drag boundaries resist progressively without freezing", () => {
  assert.equal(dragOffset(100), 100);
  assert.ok(dragOffset(160) > dragOffset(140));
  assert.ok(dragOffset(10000) < 280);
  assert.equal(dragOffset(-160), -dragOffset(160));
});

test("spring carries momentum, can reverse, and settles consistently at 60 and 120 Hz", () => {
  assert.ok(settleSpring(100, 500, 0.001).position > 100);
  assert.ok(settleSpring(100, -500, 0.001).position < 100);
  function simulate(fps: number) {
    let point = { position: 100, velocity: 500 };
    for (let i = 0; i < fps; i++)
      point = settleSpring(point.position, point.velocity, 1 / fps);
    return point;
  }
  const a = simulate(60),
    b = simulate(120);
  assert.ok(Math.abs(a.position) < 0.01);
  assert.ok(Math.abs(a.position - b.position) < 0.000001);
});

test("sharing confirms clipboard fallback, leaves cancellation quiet, and reports unsupported sharing", async () => {
  const descriptors = {
    window: Object.getOwnPropertyDescriptor(globalThis, "window"),
    navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"),
  };
  let copied = "";
  const browser = {
    share: undefined as undefined | (() => Promise<void>),
    clipboard: {
      writeText: async (value: string) => {
        copied = value;
      },
    } as { writeText: (value: string) => Promise<void> } | undefined,
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { origin: "http://localhost:3000" } },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: browser,
  });
  try {
    assert.match(await shareChallenge(1000, "A & B"), /kopierad/);
    const url = new URL(copied);
    assert.equal(url.searchParams.get("from"), "A & B");
    assert.equal(url.searchParams.get("score"), "1000");
    browser.share = async () => {
      throw new DOMException("Cancelled", "AbortError");
    };
    copied = "";
    assert.equal(await shareChallenge(1000), "");
    assert.equal(copied, "");
    browser.share = async () => {
      throw new Error("Share failed");
    };
    assert.match(await shareChallenge(1000), /kopierad/);
    browser.clipboard = undefined;
    await assert.rejects(() => shareChallenge(1000));
  } finally {
    for (const key of ["window", "navigator"] as const) {
      const descriptor = descriptors[key];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
