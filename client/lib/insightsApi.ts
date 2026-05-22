import type { CompletedTest, PersonalityProfile, BirthData, BirthChart } from "@/types/insights";
import type { JournalEntry } from "@/types/journal";
import type { StoredOnboardingProfile } from "@/types/onboarding";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

type TestResponse = { questionId: string; question: string; answer: string };

export async function interpretTest(
  testType: string,
  responses: TestResponse[],
): Promise<{ interpretation: string }> {
  const res = await fetch(`${API_BASE}/api/interpret-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ testType, responses }),
  });
  if (!res.ok) throw new Error("Could not interpret test.");
  return res.json();
}

export async function fetchPersonalityProfile(
  entries: JournalEntry[],
  completedTests: CompletedTest[],
  profile: StoredOnboardingProfile | null,
): Promise<{ content: string; reflectionQuestion: string }> {
  const snippets = entries.slice(0, 15).map((e) => ({
    title: e.title,
    promptQuestion: e.promptQuestion,
    body: e.body,
    oneWord: e.oneWord,
    tinyWin: e.tinyWin,
    mood: e.mood,
    sealedAt: e.sealedAt,
  }));

  const testSummaries = completedTests.map((t) => ({
    title: t.title,
    interpretation: t.interpretation,
  }));

  const res = await fetch(`${API_BASE}/api/personality-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entries: snippets,
      completedTests: testSummaries,
      profile: profile
        ? {
            friendName: profile.friendName,
            favoriteAnimal: profile.favoriteAnimal,
            favoriteColor: profile.favoriteColor,
            favoriteInstrument: profile.favoriteInstrument,
          }
        : null,
    }),
  });
  if (!res.ok) throw new Error("Could not generate personality profile.");
  return res.json();
}

export async function generateBirthChartApi(
  data: BirthData,
): Promise<Omit<BirthChart, "generatedAt">> {
  const res = await fetch(`${API_BASE}/api/birth-chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Could not generate birth chart.");
  return res.json();
}
