"use client";

import {
  createContext,
  type CSSProperties,
  type ReactNode,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { Beer, Volume2, VolumeX } from "lucide-react";

import {
  type AnswerFeedback,
  GAME_ANSWER_EVENT,
} from "@/app/play/_/game-events";
import { playAnswerSound } from "@/utils/game-audio";

const SoundContext = createContext<{
  enabled: boolean;
  toggle: () => void;
} | null>(null);
const SOUND_KEY = "beer-sound-v1";

export function GameFeel({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [feedback, setFeedback] = useState<
    (AnswerFeedback & { id: number }) | null
  >(null);
  const audioRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(false);

  function play(correct: boolean, streak: number) {
    if (!enabledRef.current) return;
    try {
      const context = audioRef.current ?? new AudioContext();
      audioRef.current = context;
      void context.resume().catch(() => {});
      playAnswerSound(context, correct, streak);
    } catch {
      /* Audio is optional when a browser does not support it. */
    }
  }

  useEffect(() => {
    try {
      enabledRef.current = localStorage.getItem(SOUND_KEY) === "on";
      setEnabled(enabledRef.current);
    } catch {
      /* Keep sound off when storage is unavailable. */
    }
    let timer: ReturnType<typeof setTimeout>;
    let sequence = 0;
    function answer(event: Event) {
      const detail = (event as CustomEvent<AnswerFeedback>).detail;
      clearTimeout(timer);
      setFeedback({ ...detail, id: ++sequence });
      play(detail.correct, detail.streak);
      timer = setTimeout(() => setFeedback(null), 1450);
    }
    window.addEventListener(GAME_ANSWER_EVENT, answer);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(GAME_ANSWER_EVENT, answer);
      void audioRef.current?.close().catch(() => {});
      audioRef.current = null;
    };
  }, []);

  function toggle() {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {
      /* Optional preference. */
    }
    if (next) play(true, 0);
  }

  return (
    <SoundContext value={{ enabled, toggle }}>
      {children}
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {feedback
          ? `${feedback.correct ? "Rätt" : "Fel"}. ${feedback.name}: ${feedback.real ? "Beer" : "No Beer"}. ${feedback.correct ? `+${feedback.points} poäng` : "Ett liv mindre"}.`
          : ""}
      </p>
      {feedback?.correct && feedback.streak >= 3 ? (
        <div key={feedback.id} className="beer-burst" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <span
              key={index}
              style={
                {
                  "--x": `${(index % 2 ? 1 : -1) * (70 + index * 22)}px`,
                  "--y": `${-100 - (index % 4) * 55}px`,
                  "--spin": `${(index % 2 ? 1 : -1) * (30 + index * 17)}deg`,
                  "--delay": `${index * 20}ms`,
                } as CSSProperties
              }
            >
              {index % 3 === 0 ? (
                "✦"
              ) : (
                <Beer size={28 + (index % 3) * 6} strokeWidth={1.8} />
              )}
            </span>
          ))}
        </div>
      ) : null}
    </SoundContext>
  );
}

export function SoundToggle() {
  const sound = use(SoundContext);
  if (!sound) return null;
  const Icon = sound.enabled ? Volume2 : VolumeX;
  return (
    <button
      type="button"
      className="sound-toggle"
      aria-pressed={sound.enabled}
      aria-label={sound.enabled ? "Stäng av spelljud" : "Slå på spelljud"}
      onClick={sound.toggle}
    >
      <Icon size={17} aria-hidden="true" />
      <span>Ljud {sound.enabled ? "på" : "av"}</span>
    </button>
  );
}
