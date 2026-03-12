"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  SignedOut,
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
  useUser,
} from "@clerk/nextjs";
import {
  CircleHelp,
  Home,
  LogIn,
  Menu,
  Share2,
  UserPlus,
  X,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useGame } from "@/app/play/_/game-provider";

const menuItemClassName =
  "flex w-full items-center justify-between rounded-2xl border border-amber-800/80 bg-amber-950/80 px-4 py-3 text-left text-sm font-bold uppercase tracking-[0.18em] text-amber-50 transition hover:border-amber-500 hover:bg-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300";

export default function BeerMenu() {
  const { user } = useUser();
  const { score, streak } = useGame();
  const pathname = usePathname();
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen && !isHelpOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (isMenuOpen && !containerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsHelpOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isHelpOpen, isMenuOpen]);

  async function onChallenge() {
    const query = new URLSearchParams({});

    if (user?.fullName) {
      query.set("from", user.fullName);
    }

    query.set("score", score.toString());

    const relativeUrl = `/challenge?${query}`;
    const shareUrl = new URL(relativeUrl, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Beer or No Beer?",
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (error) {
      console.debug(error);
    } finally {
      setIsMenuOpen(false);
    }
  }

  function openHelp() {
    setIsHelpOpen(true);
    setIsMenuOpen(false);
  }

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          aria-controls={menuId}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          className="group flex items-center justify-center rounded-full border border-amber-500/60 bg-amber-950/80 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition hover:border-amber-300 hover:bg-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span className="sr-only">Open game menu</span>
          <div className="relative size-14 overflow-hidden rounded-full bg-amber-50/95 ring-2 ring-amber-300/60">
            <Image
              src="/logo.svg"
              alt="Beer or No Beer?"
              fill
              priority
              className="object-contain p-2"
              sizes="56px"
            />
          </div>
          <div className="absolute -right-1 -top-1 rounded-full border border-amber-400 bg-amber-300 p-1 text-amber-950 shadow-sm transition group-hover:scale-105">
            <Menu className="size-3.5" strokeWidth={2.5} />
          </div>
        </button>
        {isMenuOpen ? (
          <div
            id={menuId}
            role="menu"
            className="absolute left-1/2 top-[calc(100%+0.75rem)] z-30 grid min-w-64 -translate-x-1/2 gap-2 rounded-[1.75rem] border-2 border-amber-700 bg-[var(--background)] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <Link
              href="/"
              className={menuItemClassName}
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Home</span>
              <Home className="size-4" strokeWidth={2.25} />
            </Link>
            <button
              type="button"
              className={menuItemClassName}
              role="menuitem"
              onClick={onChallenge}
            >
              <span>Challenge</span>
              <Share2 className="size-4" strokeWidth={2.25} />
            </button>
            <SignedOut>
              <ClerkSignInButton fallbackRedirectUrl={pathname}>
                <button
                  type="button"
                  className={menuItemClassName}
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Sign In</span>
                  <LogIn className="size-4" strokeWidth={2.25} />
                </button>
              </ClerkSignInButton>
              <ClerkSignUpButton fallbackRedirectUrl={pathname}>
                <button
                  type="button"
                  className={menuItemClassName}
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Sign Up</span>
                  <UserPlus className="size-4" strokeWidth={2.25} />
                </button>
              </ClerkSignUpButton>
            </SignedOut>
            <button
              type="button"
              className={menuItemClassName}
              role="menuitem"
              onClick={openHelp}
            >
              <span>Help</span>
              <CircleHelp className="size-4" strokeWidth={2.25} />
            </button>
          </div>
        ) : null}
      </div>
      {isHelpOpen ? (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-6"
          onClick={() => setIsHelpOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="beer-menu-help-title"
            className="w-full max-w-sm rounded-[2rem] border-2 border-amber-700 bg-[var(--background)] p-6 text-amber-50 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                  How To Play
                </p>
                <h2
                  id="beer-menu-help-title"
                  className="mt-2 text-2xl font-bold"
                >
                  Beer or No Beer?
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-amber-600 p-2 text-amber-200 transition hover:bg-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                onClick={() => setIsHelpOpen(false)}
              >
                <span className="sr-only">Close help</span>
                <X className="size-4" strokeWidth={2.25} />
              </button>
            </div>
            <div className="space-y-4 text-sm leading-6 text-amber-100/90">
              <p>
                A drink name appears on screen. Pick <strong>Beer</strong> if
                you think it is a real brew, or <strong>No Beer</strong> if it
                is fake.
              </p>
              <p>
                Every correct guess adds points. Your current streak is{" "}
                <strong>{streak}</strong>. Each correct answer gives{" "}
                <strong>100</strong> points plus <strong>10</strong> bonus
                points per streak level.
              </p>
              <p>
                You start with three lives. A wrong answer costs one life, and
                the run ends when they are gone. Your current score is{" "}
                <strong>{score}</strong>.
              </p>
              <p>
                Use <strong>Challenge</strong> to share your score and see if
                someone else can beat it.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
