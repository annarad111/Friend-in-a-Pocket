"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useInsightsStore } from "@/store/useInsightsStore";
import { useJournalStore } from "@/store/useJournalStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { fetchPersonalityProfile } from "@/lib/insightsApi";
import { PsychTest } from "./PsychTest";
import { BirthChartSection } from "./BirthChart";
import type { CompletedTest, TestDef } from "@/types/insights";
import styles from "./InsightsPage.module.scss";

const AVAILABLE_TESTS: TestDef[] = [
  {
    id: "desert-cube",
    title: "The Desert & The Cube",
    tagline: "A window into how you see yourself and the world.",
    description:
      "A classic projective visualization from Kokology. You imagine a desert scene and describe what appears — the interpretation reveals how you relate to yourself, your relationships, and adversity.",
    duration: "5–8 min",
    questions: [
      {
        id: "setting",
        text: "You find yourself standing alone in the middle of a vast desert. The silence is total. Describe what you see — the sky, the sand, the light, the feeling of the space around you.",
        placeholder: "I see a sky that is...",
      },
      {
        id: "cube",
        text: "In this desert, there is a cube. It simply exists there. How large is it? What material is it made of — glass, stone, wood, metal, something else? What color? Where does it sit relative to you and the ground?",
        placeholder: "The cube is...",
      },
      {
        id: "ladder",
        text: "There is also a ladder in the scene. Where is it in relation to the cube? Is it leaning against it, lying on the sand, free-standing somewhere far off?",
        placeholder: "The ladder is...",
      },
      {
        id: "horse",
        text: "A horse is somewhere in this scene. Describe it — its color, its energy, what it is doing. Where is it in relation to the cube?",
        placeholder: "The horse is...",
      },
      {
        id: "flowers",
        text: "There are flowers in this desert. Where are they — clustered near the cube, scattered across the sand, far away? How many, and what do they look like?",
        placeholder: "The flowers are...",
      },
      {
        id: "storm",
        text: "A storm is coming. Where is it — distant, close, already overhead? How does it move through the scene? Does it threaten what is there, or does it pass?",
        placeholder: "The storm is...",
      },
    ],
  },
];

