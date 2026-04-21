'use client';

import { useEffect, useState } from 'react';
import { OnboardingForm } from '@/components/OnboardingForm/OnboardingForm';
import { OnboardingResult } from '@/components/OnboardingResult/OnboardingResult';
import { ChatExperience } from '@/components/ChatExperience/ChatExperience';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function HomePage() {
  const {
    hasCompletedOnboarding,
    generatedProfile,
    loadOnboarding,
  } = useOnboardingStore();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadOnboarding();
    setIsLoaded(true);
  }, [loadOnboarding]);

  if (!isLoaded) {
    return null;
  }

  if (hasCompletedOnboarding) {
    return <ChatExperience />;
  }

  if (generatedProfile) {
    return <OnboardingResult />;
  }

  return <OnboardingForm />;
}