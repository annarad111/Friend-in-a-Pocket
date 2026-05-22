import { create } from "zustand";
import type {
  DailyPrompt,
  FutureLetter,
  JournalDraft,
  JournalEntry,
  LetterStatus,
  MoodKey,
} from "@/types/journal";
import { todayKey } from "@/lib/getDailyPrompt";

type JournalStore = {
  entries: JournalEntry[];
  todayPrompt: DailyPrompt | null;
  draft: JournalDraft;
  isLoadingPrompt: boolean;
  isSealing: boolean;
  promptError: string | null;
  justSealedChapter: number | null;
  isMaybeLater: boolean;
  maybeLaterUntil: number | null;
  isJournalInviteOpen: boolean;
  letters: FutureLetter[];
  pendingLetter: FutureLetter | null;

  addLetter: (
    body: string,
    deliverAt: string,
    mood: MoodKey | null,
  ) => FutureLetter;
  deleteLetter: (id: string) => void;
  checkDeliverableLetters: () => FutureLetter | null;
  markLetterOpened: (id: string) => void;
  dismissPendingLetter: () => void;
  deleteEntry: (id: string) => void;
  restoreEntry: (id: string) => void; // opțional, pentru undo
  openJournalInvite: () => void;
  closeJournalInvite: () => void;

  loadJournal: () => void;
  setTodayPrompt: (prompt: DailyPrompt | null) => void;
  setIsLoadingPrompt: (value: boolean) => void;
  setPromptError: (value: string | null) => void;
  setIsMaybeLater: (value: boolean) => void;
  clearMaybeLater: () => void;

  setDraftBody: (body: string) => void;
  setDraftOneWord: (value: string) => void;
  setDraftTinyWin: (value: string) => void;
  setDraftMood: (mood: MoodKey | null) => void;
  resetDraft: () => void;
  sealChapter: () => JournalEntry | null;
  acknowledgeSeal: () => void;
  hasEntryForToday: () => boolean;
  resetJournal: () => void;
};

const STORAGE_KEY = "friend-in-a-pocket-journal";

const emptyDraft = (): JournalDraft => ({
  body: "",
  oneWord: "",
  tinyWin: "",
  mood: null,
  promptDate: null,
});

type PersistedShape = {
  entries: JournalEntry[];
  draft: JournalDraft;
  maybeLaterUntil: number | null;
  letters: FutureLetter[];
};

