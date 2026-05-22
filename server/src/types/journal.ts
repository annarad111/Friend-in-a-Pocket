// → server/src/types/journal.ts

import type { StoredOnboardingProfile } from './shared';

/**
 * What the client POSTs to /api/daily-prompt.
 * Both fields are optional — the AI can generate a generic prompt when
 * the user hasn't completed onboarding yet (shouldn't normally happen,
 * but the endpoint stays useful even if profile is missing).
 */
export type DailyPromptRequest = {
  /** YYYY-MM-DD in the user's local time. */
  date?: string;
  profile?:
    | Pick<StoredOnboardingProfile, 'friendName' | 'favoriteAnimal' | 'favoriteColor' | 'favoriteInstrument'>
    | null;
  /** BCP-47 language tag from navigator.language (e.g. "ro", "es", "en-US"). */
  language?: string;
};

/** What the server returns. */
export type GeneratedDailyPrompt = {
  /** Playful chapter title — e.g. "The Day You Almost Said It". */
  title: string;
  /** The open question the friend is asking — 1–2 sentences. */
  question: string;
};
