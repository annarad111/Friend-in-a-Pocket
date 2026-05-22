// → client/components/Journal/JournalDecor/WashiTape.tsx
//
// Diagonal "tape" strip used to stick the notebook page to the dreamy
// background — paper craft vibe. Choose a color preset or pass any CSS
// color, and a pattern preset (solid, dots, stripes).

'use client';

import type { CSSProperties } from 'react';
import styles from './JournalDecor.module.scss';

type TapeColor = 'yellow' | 'pink' | 'mint' | 'lav';
type TapePattern = 'solid' | 'dots' | 'stripes';

type Props = {
  color?: TapeColor | string;
  width?: number;
  height?: number;
  rotate?: number;
  pattern?: TapePattern;
  className?: string;
  style?: CSSProperties;
};

const PRESETS: Record<TapeColor, string> = {
  yellow: '#ffe28a',
  pink: '#ffc2d4',
  mint: '#bfe7d4',
  lav: '#d4c4ff',
};

export const WashiTape = ({
  color = 'yellow',
  width = 110,
  height = 24,
  rotate = -6,
  pattern = 'solid',
  className,
  style,
}: Props) => {
  const base = (PRESETS as Record<string, string>)[color] ?? color;
  let background: string = base;
  if (pattern === 'dots') {
    background = `radial-gradient(rgba(255,255,255,0.7) 1.2px, transparent 1.6px) 0 0/8px 8px, ${base}`;
  } else if (pattern === 'stripes') {
    background = `repeating-linear-gradient(135deg, rgba(255,255,255,0.45) 0 3px, transparent 3px 7px), ${base}`;
  }

  return (
    <span
      className={[styles.tape, className].filter(Boolean).join(' ')}
      aria-hidden="true"
      style={
        {
          '--tape-w': `${width}px`,
          '--tape-h': `${height}px`,
          '--tape-rotate': `${rotate}deg`,
          background,
          ...style,
        } as CSSProperties
      }
    />
  );
};
