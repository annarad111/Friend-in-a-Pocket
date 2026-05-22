"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { InsightsPage } from "@/components/Insights/InsightsPage";

export default function InsightsRoute() {
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding,
  );
  const loadOnboarding = useOnboardingStore((s) => s.loadOnboarding);

  useEffect(() => {
    loadOnboarding();
  }, [loadOnboarding]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!useOnboardingStore.getState().hasCompletedOnboarding) {
        router.replace("/");
      }
    }, 0);
    return () => clearTimeout(t);
  }, [router]);

  if (!hasCompletedOnboarding) return null;

  return <InsightsPage />;
}
