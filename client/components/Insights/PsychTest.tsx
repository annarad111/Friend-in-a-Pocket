"use client";

import { useState } from "react";
import { interpretTest } from "@/lib/insightsApi";
import type { TestDef, TestResponse, CompletedTest } from "@/types/insights";
import styles from "./PsychTest.module.scss";

type Phase = "intro" | "questions" | "loading" | "result";

type Props = {
  test: TestDef;
  onComplete: (result: CompletedTest) => void;
  onClose: () => void;
};

export const PsychTest = ({ test, onComplete, onClose }: Props) => {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [interpretation, setInterpretation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalSteps = test.questions.length;
  const current = test.questions[step];

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      await submit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const submit = async () => {
    setPhase("loading");
    setError(null);

    const responses: TestResponse[] = test.questions.map((q) => ({
      questionId: q.id,
      question: q.text,
      answer: answers[q.id] ?? "",
    }));

    try {
      const { interpretation: text } = await interpretTest(test.id, responses);
      setInterpretation(text);
      setPhase("result");
    } catch {
      setError("Something went quiet — try again in a moment.");
      setPhase("questions");
    }
  };

  const handleDone = () => {
    const result: CompletedTest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: test.id,
      title: test.title,
      responses: test.questions.map((q) => ({
        questionId: q.id,
        question: q.text,
        answer: answers[q.id] ?? "",
      })),
      interpretation,
      completedAt: new Date().toISOString(),
    };
    onComplete(result);
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.card}>
        {phase === "intro" && (
          <IntroPhase test={test} onStart={() => setPhase("questions")} onClose={onClose} />
        )}

        {phase === "questions" && current && (
          <QuestionPhase
            test={test}
            step={step}
            totalSteps={totalSteps}
            question={current.text}
            placeholder={current.placeholder}
            value={answers[current.id] ?? ""}
            onChange={(v) => setAnswers((a) => ({ ...a, [current.id]: v }))}
            onNext={handleNext}
            onBack={handleBack}
            onClose={onClose}
            error={error}
            isLast={step === totalSteps - 1}
          />
        )}

        {phase === "loading" && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p>Reading between the lines of your desert…</p>
          </div>
        )}

        {phase === "result" && (
          <ResultPhase
            title={test.title}
            interpretation={interpretation}
            onDone={handleDone}
          />
        )}
      </div>
    </div>
  );
};

// ─── sub-components ───────────────────────────────────────────────

const IntroPhase = ({
  test,
  onStart,
  onClose,
}: {
  test: TestDef;
  onStart: () => void;
  onClose: () => void;
}) => (
  <>
    <span className={styles.introGlyph} aria-hidden="true">🔮</span>
    <span className={styles.introTag}>Projective exercise</span>
    <h2 className={styles.introTitle}>{test.title}</h2>
    <p className={styles.introTagline}>{test.tagline}</p>
    <p className={styles.introDesc}>{test.description}</p>
    <p className={styles.introDuration}>⏱ about {test.duration}</p>
    <button className={styles.nextBtn} style={{ width: "100%" }} onClick={onStart}>
      Begin the visualization →
    </button>
    <div style={{ marginTop: "0.9rem", textAlign: "center" }}>
      <button
        type="button"
        className={styles.backBtn}
        onClick={onClose}
        style={{ fontSize: "0.85rem" }}
      >
        maybe another time
      </button>
    </div>
  </>
);

const QuestionPhase = ({
  test,
  step,
  totalSteps,
  question,
  placeholder,
  value,
  onChange,
  onNext,
  onBack,
  onClose,
  error,
  isLast,
}: {
  test: TestDef;
  step: number;
  totalSteps: number;
  question: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
  error: string | null;
  isLast: boolean;
}) => (
  <>
    <div className={styles.stepHead}>
      <div className={styles.stepPills}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={[
              styles.stepPip,
              i === step ? styles.active : i < step ? styles.done : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>
      <button className={styles.stepClose} onClick={onClose} aria-label="Close test">
        ✕
      </button>
    </div>

    <p className={styles.questionText}>{question}</p>

    <textarea
      className={styles.answerBox}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      autoFocus
    />

    {error && (
      <p style={{ color: "#a12b2b", fontSize: "0.85rem", marginTop: "0.6rem" }}>
        {error}
      </p>
    )}

    <div className={styles.stepActions}>
      <button className={styles.backBtn} onClick={onBack} disabled={step === 0}>
        ← back
      </button>
      <button
        className={styles.nextBtn}
        onClick={onNext}
        disabled={!value.trim()}
      >
        {isLast ? "Reveal my portrait →" : "Next →"}
      </button>
    </div>
  </>
);

const ResultPhase = ({
  title,
  interpretation,
  onDone,
}: {
  title: string;
  interpretation: string;
  onDone: () => void;
}) => (
  <>
    <span className={styles.resultTag}>Your portrait</span>
    <h2 className={styles.resultTitle}>{title}</h2>
    <p className={styles.interpretationText}>{interpretation}</p>
    <button className={styles.primaryBtn} onClick={onDone}>
      Save to my insights →
    </button>
  </>
);
