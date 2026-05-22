import { create } from 'zustand';
import {
  GeneratedOnboardingProfile,
  StoredOnboardingProfile,
  UserOnboardingProfile,
} from '@/types/onboarding';

type OnboardingStore = {
  hasCompletedOnboarding: boolean;
  profile: StoredOnboardingProfile | null;
  pendingProfile: UserOnboardingProfile | null;
  generatedProfile: GeneratedOnboardingProfile | null;
  isGeneratingProfile: boolean;
  onboardingError: string | null;

  startOnboardingGeneration: (profile: UserOnboardingProfile) => void;
  finishOnboardingGeneration: (generatedProfile: GeneratedOnboardingProfile) => void;
  completeOnboarding: () => void;
  loadOnboarding: () => void;
  setOnboardingError: (value: string | null) => void;
  resetOnboarding: () => void;
};

const STORAGE_KEY = 'friend-in-a-pocket-onboarding';

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  hasCompletedOnboarding: false,
  profile: null,
  pendingProfile: null,
  generatedProfile: null,
  isGeneratingProfile: false,
  onboardingError: null,

  startOnboardingGeneration: (profile) => {
    set({
      pendingProfile: profile,
      isGeneratingProfile: true,
      onboardingError: null,
    });
  },

  finishOnboardingGeneration: (generatedProfile) => {
    set({
      generatedProfile,
      isGeneratingProfile: false,
      onboardingError: null,
    });
  },

  completeOnboarding: () => {
    const { pendingProfile, generatedProfile } = get();

    if (!pendingProfile) return;

    const finalProfile: StoredOnboardingProfile = {
      ...pendingProfile,
      generatedProfile,
      lockedAt: new Date().toISOString(),
    };

    const payload = {
      hasCompletedOnboarding: true,
      profile: finalProfile,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    set({
      hasCompletedOnboarding: true,
      profile: finalProfile,
      pendingProfile: null,
      generatedProfile: null,
      isGeneratingProfile: false,
      onboardingError: null,
    });
  },

  loadOnboarding: () => {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      set({
        hasCompletedOnboarding: Boolean(parsed.hasCompletedOnboarding),
        profile: parsed.profile ?? null,
        pendingProfile: null,
        generatedProfile: null,
        isGeneratingProfile: false,
        onboardingError: null,
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  setOnboardingError: (value) => {
    set({
      onboardingError: value,
      isGeneratingProfile: false,
    });
  },

  resetOnboarding: () => {
    localStorage.removeItem(STORAGE_KEY);

    set({
      hasCompletedOnboarding: false,
      profile: null,
      pendingProfile: null,
      generatedProfile: null,
      isGeneratingProfile: false,
      onboardingError: null,
    });
  },
}));