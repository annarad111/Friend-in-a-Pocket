"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJournalStore } from "@/store/useJournalStore";
import { MoodSticker } from "@/components/Journal/MoodSticker/MoodSticker";
import { MOOD_INDEX } from "@/components/Journal/MoodSticker/moods";
import type { FutureLetter } from "@/types/journal";
import styles from "./LetterDelivery.module.scss";

type Props = {
  letter: FutureLetter;
  friendName: string;
  onClose?: () => void;
};

export const LetterDelivery = ({ letter, friendName, onClose }: Props) => {
  const markLetterOpened = useJournalStore((s) => s.markLetterOpened);
  const dismissPendingLetter = useJournalStore((s) => s.dismissPendingLetter);

  const [opened, setOpened] = useState(false);

  const writtenDate = new Date(letter.writtenAt).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const monthsAgo = Math.round(
    (Date.now() - new Date(letter.writtenAt).getTime()) /
      (1000 * 60 * 60 * 24 * 30),
  );
  const timeLabel =
    monthsAgo < 1
      ? "a few days"
      : monthsAgo === 1
        ? "1 month"
        : monthsAgo < 12
          ? `${monthsAgo} months`
          : `${Math.round(monthsAgo / 12)} year${Math.round(monthsAgo / 12) !== 1 ? "s" : ""}`;

  const handleOpen = () => {
    setOpened(true);
    markLetterOpened(letter.id);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      dismissPendingLetter();
    }
  };

  return (
    <div className={styles.overlay} onClick={!opened ? undefined : undefined}>
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="envelope"
            className={styles.envelopeWrap}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className={styles.envelopeOuter} onClick={handleOpen}>
              <EnvelopeSVG />
            </div>

            <div className={styles.envelopeLabel}>
              <h2>A letter has arrived.</h2>
              <p>
                {friendName} kept this safe for {timeLabel}.
              </p>
              <p className={styles.tapHint}>tap the envelope to open it</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            className={styles.letterWrap}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className={styles.letterHeader}>
              <h2>A letter from {timeLabel} ago.</h2>
              <p>written by past you · {writtenDate}</p>
            </div>

            <div className={styles.paperWrap}>
              <div className={styles.paper}>
                <p className={styles.pastDate}>{writtenDate}</p>
                <p className={styles.letterBody}>{letter.body}</p>

                {letter.mood && (
                  <div className={styles.letterMoodRow}>
                    <MoodSticker mood={letter.mood} size={32} rotate={-4} />
                    <span className={styles.letterMoodLabel}>
                      past you was feeling{" "}
                      {MOOD_INDEX[letter.mood]?.label?.toLowerCase() ??
                        letter.mood}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button className={styles.closeButton} onClick={handleClose}>
              I&rsquo;ve read this
            </button>
            <p className={styles.tapNote}>
              you can re-read this anytime in your letters
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EnvelopeSVG = () => (
  <svg
    className={styles.envelopeSvg}
    viewBox="0 0 320 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Sealed envelope"
  >
    {/* envelope body */}
    <rect
      x="8"
      y="30"
      width="304"
      height="162"
      rx="12"
      fill="#fffaf4"
      stroke="rgba(192,143,255,0.5)"
      strokeWidth="1.5"
    />
    {/* envelope back flap (closed) */}
    <path
      d="M8 42 L160 130 L312 42"
      stroke="rgba(192,143,255,0.4)"
      strokeWidth="1.2"
      fill="none"
    />
    {/* envelope front fold lines */}
    <path
      d="M8 192 L120 110"
      stroke="rgba(192,143,255,0.25)"
      strokeWidth="1"
    />
    <path
      d="M312 192 L200 110"
      stroke="rgba(192,143,255,0.25)"
      strokeWidth="1"
    />
    {/* top flap (closed, triangular) */}
    <path
      d="M8 30 L160 118 L312 30 Z"
      fill="rgba(192,143,255,0.12)"
      stroke="rgba(192,143,255,0.45)"
      strokeWidth="1.2"
    />
    {/* wax seal circle */}
    <circle cx="160" cy="116" r="18" fill="rgba(124,92,255,0.85)" />
    <circle
      cx="160"
      cy="116"
      r="14"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1"
      fill="none"
    />
    {/* star inside seal */}
    <path
      d="M160 104 L162 112 L170 112 L164 117 L166 125 L160 120 L154 125 L156 117 L150 112 L158 112 Z"
      fill="rgba(255,255,255,0.85)"
    />
    {/* "to:" text area suggestion */}
    <rect
      x="28"
      y="140"
      width="80"
      height="6"
      rx="3"
      fill="rgba(192,143,255,0.15)"
    />
    <rect
      x="28"
      y="152"
      width="60"
      height="6"
      rx="3"
      fill="rgba(192,143,255,0.1)"
    />
    {/* stamp suggestion top right */}
    <rect
      x="252"
      y="48"
      width="40"
      height="28"
      rx="4"
      fill="rgba(217,122,138,0.15)"
      stroke="rgba(217,122,138,0.3)"
      strokeWidth="1"
    />
    <path
      d="M252 55 H292 M252 68 H292"
      stroke="rgba(217,122,138,0.3)"
      strokeWidth="0.8"
    />
  </svg>
);
