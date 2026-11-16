"use client";

import { Show } from "@clerk/nextjs";
import {
  Beer,
  Check,
  ChevronDown,
  Flame,
  Target,
  Trophy,
  X,
} from "lucide-react";

import ChallengeButton from "@/app/play/_/challenge-button";
import HomeButton from "@/app/play/_/home-button";
import PlayAgainButton from "@/app/play/_/play-again-button";
import SignInButton from "@/app/play/_/sign-in-button";
import BeerArt from "@/ui/beer-art";
import { ChallengeOutcome } from "@/ui/challenge-progress";
import PromoCard from "@/ui/promo-card";
import type { CompletedGameSummary } from "@/utils/game";
import type { Promo } from "@/utils/promo-types";

type Props = CompletedGameSummary & { gameId: number; promo: Promo | null };
const number = new Intl.NumberFormat("sv-SE");

export default function SummaryScreen({
  gameId,
  newHighScore,
  overallRank,
  promo,
  result,
  score,
  stats,
  totalRankedPlayers,
}: Props) {
  const lastHit = result.findLast((item) => item.correct);
  const title = newHighScore
    ? "Nytt rekord. Skål!"
    : stats.accuracy >= 0.7
      ? "Du har näsa för öl."
      : "En till på magkänslan?";

  return (
    <div className="round-summary">
      <div className="summary-shell">
        <nav className="summary-nav" aria-label="Resultatnavigation">
          <span className="brand-compact">BEER OR NO BEER?</span>
          <HomeButton />
        </nav>

        <section className="summary-ticket" aria-labelledby="summary-title">
          <div className="summary-hero">
            <div className="summary-copy">
              <p className="eyebrow">Runda #{gameId} · I mål!</p>
              <h1 id="summary-title">{title}</h1>
              <p className="summary-description">
                {newHighScore
                  ? "Din bästa runda hittills. Den är värd att utmana en vän med."
                  : stats.accuracy >= 0.7
                    ? "Den magkänslan är värd att lita på. Kan du slå det nästa gång?"
                    : "Några namn lurade dig. Nästa runda, nya chanser."}
              </p>
              <div className="summary-points">
                <span className="eyebrow">Du kammade hem</span>
                <p>
                  <strong>{number.format(score)}</strong>
                  <span>poäng</span>
                </p>
              </div>
              {newHighScore ? (
                <p className="summary-record">
                  <Trophy size={16} aria-hidden="true" /> Personbästa!
                </p>
              ) : null}
              {overallRank !== null ? (
                <p className="summary-ranking">
                  <Trophy size={16} aria-hidden="true" /> #{overallRank} av{" "}
                  {number.format(totalRankedPlayers)} på topplistan
                </p>
              ) : null}
            </div>
            <div className="summary-art-stage" aria-hidden="true">
              <span className="summary-spark summary-spark-one">✦</span>
              <span className="summary-spark summary-spark-two">✳</span>
              <div className="summary-character">
                <div className="summary-character-top">
                  BEER OR
                  <br />
                  NO BEER?
                </div>
                <div className="summary-character-art">
                  <BeerArt
                    seed={gameId}
                    beerName={lastHit?.beer.name}
                    priority
                    sizes="(max-width: 639px) 145px, 260px"
                  />
                </div>
                <div className="summary-character-bottom">
                  LITA PÅ MAGKÄNSLAN ★
                </div>
              </div>
              <span className="summary-sticker">
                En runda
                <br />
                till?
              </span>
            </div>
          </div>
          <div className="summary-ticket-bottom">
            <ChallengeOutcome gameId={gameId} score={score} />
            <div className="summary-actions">
              <PlayAgainButton gameId={gameId} score={score} />
              <ChallengeButton score={score} />
            </div>
          </div>
        </section>

        <section className="summary-stats" aria-label="Rundan i siffror">
          <div>
            <Check aria-hidden="true" />
            <p>
              <strong>
                {stats.correctGuesses}
                <span> / {stats.totalGuesses}</span>
              </strong>
              <span>Rätta svar</span>
            </p>
          </div>
          <div>
            <Target aria-hidden="true" />
            <p>
              <strong>
                {Math.round(stats.accuracy * 100)}
                <span>%</span>
              </strong>
              <span>Träffsäkerhet</span>
            </p>
          </div>
          <div>
            <Flame aria-hidden="true" />
            <p>
              <strong>{stats.bestStreak}</strong>
              <span>Bästa svit</span>
            </p>
          </div>
        </section>

        <Show when="signed-out">
          <aside className="summary-sign-in">
            <Trophy size={24} aria-hidden="true" />
            <div>
              <h2>Ta plats på topplistan.</h2>
              <p>Logga in för att koppla rundan till ditt konto.</p>
            </div>
            <SignInButton />
          </aside>
        </Show>

        <section className="summary-recap" aria-label="Rundans facit">
          <details>
            <summary>
              <div>
                <span className="eyebrow">Vilka namn lurade dig?</span>
                <h2>Synar vi rundan?</h2>
                <p>Se facit för dina {stats.totalGuesses} gissningar</p>
              </div>
              <span className="summary-recap-toggle">
                <ChevronDown aria-hidden="true" />
              </span>
            </summary>
            <div className="summary-recap-content">
              <p className="summary-mix">
                <Beer size={16} aria-hidden="true" /> {stats.realBeers} riktiga
                öl · {stats.fakeBeers} fejköl
              </p>
              <ol>
                {result.map((item, index) => (
                  <li
                    key={`${item.beer.id}-${item.createdAt}`}
                    className={`summary-guess ${item.correct ? "is-correct" : "is-wrong"}`}
                  >
                    <span className="summary-guess-icon">
                      {item.correct ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <X aria-hidden="true" />
                      )}
                    </span>
                    <div className="summary-guess-copy">
                      <span className="summary-guess-meta">
                        #{index + 1} · {item.correct ? "Rätt" : "Fel"} ·{" "}
                        {item.beer.type} · {item.beer.abv.toFixed(1)}%
                      </span>
                      <h3>{item.beer.name}</h3>
                      <p>
                        <strong>
                          {item.correctAnswer ? "Beer" : "No Beer"}
                        </strong>
                        {item.correctAnswer
                          ? ` · ${item.beer.brewery}`
                          : " · Ett påhittat ölnamn"}
                      </p>
                      {!item.correct ? (
                        <p className="summary-your-guess">
                          Du gissade {item.guess ? "Beer" : "No Beer"}
                        </p>
                      ) : null}
                    </div>
                    <span className="summary-guess-points">
                      {item.pointsAwarded > 0
                        ? `+${number.format(item.pointsAwarded)}`
                        : "0"}
                      <span>poäng</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        </section>
        {promo ? <PromoCard gameId={gameId} promo={promo} /> : null}
        <p className="summary-footer">
          Bryggd på magkänsla. Serverad med en nypa bluff.
        </p>
      </div>
    </div>
  );
}
