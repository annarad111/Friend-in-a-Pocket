'use client';

import { useOnboardingStore } from '@/store/useOnboardingStore';
import styles from './OnboardingResult.module.scss';

export const OnboardingResult = () => {
  const { pendingProfile, generatedProfile, completeOnboarding } = useOnboardingStore();

  if (!pendingProfile || !generatedProfile) return null;

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
            <h3>Animal meaning</h3>
            <p>{generatedProfile.animalMeaning}</p>
          </article>

          <article className={styles.block}>
            <h3>Color meaning</h3>
            <p>{generatedProfile.colorMeaning}</p>
          </article>

          <article className={`${styles.block} ${styles.lastItem}`}>
            <h3>Instrument meaning</h3>
            <p>{generatedProfile.instrumentMeaning}</p>
          </article>

          <article className={`${styles.block} ${styles.wide}`}>
            <h3>Your symbolic reflection</h3>
            <p>{generatedProfile.personalityReflection}</p>
          </article>

          <article className={`${styles.block} ${styles.wide}`}>
            <h3>Your companion’s compatible energy</h3>
            <p>{generatedProfile.companionCompatibility}</p>
          </article>
        </div>

        <button className={styles.enterButton} onClick={completeOnboarding}>
          Enter my space
        </button>
      </div>
    </section>
  );
};