// → client/app/journal/past/page.tsx
//
// "Flip through your notebook" — past chapters with a page-turn animation.

'use client';

import { useEffect } from 'react';
import { useJournalStore } from '@/store/useJournalStore';
import { PastChapters } from '@/components/Journal/PastChapters/PastChapters';

export default function PastChaptersPage() {
  const loadJournal = useJournalStore((s) => s.loadJournal);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  return <PastChapters />;
}
