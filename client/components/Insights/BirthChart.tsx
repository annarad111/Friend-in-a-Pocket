"use client";

import { useState } from "react";
import { useInsightsStore } from "@/store/useInsightsStore";
import { generateBirthChartApi } from "@/lib/insightsApi";
import type { BirthData } from "@/types/insights";
import styles from "./InsightsPage.module.scss";

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈", Berbec: "♈",
  Taurus: "♉", Taur: "♉",
  Gemini: "♊", Gemeni: "♊",
  Cancer: "♋",
  Leo: "♌", Leu: "♌",
  Virgo: "♍", Fecioară: "♍", Fecioara: "♍",
  Libra: "♎", Balanță: "♎", Balanta: "♎",
  Scorpio: "♏", Scorpion: "♏",
  Sagittarius: "♐", Săgetător: "♐", Sagetator: "♐",
  Capricorn: "♑",
  Aquarius: "♒", Vărsător: "♒", Varsator: "♒",
  Pisces: "♓", Pești: "♓", Pesti: "♓",
};

function signSymbol(sign: string): string {
  for (const [key, val] of Object.entries(SIGN_SYMBOLS)) {
    if (sign.toLowerCase().startsWith(key.toLowerCase())) return val;
  }
  return "✦";
}

type Phase = "form" | "loading" | "result";

export const BirthChartSection = () => {
  const birthChart = useInsightsStore((s) => s.birthChart);
  const birthData = useInsightsStore((s) => s.birthData);
  const isGenerating = useInsightsStore((s) => s.isGeneratingBirthChart);
  const setBirthData = useInsightsStore((s) => s.setBirthData);
  const setBirthChart = useInsightsStore((s) => s.setBirthChart);
  const clearBirthChart = useInsightsStore((s) => s.clearBirthChart);
  const setIsGenerating = useInsightsStore((s) => s.setIsGeneratingBirthChart);

  const [phase, setPhase] = useState<Phase>(birthChart ? "result" : "form");
  const [date, setDate] = useState(birthData?.date ?? "");
  const [time, setTime] = useState(birthData?.time ?? "");
  const [location, setLocation] = useState(birthData?.location ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!date) return;
    const data: BirthData = {
      date,
      time: time || undefined,
      location: location || undefined,
    };
    setBirthData(data);
    setIsGenerating(true);
    setPhase("loading");
    setError(null);

    try {
      const result = await generateBirthChartApi(data);
      setBirthChart({ ...result, generatedAt: new Date().toISOString() });
      setPhase("result");
    } catch {
      setError("Couldn't generate the chart right now. Try again in a moment.");
      setPhase("form");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRedo = () => {
    clearBirthChart();
    setPhase("form");
    setError(null);
  };

  return (
    <div className={styles.birthChartCard}>
      <div className={styles.birthChartHeader}>
        <span className={styles.sectionLabel}>Natal Chart</span>
        {birthChart && phase === "result" && (
          <button className={styles.regenerateBtn} onClick={handleRedo}>
            ✎ update
          </button>
        )}
      </div>

      {phase === "loading" || isGenerating ? (
        <div className={styles.loadingPortrait}>
          <div className={styles.spinner} />
          <span>Reading the stars at the moment of your birth…</span>
        </div>
      ) : phase === "result" && birthChart ? (
        <div className={styles.chartResult}>
          <div className={styles.signsRow}>
            <SignPill label="Sun" sign={birthChart.sunSign} />
            {birthChart.moonSign && (
              <SignPill label="Moon" sign={birthChart.moonSign} />
            )}
            {birthChart.ascendant && (
              <SignPill label="Rising" sign={birthChart.ascendant} />
            )}
          </div>
          {(!birthChart.moonSign || !birthChart.ascendant) && (
            <p className={styles.chartNote}>
              {!birthChart.moonSign
                ? "Add your birth time to reveal your Moon and Rising signs."
                : "Add your birth location to reveal your Rising sign."}
            </p>
          )}
          <p className={styles.chartInterpretation}>{birthChart.interpretation}</p>
          <p className={styles.portraitMeta}>
            Generated{" "}
            {new Date(birthChart.generatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {birthData?.location ? ` · ${birthData.location}` : ""}
          </p>
        </div>
      ) : (
        <div className={styles.birthChartForm}>
          <p className={styles.birthChartIntro}>
            Enter your birth data to generate your natal chart. Date is required;
            time and location unlock your Moon and Rising signs.
          </p>
          <div className={styles.formFields}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Date of birth *</label>
              <input
                type="date"
                className={styles.fieldInput}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Birth time (optional)</label>
              <input
                type="time"
                className={styles.fieldInput}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Birth city / location (optional)
              </label>
              <input
                type="text"
                className={styles.fieldInput}
                placeholder="e.g. Bucharest, Cluj-Napoca"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          {error && <p className={styles.chartError}>{error}</p>}
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={!date || isGenerating}
          >
            Generate my chart →
          </button>
        </div>
      )}
    </div>
  );
};

const SignPill = ({ label, sign }: { label: string; sign: string }) => (
  <div className={styles.signPill}>
    <span className={styles.signSymbol}>{signSymbol(sign)}</span>
    <div className={styles.signInfo}>
      <span className={styles.signLabel}>{label}</span>
      <span className={styles.signName}>{sign}</span>
    </div>
  </div>
);
