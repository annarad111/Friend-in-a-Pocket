"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useJournalStore } from "@/store/useJournalStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { NotebookPage } from "@/components/Journal/NotebookPage/NotebookPage";
import { MoodSticker } from "@/components/Journal/MoodSticker/MoodSticker";
import { MOODS } from "@/components/Journal/MoodSticker/moods";
import { WashiTape } from "@/components/Journal/JournalDecor/WashiTape";
import type { FutureLetter, MoodKey } from "@/types/journal";
import styles from "./LetterWriter.module.scss";

type DeliveryOption = { label: string; months: number };

const DELIVERY_OPTIONS: DeliveryOption[] = [
  { label: "3 months", months: 3 },
  { label: "6 months", months: 6 },
  { label: "12 months", months: 12 },
];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeSince(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

function timeUntil(isoDate: string): string {
  const ms = new Date(isoDate).getTime() - Date.now();
  if (ms <= 0) return "ready to open";
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""}`;
}

type LetterWriterProps = {
  onLetterOpened?: (letter: FutureLetter) => void;
};

export const LetterWriter = ({ onLetterOpened }: LetterWriterProps) => {
  const profile = useOnboardingStore((s) => s.profile);
  const friendName = profile?.friendName?.trim() || "your friend";

  const letters = useJournalStore((s) => s.letters);
  const addLetter = useJournalStore((s) => s.addLetter);
  const deleteLetter = useJournalStore((s) => s.deleteLetter);
  const checkDeliverableLetters = useJournalStore(
    (s) => s.checkDeliverableLetters,
  );
  const markLetterOpened = useJournalStore((s) => s.markLetterOpened);
  const loadJournal = useJournalStore((s) => s.loadJournal);

  const [view, setView] = useState<"list" | "write">("list");
  const [body, setBody] = useState("");
  const [deliveryMonths, setDeliveryMonths] = useState<number>(6);
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [confirmed, setConfirmed] = useState<FutureLetter | null>(null);

  useEffect(() => {
    loadJournal();
    checkDeliverableLetters();
  }, [loadJournal, checkDeliverableLetters]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 420)}px`;
  }, [body]);

  const deliverAt = useMemo(
    () => addMonths(new Date(), deliveryMonths).toISOString(),
    [deliveryMonths],
  );
  const deliverDate = useMemo(
    () => addMonths(new Date(), deliveryMonths),
    [deliveryMonths],
  );
  const wordCount = useMemo(() => {
    const t = body.trim();
    return t ? t.split(/\s+/).length : 0;
  }, [body]);

  const canSeal = body.trim().length > 0;

  const handleSeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSeal) return;
    const letter = addLetter(body, deliverAt, mood);
    setConfirmed(letter);
    setBody("");
    setMood(null);
  };

  const handleDismissConfirm = () => {
    setConfirmed(null);
    setView("list");
  };

  const handleOpenLetter = (letter: FutureLetter) => {
    markLetterOpened(letter.id);
    onLetterOpened?.(letter);
  };

  const sorted = useMemo(
    () =>
      [...letters].sort((a, b) => {
        const order = { delivered: 0, scheduled: 1, opened: 2 };
        return (order[a.status] ?? 2) - (order[b.status] ?? 2);
      }),
    [letters],
  );

  const todayIso = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={styles.stage}>
      <DreamyBackdrop />

      <div className={styles.layout}>
        <header className={styles.topBar}>
          <Link href="/" className={styles.backLink}>
            ← back to chat
          </Link>

          <div className={styles.topTitle}>
            <h1>letters through time</h1>
            <p>from you, to you</p>
          </div>
          <span className={styles.topSpacer} />
        </header>

        {view === "write" ? (
          <>
            <div style={{ position: "relative" }}>
              <WashiTape
                color="lav"
                pattern="stripes"
                width={100}
                height={22}
                rotate={-6}
                style={{ top: -11, left: 30, zIndex: 3 }}
              />

              <NotebookPage
                width={652}
                height={600}
                tilt={-0.4}
                binding="spiral"
                cornerCurl
              >
                <form className={styles.page} onSubmit={handleSeal}>
                  <div className={styles.pageHeader}>
                    <div className={styles.toLine}>
                      To:{" "}
                      <span>
                        {friendName}, {deliveryMonths} months from now
                      </span>
                    </div>
                    <div className={styles.dateLine}>{todayIso}</div>
                  </div>

                  <label className={styles.writingLabel} htmlFor="letter-body">
                    say what you need to say — past you will mean it
                  </label>
                  <textarea
                    ref={textareaRef}
                    id="letter-body"
                    className={styles.writing}
                    placeholder="Dear future me, right now I'm feeling..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                  />

                  <div className={styles.deliverySection}>
                    <p className={styles.deliveryLabel}>
                      deliver this letter in —
                    </p>
                    <div className={styles.deliveryOptions}>
                      {DELIVERY_OPTIONS.map((opt) => (
                        <button
                          key={opt.months}
                          type="button"
                          className={[
                            styles.deliveryPill,
                            deliveryMonths === opt.months &&
                              styles.deliveryPillActive,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => setDeliveryMonths(opt.months)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className={styles.deliveryHint}>
                      arrives around {formatDeliveryDate(deliverDate)}
                    </p>
                  </div>

                  <div className={styles.moodSection}>
                    <p className={styles.moodLabel}>
                      how are you feeling right now? (optional)
                    </p>
                    <div className={styles.moodRow} role="radiogroup">
                      {MOODS.map((m, i) => (
                        <MoodSticker
                          key={m.key}
                          mood={m.key}
                          size={36}
                          rotate={i % 2 === 0 ? -3 : 3}
                          selected={mood === m.key}
                          dimmed={mood !== null && mood !== m.key}
                          onClick={() => setMood(mood === m.key ? null : m.key)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={styles.footer}>
                    <span className={styles.wordCount}>
                      {wordCount} {wordCount === 1 ? "word" : "words"} · sealed
                      on send
                    </span>
                    <button
                      type="submit"
                      className={styles.sealButton}
                      disabled={!canSeal}
                    >
                      Seal this letter →
                    </button>
                  </div>
                </form>
              </NotebookPage>
            </div>
          </>
        ) : (
          <div className={styles.listSection}>
            <p className={styles.listTitle}>your sealed letters</p>
            <button
              type="button"
              className={styles.writeButton}
              onClick={() => setView("write")}
            >
              + write a new letter
            </button>
            {sorted.length === 0 ? (
              <p className={styles.emptyList}>
                no letters yet — write one and meet yourself later.
              </p>
            ) : (
              sorted.map((letter) => (
                <LetterListItem
                  key={letter.id}
                  letter={letter}
                  onOpen={handleOpenLetter}
                  onDelete={deleteLetter}
                />
              ))
            )}
          </div>
        )}
      </div>

      {confirmed && (
        <LetterConfirmation
          letter={confirmed}
          friendName={friendName}
          onDismiss={handleDismissConfirm}
        />
      )}
    </div>
  );
};

type LetterListItemProps = {
  letter: FutureLetter;
  onOpen: (letter: FutureLetter) => void;
  onDelete: (id: string) => void;
};

const LetterListItem = ({ letter, onOpen, onDelete }: LetterListItemProps) => {
  const preview = letter.body.slice(0, 80).replace(/\n/g, " ");
  const isDelivered = letter.status === "delivered";
  const isScheduled = letter.status === "scheduled";
  const isOpened = letter.status === "opened";

  return (
    <div className={styles.letterItem}>
      <span className={styles.letterIcon} aria-hidden="true">
        {isDelivered ? "📬" : isOpened ? "📖" : "📩"}
      </span>
      <div className={styles.letterMeta}>
        <p
          className={[
            styles.letterStatus,
            isScheduled && styles.statusScheduled,
            isDelivered && styles.statusDelivered,
            isOpened && styles.statusOpened,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isScheduled && `opens in ${timeUntil(letter.deliverAt)}`}
          {isDelivered && "arrived — ready to read"}
          {isOpened && "read"}
        </p>
        <p className={styles.letterDate}>
          written {timeSince(letter.writtenAt)} ·{" "}
          {isScheduled &&
            `arrives ${new Date(letter.deliverAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`}
          {(isDelivered || isOpened) &&
            `arrived ${new Date(letter.deliverAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`}
        </p>
        <p className={styles.letterPreview}>
          {isScheduled ? "✦ sealed — contents hidden until delivery" : preview}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {isDelivered && (
          <button
            type="button"
            className={`${styles.letterAction} ${styles.openAction}`}
            onClick={() => onOpen(letter)}
          >
            Open →
          </button>
        )}
        {isOpened && (
          <button
            type="button"
            className={`${styles.letterAction} ${styles.openAction}`}
            onClick={() => onOpen(letter)}
          >
            Re-read
          </button>
        )}
        {isScheduled && (
          <button
            type="button"
            className={`${styles.letterAction} ${styles.deleteAction}`}
            onClick={() => onDelete(letter.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

type ConfirmationProps = {
  letter: FutureLetter;
  friendName: string;
  onDismiss: () => void;
};

const LetterConfirmation = ({
  letter,
  friendName,
  onDismiss,
}: ConfirmationProps) => (
  <div className={styles.confirmOverlay}>
    <div className={styles.confirmCard}>
      <span className={styles.confirmIcon}>📩</span>
      <h2 className={styles.confirmTitle}>Sealed and tucked away.</h2>
      <p className={styles.confirmText}>
        {friendName} will hold onto this letter until{" "}
        <strong>
          {new Date(letter.deliverAt).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </strong>
        . Future you will find it waiting here when it&rsquo;s time.
      </p>
      <button className={styles.confirmButton} onClick={onDismiss}>
        Back to my letters
      </button>
    </div>
  </div>
);

const DreamyBackdrop = () => (
  <div className={styles.backdrop} aria-hidden="true">
    <div className={styles.stars} />
    <div className={`${styles.glow} ${styles.glowA}`} />
    <div className={`${styles.glow} ${styles.glowB}`} />
  </div>
);