export const InsightsPage = () => {
  const profile = useInsightsStore((s) => s.profile);
  const tests = useInsightsStore((s) => s.tests);
  const isGeneratingProfile = useInsightsStore((s) => s.isGeneratingProfile);
  const addTest = useInsightsStore((s) => s.addTest);
  const setProfile = useInsightsStore((s) => s.setProfile);
  const setIsGeneratingProfile = useInsightsStore((s) => s.setIsGeneratingProfile);
  const loadInsights = useInsightsStore((s) => s.loadInsights);

  const entries = useJournalStore((s) => s.entries);
  const loadJournal = useJournalStore((s) => s.loadJournal);
  const onboardingProfile = useOnboardingStore((s) => s.profile);

  const [activeTest, setActiveTest] = useState<TestDef | null>(null);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
    loadJournal();
  }, [loadInsights, loadJournal]);

  const visibleEntries = useMemo(
    () => entries.filter((e) => !e.deletedAt),
    [entries],
  );

  const completedTestIds = useMemo(
    () => new Set(tests.map((t) => t.type)),
    [tests],
  );

  const availableTests = AVAILABLE_TESTS.filter(
    (t) => !completedTestIds.has(t.id),
  );

  const handleGenerateProfile = async () => {
    if (visibleEntries.length === 0) return;
    setIsGeneratingProfile(true);
    setProfileError(null);
    try {
      const result = await fetchPersonalityProfile(
        visibleEntries,
        tests,
        onboardingProfile,
      );
      setProfile({
        content: result.content,
        reflectionQuestion: result.reflectionQuestion,
        generatedAt: new Date().toISOString(),
        entryCount: visibleEntries.length,
      });
    } catch {
      setProfileError("Couldn't generate your portrait right now. Try again in a moment.");
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleTestComplete = (result: CompletedTest) => {
    addTest(result);
    setActiveTest(null);
  };

  return (
    <div className={styles.stage}>
      <Backdrop />

      <div className={styles.layout}>
        <header className={styles.topBar}>
          <Link href="/" className={styles.backLink}>← chat</Link>
          <div className={styles.pageTitle}>
            <h1>your inner portrait</h1>
            <p>built from what you write and who you are</p>
          </div>
          <span className={styles.topSpacer} />
        </header>

        {/* Personality Portrait */}
        <div className={styles.portraitCard}>
          <div className={styles.portraitHeader}>
            <span className={styles.sectionLabel}>Personality Portrait</span>
            {profile && (
              <button
                className={styles.regenerateBtn}
                onClick={handleGenerateProfile}
                disabled={isGeneratingProfile || visibleEntries.length === 0}
              >
                {isGeneratingProfile ? "reading…" : "↻ refresh"}
              </button>
            )}
          </div>

          {isGeneratingProfile ? (
            <div className={styles.loadingPortrait}>
              <div className={styles.spinner} />
              <span>Reading your chapters and weaving a portrait…</span>
            </div>
          ) : profile ? (
            <>
              <p className={styles.portraitText}>{profile.content}</p>
              <div className={styles.reflectionBox}>
                <span className={styles.reflectionLabel}>a question to sit with</span>
                <p className={styles.reflectionQuestion}>{profile.reflectionQuestion}</p>
              </div>
              <p className={styles.portraitMeta}>
                Generated from {profile.entryCount} journal{" "}
                {profile.entryCount === 1 ? "entry" : "entries"} ·{" "}
                {new Date(profile.generatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </>
          ) : (
            <div className={styles.emptyPortrait}>
              {visibleEntries.length === 0 ? (
                <p>
                  Write at least one journal chapter first — your portrait is built from what you actually put into words.
                </p>
              ) : (
                <p>
                  {visibleEntries.length}{" "}
                  {visibleEntries.length === 1 ? "chapter" : "chapters"} ready.
                  Let your friend read them and sketch who you are.
                </p>
              )}
              {profileError && (
                <p style={{ color: "#d97a8a", fontSize: "0.83rem" }}>{profileError}</p>
              )}
              <button
                className={styles.generateBtn}
                onClick={handleGenerateProfile}
                disabled={isGeneratingProfile || visibleEntries.length === 0}
              >
                Generate my portrait →
              </button>
            </div>
          )}
        </div>

        {/* Natal Chart */}
        <BirthChartSection />

        {/* Available Tests */}
        {availableTests.length > 0 && (
          <div className={styles.testsSection}>
            <span className={styles.sectionLabel}>Projective Exercises</span>
            {availableTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onStart={() => setActiveTest(test)}
              />
            ))}
          </div>
        )}

        {/* Completed Tests */}
        {tests.length > 0 && (
          <div className={styles.completedSection}>
            <span className={styles.sectionLabel}>Completed Exercises</span>
            {tests.map((t) => (
              <CompletedCard
                key={t.id}
                test={t}
                expanded={expandedTestId === t.id}
                onToggle={() =>
                  setExpandedTestId(expandedTestId === t.id ? null : t.id)
                }
              />
            ))}
          </div>
        )}

        {tests.length === 0 && availableTests.length === 0 && (
          <p className={styles.noTests}>All exercises completed.</p>
        )}
      </div>

      {activeTest && (
        <PsychTest
          test={activeTest}
          onComplete={handleTestComplete}
          onClose={() => setActiveTest(null)}
        />
      )}
    </div>
  );
};

const TestCard = ({
  test,
  onStart,
}: {
  test: TestDef;
  onStart: () => void;
}) => (
  <div className={styles.testCard}>
    <span className={styles.testIcon} aria-hidden="true">🔮</span>
    <div className={styles.testInfo}>
      <p className={styles.testTitle}>{test.title}</p>
      <p className={styles.testTagline}>{test.tagline}</p>
      <p className={styles.testDuration}>⏱ {test.duration}</p>
    </div>
    <button className={styles.startTestBtn} onClick={onStart}>
      Begin →
    </button>
  </div>
);

const CompletedCard = ({
  test,
  expanded,
  onToggle,
}: {
  test: CompletedTest;
  expanded: boolean;
  onToggle: () => void;
}) => (
  <>
    <div className={styles.completedCard} onClick={onToggle}>
      <div className={styles.completedHeader}>
        <p className={styles.completedTitle}>{test.title}</p>
        <span className={styles.completedDate}>
          {new Date(test.completedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <p className={styles.completedPreview}>{test.interpretation.slice(0, 100)}…</p>
    </div>
    {expanded && (
      <div className={styles.expandedCard}>
        <p className={styles.expandedTitle}>{test.title}</p>
        <p className={styles.expandedText}>{test.interpretation}</p>
        <button className={styles.collapseBtn} onClick={onToggle}>
          ↑ collapse
        </button>
      </div>
    )}
  </>
);

const Backdrop = () => (
  <div className={styles.backdrop} aria-hidden="true">
    <div className={styles.stars} />
    <div className={`${styles.glow} ${styles.glowA}`} />
    <div className={`${styles.glow} ${styles.glowB}`} />
  </div>
);
