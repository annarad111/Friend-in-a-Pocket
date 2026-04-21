'use client';

import styles from './DreamyBackground.module.scss';

export const DreamyBackground = () => {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.starsLayerOne} />
      <div className={styles.starsLayerTwo} />
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />
      <div className={styles.glowThree} />
    </div>
  );
};