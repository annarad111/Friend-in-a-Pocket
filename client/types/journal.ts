export const MOOD_KEYS = [
  'sunny',
  'cozy',
  'sparkly',
  'hopeful',
  'calm',
  'cloudy',
  'foggy',
  'stormy',
  'heavy',
] as const;

export type MoodKey = (typeof MOOD_KEYS)[number];

export type JournalEntry = {
  id: string;
  chapter: number;
  title: string;
  promptQuestion: string;
  body: string;
  oneWord: string;
  tinyWin: string;
  mood: MoodKey;
  createdAt: string;
  sealedAt: string;
  deletedAt?: string | null;
};

export type DailyPrompt = {
  title: string;
  question: string;
  date: string;
};

export type JournalDraft = {
  body: string;
  oneWord: string;
  tinyWin: string;
  mood: MoodKey | null;
  promptDate: string | null;
};

export type LetterStatus = 'scheduled' | 'delivered' | 'opened';

export type FutureLetter = {
  id: string;
  body: string;
  writtenAt: string;   // ISO
  deliverAt: string;   // ISO — data țintă
  status: LetterStatus;
  recipient: 'future' | 'past'; // 'past' = scrisori vechi de self trecut, optional
  mood: MoodKey | null;
};