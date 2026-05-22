"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useJournalStore } from "@/store/useJournalStore";
import { LetterWriter } from "@/components/Journal/LetterWriter/LetterWriter";
import { LetterDelivery } from "@/components/Journal/LetterDelivery/LetterDelivery";
import type { FutureLetter } from "@/types/journal";

export default function LettersPage() {
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding,
  );
  const profile = useOnboardingStore((s) => s.profile);
  const loadOnboarding = useOnboardingStore((s) => s.loadOnboarding);

  const pendingLetter = useJournalStore((s) => s.pendingLetter);
  const checkDeliverableLetters = useJournalStore(
    (s) => s.checkDeliverableLetters,
  );

  const [openedLetter, setOpenedLetter] = useState<FutureLetter | null>(null);

  useEffect(() => {
    loadOnboarding();
  }, [loadOnboarding]);

  useEffect(() => {
    const t = setTimeout(() => {
      const state = useOnboardingStore.getState();
      if (!state.hasCompletedOnboarding) {
        router.replace("/");
      }
    }, 0);
    return () => clearTimeout(t);
  }, [router]);

  useEffect(() => {
    checkDeliverableLetters();
  }, [checkDeliverableLetters]);

  if (!hasCompletedOnboarding) return null;

  const friendName = profile?.friendName?.trim() || "your friend";

  return (
    <>
      <LetterWriter onLetterOpened={setOpenedLetter} />
      {openedLetter && (
        <LetterDelivery
          letter={openedLetter}
          friendName={friendName}
          onClose={() => setOpenedLetter(null)}
        />
      )}
      {!openedLetter && pendingLetter && (
        <LetterDelivery letter={pendingLetter} friendName={friendName} />
      )}
    </>
  );
}
