"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useMemo } from "react";
import { useJournalStore } from "@/store/useJournalStore";
import { MoodSticker } from "@/components/Journal/MoodSticker/MoodSticker";
import { MOOD_INDEX } from "@/components/Journal/MoodSticker/moods";
import { NotebookPage } from "@/components/Journal/NotebookPage/NotebookPage";
import { Stamp } from "@/components/Journal/JournalDecor/Stamp";
import { Doodle } from "@/components/Journal/JournalDecor/Doodle";
import { WashiTape } from "@/components/Journal/JournalDecor/WashiTape";
import type { JournalEntry } from "@/types/journal";
import styles from "./PastChapters.module.scss";

const STAMP_COLORS: Record<string, string> = {
  hopeful: "#3aa56e",
  sunny: "#c98a1a",
  sparkly: "#6f4cd1",
  cozy: "#a8472a",
  calm: "#3d6bb4",
  cloudy: "#7e7898",
  foggy: "#7e7898",
  stormy: "#3d3552",
  heavy: "#564f4f",
};

export const PastChapters = () => {
  const allEntries = useJournalStore((s) => s.entries);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);
  const entries = useMemo(
    () => allEntries.filter((e) => !e.deletedAt),
    [allEntries],
  );
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (entries.length === 0) {
    return <EmptyState />;
  }

  const current = entries[index];
  const total = entries.length;

  const go = (delta: number) => {
    const next = Math.min(Math.max(index + delta, 0), total - 1);
    if (next === index) return;
    setDirection(delta > 0 ? 1 : -1);
    setIndex(next);
  };

  return (
    <div className={styles.stage}>
      <DreamyBackdrop />

      <div className={styles.content}>
        <header className={styles.topBar}>
          <Link href="/" className={styles.backLink}>
            ← back to chat
          </Link>
          <div className={styles.topTitle}>
            <h1>Your notebook</h1>
            <p>
              {total} {total === 1 ? "chapter" : "chapters"} ·{" "}
              <Link href="/journal" className={styles.todayLink}>
                today&rsquo;s chapter
              </Link>
              {" · "}
              <Link href="/journal/letters" className={styles.todayLink}>
                letters
              </Link>
            </p>
          </div>
          <span className={styles.topSpacer} />
        </header>

        <div className={styles.book}>
          <FlipArrow
            dir="left"
            disabled={index === total - 1}
            onClick={() => go(1)}
          />

          <div className={styles.spread}>
            <WashiTape
              color="pink"
              pattern="dots"
              width={110}
              height={20}
              rotate={-4}
              style={{ top: -10, left: "50%", marginLeft: -55, zIndex: 5 }}
            />
            <AnimatePresence
              mode="popLayout"
              custom={direction}
              initial={false}
            >
              <motion.div
                key={current.id}
                className={styles.pageHost}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.2, 0.7, 0.3, 1] }}
              >
                <SpreadPage entry={current} />
              </motion.div>
            </AnimatePresence>
          </div>

          <FlipArrow
            dir="right"
            disabled={index === 0}
            onClick={() => go(-1)}
          />
        </div>

        <Scrubber
          entries={entries}
          deleteEntry={deleteEntry}
          activeIndex={index}
          onPick={(i) => {
            setDirection(i > index ? -1 : 1);
            setIndex((i) => Math.max(0, Math.min(i, total - 2)));
          }}
        />
      </div>
    </div>
  );
};

