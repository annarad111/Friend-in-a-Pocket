// → client/components/Journal/JournalDecor/FriendAvatar.tsx
//
// Tiny crescent-moon-blob avatar standing in for the friend's character
// inside the notebook. Pairs the friend's name (from useChatStore or
// useOnboardingStore) with a small purple blob.

'use client';

import type { CSSProperties } from 'react';
import styles from './JournalDecor.module.scss';

type Props = {
  name?: string;
  size?: number;
  /** Lay out vertically (avatar on top, name below) instead of in a row. */
  vertical?: boolean;
  className?: string;
  style?: CSSProperties;
};

export const FriendAvatar = ({
  name = 'Friend',
  size = 36,
  vertical = false,
  className,
  style,
}: Props) => {
  // Stable gradient id per name so multiple avatars on a page don't collide.
  const gradId = `fa-grad-${slug(name)}`;

  return (
    <span
      className={[styles.avatar, vertical && styles.avatarVertical, className].filter(Boolean).join(' ')}
      style={style}
    >
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" className={styles.avatarBlob}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8a4ff" />
            <stop offset="100%" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill={`url(#${gradId})`} stroke="#5e44c8" strokeWidth="1.5" />
        <path d="M28 14 A12 12 0 1 0 30 26 A8 8 0 0 1 28 14 Z" fill="#fff7d4" opacity="0.85" />
        <circle cx="16" cy="20" r="1.8" fill="#2a2342" />
        <circle cx="24" cy="20" r="1.8" fill="#2a2342" />
        <path d="M15 24 Q20 26 25 24" stroke="#2a2342" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <circle cx="13" cy="23" r="1.4" fill="#ff9bc7" opacity="0.7" />
        <circle cx="27" cy="23" r="1.4" fill="#ff9bc7" opacity="0.7" />
      </svg>
      <span className={styles.avatarName}>{name}</span>
    </span>
  );
};

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'friend';
}