function persist(state: {
  entries: JournalEntry[];
  draft: JournalDraft;
  maybeLaterUntil: number | null;
  letters: FutureLetter[];
}) {
  if (typeof window === "undefined") return;
  const payload: PersistedShape = {
    entries: state.entries,
    draft: state.draft,
    maybeLaterUntil: state.maybeLaterUntil,
    letters: state.letters,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

const ONE_HOUR = 60 * 60 * 1000;
let maybeLaterTimer: ReturnType<typeof setTimeout> | null = null;
const until = Date.now() + ONE_HOUR;

function scheduleClear(untilMs: number, clear: () => void) {
  if (maybeLaterTimer) clearTimeout(maybeLaterTimer);
  const remaining = Math.max(0, untilMs - Date.now());
  maybeLaterTimer = setTimeout(clear, remaining);
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  entries: [],
  todayPrompt: null,
  draft: emptyDraft(),

  isLoadingPrompt: false,
  isSealing: false,
  promptError: null,
  justSealedChapter: null,
  isMaybeLater: false,
  maybeLaterUntil: null,
  isJournalInviteOpen: false,
  letters: [],
  pendingLetter: null,

  addLetter: (body, deliverAt, mood) => {
    const letter: FutureLetter = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      body: body.trim(),
      writtenAt: new Date().toISOString(),
      deliverAt,
      status: "scheduled",
      recipient: "future",
      mood,
    };
    set({ letters: [letter, ...get().letters] });
        persist({
      entries: get().entries,
      draft: get().draft,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
    return letter;
  },

  deleteLetter: (id) => {
    set({ letters: get().letters.filter((l) => l.id !== id) });
        persist({
      entries: get().entries,
      draft: get().draft,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
  },

  checkDeliverableLetters: () => {
    const now = Date.now();
    const ready = get().letters.find(
      (l) => l.status === "scheduled" && new Date(l.deliverAt).getTime() <= now,
    );
    if (!ready) return null;
    const updated = get().letters.map((l) =>
      l.id === ready.id ? { ...l, status: "delivered" as LetterStatus } : l,
    );
    set({ letters: updated, pendingLetter: ready });
    persist({
      entries: get().entries,
      draft: get().draft,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
    return ready;
  },

  markLetterOpened: (id) => {
    set({
      letters: get().letters.map((l) =>
        l.id === id ? { ...l, status: "opened" } : l,
      ),
    });
    persist({
      entries: get().entries,
      draft: get().draft,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
  },

  dismissPendingLetter: () => set({ pendingLetter: null }),

  openJournalInvite: () => {
    if (get().isMaybeLater) return;
    set({ isJournalInviteOpen: true });
  },
  closeJournalInvite: () => set({ isJournalInviteOpen: false }),
  setMaybeLater: () => {
    set({ isMaybeLater: true, maybeLaterUntil: until });
    persist({
      entries: get().entries,
      draft: get().draft,
      maybeLaterUntil: until,
      letters: get().letters,
    });
    scheduleClear(until, () => get().clearMaybeLater());
  },

  clearMaybeLater: () => {
    if (maybeLaterTimer) {
      clearTimeout(maybeLaterTimer);
      maybeLaterTimer = null;
    }
    set({ isMaybeLater: false, maybeLaterUntil: null });
    persist({
      entries: get().entries,
      draft: get().draft,
      maybeLaterUntil: null,
      letters: get().letters,
    });
  },
  loadJournal: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<PersistedShape>;
      const until = parsed.maybeLaterUntil ?? null;
      const stillActive = until !== null && until > Date.now();

      set({
        entries: Array.isArray(parsed.entries) ? parsed.entries : [],
        draft: parsed.draft ?? emptyDraft(),
        maybeLaterUntil: stillActive ? until : null,
        isMaybeLater: stillActive,
        letters: Array.isArray(parsed.letters) ? parsed.letters : [],
      });

      if (stillActive && until) {
        scheduleClear(until, () => get().clearMaybeLater());
      } else if (until !== null && !stillActive) {
        get().clearMaybeLater();
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  setTodayPrompt: (prompt) => {
    set({ todayPrompt: prompt });
    const { draft } = get();
    if (prompt && draft.promptDate && draft.promptDate !== prompt.date) {
      const cleared: JournalDraft = {
        ...emptyDraft(),
        promptDate: prompt.date,
      };
      set({ draft: cleared });
      persist({
        entries: get().entries,
        draft: cleared,
        maybeLaterUntil: get().maybeLaterUntil,
        letters: get().letters,
      });
    } else if (prompt && !draft.promptDate) {
      const stamped: JournalDraft = { ...draft, promptDate: prompt.date };
      set({ draft: stamped });
      persist({
        entries: get().entries,
        draft: stamped,
        maybeLaterUntil: get().maybeLaterUntil,
        letters: get().letters,
      });
    }
  },

  setIsLoadingPrompt: (value) => set({ isLoadingPrompt: value }),
  setPromptError: (value) => set({ promptError: value }),
  setIsMaybeLater: (value) => set({ isMaybeLater: value }),
  setDraftBody: (body) => {
    const next: JournalDraft = { ...get().draft, body };
    set({ draft: next });
    persist({
      entries: get().entries,
      draft: next,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
  },
  setDraftOneWord: (value) => {
    const next: JournalDraft = { ...get().draft, oneWord: value };
    set({ draft: next });
    persist({
      entries: get().entries,
      draft: next,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
  },
  setDraftTinyWin: (value) => {
    const next: JournalDraft = { ...get().draft, tinyWin: value };
    set({ draft: next });
    persist({
      entries: get().entries,
      draft: next,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
  },
  setDraftMood: (mood) => {
    const next: JournalDraft = { ...get().draft, mood };
    set({ draft: next });
    persist({
      entries: get().entries,
      draft: next,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
  },
  resetDraft: () => {
    const next: JournalDraft = emptyDraft();
    set({ draft: next });
    persist({
      entries: get().entries,
      draft: next,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
  },

  sealChapter: () => {
    const { todayPrompt, draft, entries } = get();
    if (!todayPrompt) return null;
    if (!draft.mood) return null;
    if (draft.body.trim().length === 0) return null;

    const now = new Date().toISOString();
    const visibleEntries = entries.filter((e) => !e.deletedAt);
    const chapter = visibleEntries.length + 1;
    const entry: JournalEntry = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      chapter,
      title: todayPrompt.title,
      promptQuestion: todayPrompt.question,
      body: draft.body.trim(),
      oneWord: draft.oneWord.trim(),
      tinyWin: draft.tinyWin.trim(),
      mood: draft.mood,
      createdAt: now,
      sealedAt: now,
    };

    const nextEntries = [entry, ...entries];
    const nextDraft = emptyDraft();
    set({
      entries: nextEntries,
      draft: nextDraft,
      isSealing: false,
      justSealedChapter: chapter,
    });
    persist({
      entries: nextEntries,
      draft: nextDraft,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
    return entry;
  },

  acknowledgeSeal: () => set({ justSealedChapter: null }),

  hasEntryForToday: () => {
    const today = todayKey();
    return get().entries.some(
      (e) => !e.deletedAt && e.sealedAt.startsWith(today),
    );
  },

  resetJournal: () => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    set({
      entries: [],
      todayPrompt: null,
      draft: emptyDraft(),
      promptError: null,
      isLoadingPrompt: false,
      isSealing: false,
      justSealedChapter: null,
      isMaybeLater: false,
    });
  },

  deleteEntry: (id) => {
    const nextEntries = get().entries.map((e) =>
      e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e,
    );
    set({ entries: nextEntries });
    persist({
      entries: nextEntries,
      draft: get().draft,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
  },

  restoreEntry: (id) => {
    const nextEntries = get().entries.map((e) =>
      e.id === id ? { ...e, deletedAt: null } : e,
    );
    set({ entries: nextEntries });
    persist({
      entries: nextEntries,
      draft: get().draft,
      maybeLaterUntil: get().maybeLaterUntil,
      letters: get().letters,
    });
  },
}));
