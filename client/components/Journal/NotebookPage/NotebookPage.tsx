// → client/components/Journal/NotebookPage/NotebookPage.tsx
//
// The cream-paper sheet that every journal screen sits on. Slots:
//   - spiral binding along the top (desktop)
//   - sewn binding along the left (mobile)
//   - faint horizontal rule lines
//   - red margin line
//   - optional page-corner curl
//   - paper grain via a layered radial dot pattern

'use client';

import type { CSSProperties, ReactNode } from 'react';
import styles from './NotebookPage.module.scss';

type Props = {
  children: ReactNode;
  width?: number;
  height?: number;
  /** Degrees of tilt for that "lifted off the desk" feel. */
  tilt?: number;
  binding?: 'spiral' | 'sewn' | 'none';
  /** Show the red margin line on the left. */
  margin?: boolean;
  /** Show faint horizontal rule lines. */
  ruled?: boolean;
  /** Spacing between rule lines in px. */
  ruleSize?: number;
  /** Show the bottom-right page-corner curl. */
  cornerCurl?: boolean;
  className?: string;
  style?: CSSProperties;
};

export const NotebookPage = ({
  children,
  width = 720,
  height = 880,
  tilt = 0,
  binding = 'spiral',
  margin = true,
  ruled = true,
  ruleSize = 32,
  cornerCurl = false,
  className,
  style,
}: Props) => {
  return (
    <div
      className={[styles.outer, className].filter(Boolean).join(' ')}
      style={
        {
          '--np-width': `${width}px`,
          '--np-height': `${height}px`,
          '--np-tilt': `${tilt}deg`,
          '--np-rule-size': `${ruleSize}px`,
          ...style,
        } as CSSProperties
      }
    >
      <div className={styles.paper}>
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.stain} aria-hidden="true" />
        {ruled && <div className={styles.rule} aria-hidden="true" />}
        {margin && <div className={styles.marginLine} aria-hidden="true" />}

        {binding === 'spiral' && <SpiralBinding width={width} />}
        {binding === 'sewn' && <SewnBinding height={height} />}

        {cornerCurl && <PageCornerCurl />}

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

const SpiralBinding = ({ width }: { width: number }) => {
  const count = Math.max(4, Math.floor((width - 60) / 36));
  return (
    <div className={styles.spiral} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={styles.spiralRing}>
          <span className={styles.spiralShadow} />
        </span>
      ))}
    </div>
  );
};

const SewnBinding = ({ height }: { height: number }) => {
  const count = Math.max(6, Math.floor((height - 40) / 18));
  return (
    <div className={styles.sewn} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={styles.sewnDash} />
      ))}
    </div>
  );
};

const PageCornerCurl = () => (
  <svg
    className={styles.curl}
    viewBox="0 0 80 80"
    width="80"
    height="80"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="np-curl-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fffaf4" />
        <stop offset="55%" stopColor="#ece2d4" />
        <stop offset="100%" stopColor="#bcae9c" />
      </linearGradient>
    </defs>
    <path d="M80,80 L80,30 Q60,55 30,80 Z" fill="url(#np-curl-g)" stroke="rgba(60,40,80,0.18)" strokeWidth="0.8" />
    <path d="M80,30 Q60,55 30,80" fill="none" stroke="rgba(60,40,80,0.12)" strokeWidth="0.8" />
  </svg>
);
