"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Show, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import {
  CircleHelp,
  Home,
  LogIn,
  Menu,
  Share2,
  UserPlus,
  X,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useGame } from "@/app/play/_/game-provider";
import { useChallengeShare } from "@/hooks/use-challenge-share";

const itemClass =
  "flex min-h-12 w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-gold-50 hover:bg-white/10";

export default function BeerMenu() {
  const { user } = useUser();
  const { score, streak } = useGame();
  const pathname = usePathname();
  const menuId = useId();
  const titleId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { share, pending, message } = useChallengeShare(score, user?.fullName);

  useEffect(() => {
    if (!isMenuOpen) return;
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    function outside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node))
        setIsMenuOpen(false);
    }
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isHelpOpen) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isHelpOpen]);

  return (
    <>
      <div
        className="relative"
        ref={containerRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setIsMenuOpen(false);
        }}
      >
        <button
          type="button"
          ref={triggerRef}
          aria-controls={menuId}
          aria-expanded={isMenuOpen}
          className="button-secondary min-w-13"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <Menu className="size-5" aria-hidden="true" />
          <span className="sr-only">Spelmeny</span>
        </button>
        {isMenuOpen ? (
          <div
            id={menuId}
            ref={menuRef}
            aria-label="Spelmeny"
            className="surface absolute right-0 top-[calc(100%+0.5rem)] z-30 grid w-64 max-w-[calc(100vw-2rem)] gap-1 p-2"
          >
            <Link href="/" className={itemClass}>
              <span>Hem</span>
              <Home className="size-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              className={itemClass}
              disabled={pending}
              onClick={() => {
                void share().then(() => {
                  setIsMenuOpen(false);
                  triggerRef.current?.focus();
                });
              }}
            >
              <span>{pending ? "Delar…" : "Utmana en vän"}</span>
              <Share2 className="size-4" aria-hidden="true" />
            </button>
            <Show when="signed-out">
              <SignInButton fallbackRedirectUrl={pathname}>
                <button type="button" className={itemClass}>
                  <span>Logga in</span>
                  <LogIn className="size-4" aria-hidden="true" />
                </button>
              </SignInButton>
              <SignUpButton fallbackRedirectUrl={pathname}>
                <button type="button" className={itemClass}>
                  <span>Skapa konto</span>
                  <UserPlus className="size-4" aria-hidden="true" />
                </button>
              </SignUpButton>
            </Show>
            <button
              type="button"
              className={itemClass}
              onClick={() => {
                setIsMenuOpen(false);
                setIsHelpOpen(true);
              }}
            >
              <span>Så spelar du</span>
              <CircleHelp className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
      <p
        role="status"
        className={
          message
            ? "surface fixed bottom-24 left-4 right-4 z-30 mx-auto max-w-md p-4 text-sm text-gold-50"
            : "sr-only"
        }
      >
        {message}
      </p>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="surface m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto p-6 text-gold-50 backdrop:bg-black/65"
        onCancel={(event) => {
          event.preventDefault();
          setIsHelpOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsHelpOpen(false);
        }}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-bold tracking-tight">
            Så spelar du
          </h2>
          <button
            type="button"
            className="button-secondary min-w-11 px-3"
            onClick={() => setIsHelpOpen(false)}
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Stäng hjälp</span>
          </button>
        </div>
        <div className="space-y-4 text-sm leading-6 text-gold-100/90">
          <p>
            Ett dryckesnamn visas. Välj <strong>Beer</strong> om du tror att det
            är en riktig öl, eller <strong>No Beer</strong> om namnet är fejk.
          </p>
          <p>
            Svep åt höger för Beer och vänster för No Beer. Du kan också använda
            knapparna eller fokusera kortet och använda piltangenterna.
          </p>
          <p>
            Varje rätt svar ger <strong>100 poäng</strong> plus{" "}
            <strong>10 bonuspoäng</strong> per svitnivå. Din nuvarande svit är{" "}
            <strong>{streak}</strong>.
          </p>
          <p>
            Du börjar med tre liv. Ett fel svar kostar ett liv. När alla är slut
            visas din summering.
          </p>
          <p>
            Välj <strong>Utmana en vän</strong> för att dela din poäng på{" "}
            <strong>{score}</strong>.
          </p>
        </div>
      </dialog>
    </>
  );
}
