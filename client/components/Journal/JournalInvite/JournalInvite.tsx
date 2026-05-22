"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useJournalStore } from "@/store/useJournalStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { todayKey } from "@/lib/getDailyPrompt";
import { MoodSticker } from "@/components/Journal/MoodSticker/MoodSticker";
import { WashiTape } from "@/components/Journal/JournalDecor/WashiTape";
import { Doodle } from "@/components/Journal/JournalDecor/Doodle";
import styles from "./JournalInvite.module.scss";

type Props = {
  title?: string;
  hint?: string;
};

export const JournalInvite = ({ title, hint }: Props) => {
  const { isMaybeLater, setIsMaybeLater } = useJournalStore();
  const profile = useOnboardingStore((s) => s.profile);
  const friendName = profile?.friendName?.trim() || "your friend";

  const todayPrompt = useJournalStore((s) => s.todayPrompt);
  const entries = useJournalStore((s) => s.entries);
  const isOpen = useJournalStore((s) => s.isJournalInviteOpen);
  const close = useJournalStore((s) => s.closeJournalInvite);
  const hasEntryForToday = useJournalStore((s) => s.hasEntryForToday);
  const loadJournal = useJournalStore((s) => s.loadJournal);

  useEffect(() => {
    loadJournal();
  }, [loadJournal,isOpen]);

  const alreadyDone = hasEntryForToday();
  const chapter = (entries.length || 0) + (alreadyDone ? 0 : 1);

  const displayTitle =
    title ??
    todayPrompt?.title ??
    (alreadyDone
      ? "Chapter sealed for today"
      : "Today\u2019s chapter is waiting");

  const displayHint =
    hint ??
    (alreadyDone
      ? `you already sealed today\u2019s chapter \u2014 want to flip back through it?`
      : `a soft expedition into what you noticed. ~4 min, snacks optional.`);

  return (
    <>
      {isOpen && (
        <div className={styles.card}>
          <WashiTape
            color="yellow"
            pattern="stripes"
            width={84}
            height={18}
            rotate={-8}
            style={{ top: -8, left: 30 }}
          />
          <div className={styles.rules} aria-hidden="true" />
          <div className={styles.body}>
            <div className={styles.headerRow}>
              <span className={styles.chapterPill}>
                Chapter {chapter} {alreadyDone ? "· sealed" : "· today"}
              </span>
              <Doodle
                kind="compass"
                size={28}
                color="#7c5cff"
                className={styles.compass}
              />
            </div>
            <p className={styles.title}>{displayTitle}</p>
            <p className={styles.hint}>{displayHint}</p>
            <div className={styles.actions}>
              <Link
                href={alreadyDone ? "/journal/past" : "/journal"}
                className={styles.primaryLink}
                onClick={() => close()}
              >
                {alreadyDone
                  ? "Flip through past chapters \u2192"
                  : "Open my notebook \u2192"}
              </Link>
              {!alreadyDone && (
                <span
                  className={styles.maybeLater}
                  onClick={() => setIsMaybeLater(true)}
                >
                  maybe later
                </span>
              )}
              <div className={styles.peekStickers} aria-hidden="true">
                <MoodSticker mood="cloudy" size={28} rotate={-4} />
                <MoodSticker mood="hopeful" size={28} rotate={6} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
