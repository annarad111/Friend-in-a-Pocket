"use client";

import { useEffect, useMemo, useRef } from "react";
import { useJournalStore } from "@/store/useJournalStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { getDailyPrompt, todayKey } from "@/lib/getDailyPrompt";
import { NotebookPage } from "@/components/Journal/NotebookPage/NotebookPage";
import { MoodSticker } from "@/components/Journal/MoodSticker/MoodSticker";
import { MOODS } from "@/components/Journal/MoodSticker/moods";
import { WashiTape } from "@/components/Journal/JournalDecor/WashiTape";
import { Stamp } from "@/components/Journal/JournalDecor/Stamp";
import { Doodle } from "@/components/Journal/JournalDecor/Doodle";
import { FriendAvatar } from "@/components/Journal/JournalDecor/FriendAvatar";
import { JournalCelebration } from "./JournalCelebration";
import styles from "./JournalEntry.module.scss";

export const JournalEntry = () => {
  const profile = useOnboardingStore((s) => s.profile);
  const friendName = profile?.friendName?.trim() || "your friend";
  const allEntries = useJournalStore((s) => s.entries);
  const entries = useMemo(
    () => allEntries.filter((e) => !e.deletedAt),
    [allEntries],
  );
  const todayPrompt = useJournalStore((s) => s.todayPrompt);
  const draft = useJournalStore((s) => s.draft);
  const isLoadingPrompt = useJournalStore((s) => s.isLoadingPrompt);
  const promptError = useJournalStore((s) => s.promptError);
  const justSealedChapter = useJournalStore((s) => s.justSealedChapter);

  const loadJournal = useJournalStore((s) => s.loadJournal);
  const setTodayPrompt = useJournalStore((s) => s.setTodayPrompt);
  const setIsLoadingPrompt = useJournalStore((s) => s.setIsLoadingPrompt);
  const setPromptError = useJournalStore((s) => s.setPromptError);
  const setDraftBody = useJournalStore((s) => s.setDraftBody);
  const setDraftOneWord = useJournalStore((s) => s.setDraftOneWord);
  const setDraftTinyWin = useJournalStore((s) => s.setDraftTinyWin);
  const setDraftMood = useJournalStore((s) => s.setDraftMood);
  const sealChapter = useJournalStore((s) => s.sealChapter);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  const fetchedDateRef = useRef<string | null>(null);
  useEffect(() => {
    const today = todayKey();

    if (todayPrompt && todayPrompt.date === today) {
      setIsLoadingPrompt(false);
      return;
    }

    if (fetchedDateRef.current === today) return;
    fetchedDateRef.current = today;

    setIsLoadingPrompt(true);
    setPromptError(null);
    getDailyPrompt({
      profile: profile
        ? {
            friendName: profile.friendName,
            favoriteAnimal: profile.favoriteAnimal,
          }
        : null,
    })
      .then((prompt) => {
        setTodayPrompt(prompt);
      })
      .catch(() => {
        setPromptError(
          "We couldn't pull today's prompt. Try refreshing in a moment.",
        );
      })
      .finally(() => {
        setIsLoadingPrompt(false);
      });
  }, [todayPrompt?.date, profile?.friendName, profile?.favoriteAnimal]);

  const chapter = entries.length + 1;
  const wordCount = useMemo(() => {
    const trimmed = draft.body.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [draft.body]);

  const canSeal = !!draft.mood && draft.body.trim().length > 0;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(ta.scrollHeight, 320);
    ta.style.height = `${next}px`;
  }, [draft.body]);

  const handleSeal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSeal) return;
    sealChapter();
  };

  return (
    <div className={styles.stage}>
      <DreamyBackdrop />

      <div className={styles.pageWrap}>
        <WashiTape
          color="yellow"
          pattern="stripes"
          width={120}
          height={26}
          rotate={-7}
          style={{ top: -14, left: 40, zIndex: 3 }}
        />
        <WashiTape
          color="pink"
          pattern="dots"
          width={100}
          height={22}
          rotate={8}
          style={{ top: -10, right: 50, zIndex: 3 }}
        />

        <NotebookPage
          width={720}
          height={780}
          tilt={-0.6}
          binding="spiral"
          cornerCurl
        >
          <Stamp
            color="#d97a8a"
            size={70}
            rotate={-12}
            className={styles.dayStamp}
          >
            <span className={styles.stampSmall}>day</span>
            <span className={styles.stampBig}>{chapter}</span>
          </Stamp>
          <Doodle
            kind="compass"
            size={64}
            color="#7c5cff"
            rotate={10}
            className={styles.doodleCompass}
          />
          <Doodle
            kind="arrow"
            size={64}
            color="#d97a8a"
            rotate={-30}
            className={styles.doodleArrow}
          />
          <Doodle
            kind="star"
            size={42}
            color="#7c5cff"
            rotate={18}
            className={styles.doodleStar}
          />

          {isLoadingPrompt || !todayPrompt ? (
            <LoadingBody friendName={friendName} />
          ) : promptError ? (
            <ErrorBody message={promptError} />
          ) : (
            <form className={styles.page} onSubmit={handleSeal}>
              <header className={styles.header}>
                <div className={styles.headerLeft}>
                  <div className={styles.pills}>
                    <span className={`${styles.pill} ${styles.pillLav}`}>
                      Chapter {chapter}
                    </span>
                    <span className={`${styles.pill} ${styles.pillCream}`}>
                      {formatDate(todayPrompt.date)}
                    </span>
                  </div>
                  <h1 className={styles.title}>{todayPrompt.title}</h1>
                </div>
                <FriendAvatar name={friendName} size={40} vertical />
              </header>

              <section className={styles.promptSection}>
                <p className={styles.promptIntro}>
                  today&rsquo;s prompt, from {friendName}:
                </p>
                <p className={styles.promptQuestion}>{todayPrompt.question}</p>
                <Doodle
                  kind="underline"
                  size={110}
                  color="#7c5cff"
                  className={styles.promptUnderline}
                />
              </section>

              <label className={styles.writingLabel} htmlFor="journal-body">
                <span className="sr-only">your reflection</span>
              </label>
              <textarea
                ref={textareaRef}
                id="journal-body"
                className={styles.writing}
                placeholder="start anywhere — even crooked. nobody&rsquo;s grading."
                value={draft.body}
                onChange={(e) => setDraftBody(e.target.value)}
                rows={6}
              />

              <section className={styles.sideNotes}>
                <div className={styles.sideNotesIntro}>
                  <Doodle kind="dots3" size={20} color="#d97a8a" />
                  <span>margin notes — quick &amp; gentle:</span>
                </div>
                <div className={styles.sideNotesGrid}>
                  <SideNote
                    badge="A"
                    label="in a word —"
                    htmlFor="journal-oneword"
                  >
                    <input
                      id="journal-oneword"
                      className={styles.sideNoteInput}
                      type="text"
                      value={draft.oneWord}
                      onChange={(e) => setDraftOneWord(e.target.value)}
                      placeholder="quiet"
                      maxLength={24}
                    />
                  </SideNote>
                  <SideNote
                    badge="B"
                    label="a tiny win today —"
                    htmlFor="journal-tinywin"
                  >
                    <input
                      id="journal-tinywin"
                      className={styles.sideNoteInput}
                      type="text"
                      value={draft.tinyWin}
                      onChange={(e) => setDraftTinyWin(e.target.value)}
                      placeholder="made the bed before checking my phone."
                      maxLength={120}
                    />
                  </SideNote>
                </div>
              </section>

              <footer className={styles.footer}>
                <div className={styles.moodSection}>
                  <p className={styles.moodLabel}>
                    how it actually felt:{" "}
                    <span className={styles.required}>*</span>
                  </p>
                  <div
                    className={styles.moodRow}
                    role="radiogroup"
                    aria-label="Mood for this chapter"
                  >
                    {MOODS.map((m, i) => (
                      <MoodSticker
                        key={m.key}
                        mood={m.key}
                        size={40}
                        rotate={i % 2 === 0 ? -3 : 3}
                        selected={draft.mood === m.key}
                        dimmed={draft.mood !== null && draft.mood !== m.key}
                        onClick={() =>
                          setDraftMood(draft.mood === m.key ? null : m.key)
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.actions}>
                  <span className={styles.wordCount}>
                    {wordCount} {wordCount === 1 ? "word" : "words"} ·
                    auto-saved
                  </span>
                  <button
                    type="submit"
                    className={styles.sealButton}
                    disabled={!canSeal}
                    title={
                      !draft.mood
                        ? "Pick a mood sticker first"
                        : draft.body.trim().length === 0
                          ? "Write a little something first"
                          : "Seal this chapter"
                    }
                  >
                    Seal this chapter →
                  </button>
                </div>
              </footer>
            </form>
          )}
        </NotebookPage>
      </div>

      {justSealedChapter !== null && (
        <JournalCelebration
          chapter={justSealedChapter}
          friendName={friendName}
        />
      )}
    </div>
  );
};

const DreamyBackdrop = () => (
  <div className={styles.backdrop} aria-hidden="true">
    <div className={styles.stars} />
    <div className={`${styles.glow} ${styles.glowA}`} />
    <div className={`${styles.glow} ${styles.glowB}`} />
    <div className={`${styles.glow} ${styles.glowC}`} />
  </div>
);

const SideNote = ({
  badge,
  label,
  htmlFor,
  children,
}: {
  badge: string;
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <div className={styles.sideNote}>
    <label className={styles.sideNoteLabel} htmlFor={htmlFor}>
      <span className={styles.sideNoteBadge} aria-hidden="true">
        {badge}
      </span>
      <span>{label}</span>
    </label>
    {children}
  </div>
);

const LoadingBody = ({ friendName }: { friendName: string }) => (
  <div className={styles.loadingState}>
    <Doodle kind="spiral" size={56} color="#7c5cff" />
    <p>Pulling today&rsquo;s prompt from {friendName}…</p>
  </div>
);

const ErrorBody = ({ message }: { message: string }) => (
  <div className={styles.errorState}>
    <Doodle kind="cloud" size={56} color="#d97a8a" />
    <p>{message}</p>
  </div>
);

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
