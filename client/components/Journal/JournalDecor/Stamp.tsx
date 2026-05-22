// → client/components/Journal/JournalDecor/Stamp.tsx
//
// Circular adventure-style stamp ("DAY 47", "+1 BRAVE", etc.) — the kind
// you'd press onto a passport. Dashed outer ring + optional inner ring +
// tiny stars around the perimeter, with content centered inside.

'use client';

import type { CSSProperties, ReactNode } from 'react';
import styles from './JournalDecor.module.scss';

type Props = {
  children: ReactNode;
  color?: string;
  size?: number;
  rotate?: number;
  /** Show the inner ring. */
  double?: boolean;
  className?: string;
  style?: CSSProperties;
};

export const Stamp = ({
  children,
  color = '#7c5cff',
  size = 78,
  rotate = -8,
  double = true,
  className,
  style,
}: Props) => {
  const r = 46;
  const stars = [0, 60, 120, 180, 240, 300].map((deg) => {
    const x = 50 + r * Math.cos((deg * Math.PI) / 180);
    const y = 50 + r * Math.sin((deg * Math.PI) / 180);
    return { x, y };
  });

  return (
    <span
      className={[styles.stamp, className].filter(Boolean).join(' ')}
      style={
        {
          '--stamp-size': `${size}px`,
          '--stamp-rotate': `${rotate}deg`,
          color,
          ...style,
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="3" strokeDasharray="3 2" opacity="0.85" />
        {double && <circle cx="50" cy="50" r="38" fill="none" stroke={color} strokeWidth="1.4" opacity="0.7" />}
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="1.4" fill={color} opacity="0.7" />
        ))}
      </svg>
      <span className={styles.stampText}>{children}</span>
    </span>
  );
};
