'use client';

import { useState } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { generateOnboardingProfile } from '@/lib/generateOnboardingProfile';
import styles from './OnboardingForm.module.scss';

export const OnboardingForm = () => {
  const {
    startOnboardingGeneration,
    finishOnboardingGeneration,
    setOnboardingError,
    isGeneratingProfile,
    onboardingError,
  } = useOnboardingStore();

  const [friendName, setFriendName] = useState('');
  const [favoriteAnimal, setFavoriteAnimal] = useState('');
  const [favoriteColor, setFavoriteColor] = useState('');
  const [favoriteInstrument, setFavoriteInstrument] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const profile = {
      friendName: friendName.trim(),
      favoriteAnimal: favoriteAnimal.trim(),
      favoriteColor: favoriteColor.trim(),
      favoriteInstrument: favoriteInstrument.trim(),
    };

    if (
      !profile.friendName ||
      !profile.favoriteAnimal ||
      !profile.favoriteColor ||
      !profile.favoriteInstrument
    ) {
      setOnboardingError('Te rog completează toate câmpurile.');
      return;
    }

    try {
      startOnboardingGeneration(profile);

      const generatedProfile = await generateOnboardingProfile(profile);

      finishOnboardingGeneration(generatedProfile);
    } catch {
      setOnboardingError(
        'Nu am putut genera profilul tău simbolic acum. Te rog încearcă din nou.'
      );
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Create your Friend in a Pocket !</h1>
          <p>
            Before we begin, personalize your space so your friend can feel
            more natural, warm, and aligned with you.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>What name would you like to give me as your friend?</span>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Ex: Luna, Sol, Mira..."
            />
          </label>

          <label className={styles.field}>
            <span>What is your favorite animal?</span>
            <input
              type="text"
              value={favoriteAnimal}
              onChange={(e) => setFavoriteAnimal(e.target.value)}
              placeholder="Ex: cat, wolf, tiger..."
            />
          </label>

          <label className={styles.field}>
            <span>What is your favorite color?</span>
            <input
              type="text"
              value={favoriteColor}
              onChange={(e) => setFavoriteColor(e.target.value)}
              placeholder="Ex: lavender, blue, emerald..."
            />
          </label>

          <label className={styles.field}>
            <span>What is your favorite musical instrument?</span>
            <input
              type="text"
              value={favoriteInstrument}
              onChange={(e) => setFavoriteInstrument(e.target.value)}
              placeholder="Ex: piano, violin, guitar..."
            />
          </label>

          {onboardingError && <div className={styles.error}>{onboardingError}</div>}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={isGeneratingProfile}
          >
            {isGeneratingProfile ? 'Creating your symbolic profile...' : 'Create my companion'}
          </button>
        </form>
      </div>
    </section>
  );
};