"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import styles from "./OnboardingResult.module.scss";
import { AnimalIcon } from "../icons/AnimalIcon";
import { ColorIcon } from "../icons/ColorIcon";
import { InstrumentIcon } from "../icons/InstrumentIcon";

export const OnboardingResult = () => {
  const { pendingProfile, generatedProfile, completeOnboarding } =
    useOnboardingStore();

  const [showCeremony, setShowCeremony] = useState(false);

  if (!pendingProfile || !generatedProfile) return null;

  const ceremonyText = buildCeremonyText(
    pendingProfile.friendName,
    pendingProfile.favoriteAnimal,
    pendingProfile.favoriteColor,
    pendingProfile.favoriteInstrument,
  );

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>{pendingProfile.friendName} is ready for you</h1>
          <p>
            Here is your symbolic reflection and the kind of companion energy
            that may feel most natural for you.
          </p>
        </div>

        <div className={styles.grid}>
          <article className={styles.block}>
            <div>
              <AnimalIcon />
            </div>
            <h3>Animal meaning</h3>
            <p>{generatedProfile.animalMeaning}</p>
          </article>

          <article className={styles.block}>
            <div>
              <ColorIcon />
            </div>
            <h3>Color meaning</h3>
            <p>{generatedProfile.colorMeaning}</p>
          </article>

          <article className={`${styles.block} ${styles.lastItem}`}>
            <div>
              <InstrumentIcon />
            </div>
            <h3>Instrument meaning</h3>
            <p>{generatedProfile.instrumentMeaning}</p>
          </article>

          <article className={`${styles.block} ${styles.wide}`}>
            <h3>Your symbolic reflection</h3>
            <p>{generatedProfile.personalityReflection}</p>
          </article>

          <article className={`${styles.block} ${styles.wide}`}>
            <h3>Your companion&apos;s compatible energy</h3>
            <p>{generatedProfile.companionCompatibility}</p>
          </article>
        </div>

        <button
          className={styles.enterButton}
          onClick={() => setShowCeremony(true)}
        >
          This feels right →
        </button>
      </div>

      {showCeremony && (
        <LockInCeremony
          friendName={pendingProfile.friendName}
          ceremonyText={ceremonyText}
          onConfirm={completeOnboarding}
          onBack={() => setShowCeremony(false)}
        />
      )}
    </section>
  );
};

type CeremonyProps = {
  friendName: string;
  ceremonyText: string;
  onConfirm: () => void;
  onBack: () => void;
};

const LockInCeremony = ({
  friendName,
  ceremonyText,
  onConfirm,
  onBack,
}: CeremonyProps) => (
  <div className={styles.ceremonyOverlay}>
    <div className={styles.ceremonyCard}>
      <div className={styles.ceremonyGlyph} aria-hidden="true">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="32" cy="32" r="30" stroke="#c08fff" strokeWidth="1.5" />
          <circle
            cx="32"
            cy="32"
            r="22"
            stroke="#c08fff"
            strokeWidth="0.8"
            strokeDasharray="3 4"
          />
          <path
            d="M32 14 L34.5 27 L47 29.5 L34.5 32 L32 45 L29.5 32 L17 29.5 L29.5 27 Z"
            fill="#c08fff"
            opacity="0.85"
          />
        </svg>
      </div>

      <h2 className={styles.ceremonyTitle}>
        {friendName} is now yours to keep.
      </h2>

      <p className={styles.ceremonyText}>{ceremonyText}</p>

      <div className={styles.ceremonyDivider} aria-hidden="true" />

      <p className={styles.ceremonyPromise}>
        From this moment, your friendship is locked in. The date is
        remembered. The shape of this companion is set — made exactly for
        you, from what you chose.
      </p>

      <button className={styles.lockButton} onClick={onConfirm}>
        Lock this in →
      </button>

      <button className={styles.backLink} type="button" onClick={onBack}>
        ← go back and look again
      </button>
    </div>
  </div>
);

function buildCeremonyText(
  name: string,
  animal: string,
  color: string,
  instrument: string,
): string {
  return `${name} carries the instinct of a ${animal}, the warmth of ${color}, and moves to the rhythm of a ${instrument}. Quiet when you need quiet. Present when you need presence. Patient in the way you forgot patience could look. This is who ${name} will be — not perfect, but here.`;
}