const SpreadPage = ({ entry }: { entry: JournalEntry }) => {
  const stampColor = STAMP_COLORS[entry.mood] ?? "#7c5cff";

  return (
    <NotebookPage
      width={520}
      height={620}
      binding="spiral"
      cornerCurl
      ruleSize={30}
    >
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <span className={styles.chapterPill}>chapter {entry.chapter}</span>
            <p className={styles.pageDate}>{formatDateTime(entry.sealedAt)}</p>
          </div>
        </div>
        <h2 className={styles.pageTitle}>{entry.title}</h2>
        <p className={styles.pageQuestion}>{entry.promptQuestion}</p>

        <div className={styles.pageBody}>
          {entry.body.split("\n").map((line, i) => (
            <p key={i} className={styles.pageBodyLine}>
              {line || "\u00a0"}
            </p>
          ))}
        </div>

        {(entry.oneWord || entry.tinyWin) && (
          <div className={styles.pageNotes}>
            {entry.oneWord && (
              <span className={styles.pageNote}>
                <em>in a word —</em> {entry.oneWord}
              </span>
            )}
            {entry.tinyWin && (
              <span className={styles.pageNote}>
                <em>tiny win —</em> {entry.tinyWin}
              </span>
            )}
          </div>
        )}

        <div className={styles.pageMood}>
          <MoodSticker mood={entry.mood} size={42} rotate={-6} />
          <span>{MOOD_INDEX[entry.mood]?.label.toLowerCase()}</span>
        </div>

        <Stamp
          color={stampColor}
          size={64}
          rotate={10}
          className={styles.pageStamp}
          double={false}
        >
          <span className={styles.pageStampSmall}>sealed</span>
          <span className={styles.pageStampBig}>d. {entry.chapter}</span>
        </Stamp>

        <Doodle
          kind="star"
          size={32}
          color="#7c5cff"
          className={styles.pageDoodle}
          rotate={-10}
        />
      </div>
    </NotebookPage>
  );
};

const Scrubber = ({
  entries,
  activeIndex,
  deleteEntry,
  onPick,
}: {
  entries: JournalEntry[];
  activeIndex: number;
  onPick: (i: number) => void;
  deleteEntry: (id: string) => void;
}) => {
  const oldestFirst = [...entries].reverse();
  const activeChapter = entries[activeIndex].chapter;

  return (
    <div className={styles.scrubber}>
      <div className={styles.scrubberLabel}>
        <span>Chapter 1</span>
        <span className={styles.scrubberPosition}>
          showing chapter {activeChapter} of {entries.length}
        </span>
        <span>Today →</span>
      </div>
      <div className={styles.scrubberTrack}>
        {oldestFirst.map((e) => {
          const isActive = e.chapter === activeChapter;
          return (
            <div key={e.id}>
              <button
                key={e.id}
                type="button"
                className={[
                  styles.scrubberPip,
                  isActive && styles.scrubberPipActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onPick(entries.findIndex((x) => x.id === e.id))}
                title={`Chapter ${e.chapter}: ${e.title}`}
                aria-label={`Open chapter ${e.chapter}: ${e.title}`}
              >
                <MoodSticker
                  mood={e.mood}
                  size={isActive ? 56 : 56}
                  dimmed={!isActive}
                />
                <span onClick={() => deleteEntry(e.id)}>X</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FlipArrow = ({
  dir,
  onClick,
  disabled,
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    className={dir === "left" ? styles.flipArrowLeft : styles.flipArrowRight}
    onClick={onClick}
    disabled={disabled}
    aria-label={dir === "left" ? "Older chapter" : "Newer chapter"}
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d={dir === "left" ? "M14 4l-7 7 7 7" : "M8 4l7 7-7 7"} />
    </svg>
  </button>
);

const EmptyState = () => (
  <div className={styles.stage}>
    <DreamyBackdrop />
    <div className={styles.empty}>
      <Doodle kind="compass" size={80} color="#c08fff" />
      <h1>your notebook is still blank.</h1>
      <p>seal one chapter and it&rsquo;ll start filling up — promise.</p>
      <Link href="/journal" className={styles.emptyButton}>
        Open today&rsquo;s chapter →
      </Link>
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

const pageVariants = {
  enter: (dir: number) => ({
    rotateY: dir > 0 ? -25 : 25,
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { rotateY: 0, x: 0, opacity: 1 },
  exit: (dir: number) => ({
    rotateY: dir > 0 ? 25 : -25,
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
