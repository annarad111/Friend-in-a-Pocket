import { create } from "zustand";
import type { CompletedTest, PersonalityProfile, BirthData, BirthChart } from "@/types/insights";

type InsightsStore = {
  tests: CompletedTest[];
  profile: PersonalityProfile | null;
  birthData: BirthData | null;
  birthChart: BirthChart | null;
  isGeneratingProfile: boolean;
  isRunningTest: boolean;
  isGeneratingBirthChart: boolean;

  addTest: (test: CompletedTest) => void;
  setProfile: (profile: PersonalityProfile) => void;
  setBirthData: (data: BirthData) => void;
  setBirthChart: (chart: BirthChart) => void;
  clearBirthChart: () => void;
  setIsGeneratingProfile: (v: boolean) => void;
  setIsRunningTest: (v: boolean) => void;
  setIsGeneratingBirthChart: (v: boolean) => void;
  loadInsights: () => void;
  resetInsights: () => void;
};

const STORAGE_KEY = "friend-in-a-pocket-insights";

type PersistedShape = {
  tests: CompletedTest[];
  profile: PersonalityProfile | null;
  birthData: BirthData | null;
  birthChart: BirthChart | null;
};

function persist(state: PersistedShape) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useInsightsStore = create<InsightsStore>((set, get) => ({
  tests: [],
  profile: null,
  birthData: null,
  birthChart: null,
  isGeneratingProfile: false,
  isRunningTest: false,
  isGeneratingBirthChart: false,

  addTest: (test) => {
    const tests = [test, ...get().tests];
    set({ tests });
    persist({ tests, profile: get().profile, birthData: get().birthData, birthChart: get().birthChart });
  },

  setProfile: (profile) => {
    set({ profile });
    persist({ tests: get().tests, profile, birthData: get().birthData, birthChart: get().birthChart });
  },

  setBirthData: (birthData) => {
    set({ birthData });
    persist({ tests: get().tests, profile: get().profile, birthData, birthChart: get().birthChart });
  },

  setBirthChart: (birthChart) => {
    set({ birthChart });
    persist({ tests: get().tests, profile: get().profile, birthData: get().birthData, birthChart });
  },

  clearBirthChart: () => {
    set({ birthChart: null, birthData: null });
    persist({ tests: get().tests, profile: get().profile, birthData: null, birthChart: null });
  },

  setIsGeneratingProfile: (v) => set({ isGeneratingProfile: v }),
  setIsRunningTest: (v) => set({ isRunningTest: v }),
  setIsGeneratingBirthChart: (v) => set({ isGeneratingBirthChart: v }),

  loadInsights: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<PersistedShape>;
      set({
        tests: Array.isArray(parsed.tests) ? parsed.tests : [],
        profile: parsed.profile ?? null,
        birthData: parsed.birthData ?? null,
        birthChart: parsed.birthChart ?? null,
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  resetInsights: () => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    set({ tests: [], profile: null, birthData: null, birthChart: null });
  },
}));
