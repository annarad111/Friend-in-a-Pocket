// → client/app/journal/page.tsx
//
// Today's chapter screen. Standalone route; if the user hasn't completed
// onboarding yet, route them back to "/" so the friend gets created
// first (same gating pattern the rest of the app uses).

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useJournalStore } from '@/store/useJournalStore';
import { JournalEntry } from '@/components/Journal/JournalEntry/JournalEntry';
import { LetterDelivery } from '@/components/Journal/LetterDelivery/LetterDelivery';

export default function JournalPage() {
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding,
  );
  const loadOnboarding = useOnboardingStore((s) => s.loadOnboarding);
  const profile = useOnboardingStore((s) => s.profile);
  const pendingLetter = useJournalStore((s) => s.pendingLetter);
  const checkDeliverableLetters = useJournalStore((s) => s.checkDeliverableLetters);

  useEffect(() => {
    loadOnboarding();
  }, [loadOnboarding]);

  useEffect(() => {
    // Read fresh state after hydration. We rely on loadOnboarding setting
    // hasCompletedOnboarding synchronously when the localStorage entry is
    // present, so by the next tick this is settled.
    const t = setTimeout(() => {
      const state = useOnboardingStore.getState();
      if (!state.hasCompletedOnboarding) {
        router.replace('/');
      }
    }, 0);
    return () => clearTimeout(t);
  }, [router]);

  useEffect(() => {
    checkDeliverableLetters();
  }, [checkDeliverableLetters]);

  if (!hasCompletedOnboarding) {
    return null;
  }

  const friendName = profile?.friendName?.trim() || 'your friend';

  return (
    <>
      <JournalEntry />
      {pendingLetter && (
        <LetterDelivery letter={pendingLetter} friendName={friendName} />
      )}
    </>
  );
}
