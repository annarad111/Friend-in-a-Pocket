// → client/components/Journal/JournalDecor/Doodle.tsx
//
// Hand-drawn margin doodles: squiggle, arrow, star, heart, compass, etc.
// Used as decorative marginalia on notebook pages. Stateless and easily
// recolored / rotated.

'use client';

import type { CSSProperties } from 'react';

export type DoodleKind =
  | 'squiggle'
  | 'arrow'
  | 'star'
  | 'heart'
  | 'compass'
  | 'underline'
  | 'cloud'
  | 'dots3'
  | 'spiral'
  | 'leaf';

type Props = {
  kind: DoodleKind;
  size?: number;
  color?: string;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
};

export const Doodle = ({
  kind,
  size = 60,
  color = '#7c5cff',
  rotate = 0,
  className,
  style,
}: Props) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      {renderDoodle(kind, color)}
    </svg>
  );
};

function renderDoodle(kind: DoodleKind, color: string) {
  switch (kind) {
    case 'squiggle':
      return <path d="M4 30 Q12 8 22 30 T44 30 T66 30" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />;
    case 'arrow':
      return (
        <g stroke={color} strokeWidth={2} fill="none" strokeLinecap="round">
          <path d="M6 30 Q24 14 50 24" />
          <path d="M44 18 L50 24 L42 28" strokeLinejoin="round" />
        </g>
      );
    case 'star':
      return (
        <path
          d="M32 8 L37 26 L54 28 L40 38 L46 56 L32 46 L18 56 L24 38 L10 28 L27 26 Z"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
    case 'heart':
      return (
        <path
          d="M32 52 C12 38 12 22 22 18 C28 16 32 22 32 22 C32 22 36 16 42 18 C52 22 52 38 32 52 Z"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
    case 'compass':
      return (
        <g stroke={color} strokeWidth={2} fill="none">
          <circle cx="32" cy="32" r="22" />
          <path d="M32 14 L36 32 L32 50 L28 32 Z" fill={color} fillOpacity={0.18} />
          <circle cx="32" cy="32" r="2" fill={color} />
        </g>
      );
    case 'underline':
      return <path d="M4 18 Q20 8 36 14 T68 12" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />;
    case 'cloud':
      return (
        <path
          d="M14 36 Q8 36 8 30 Q8 22 18 22 Q20 14 30 14 Q42 14 44 24 Q56 24 56 34 Q56 42 46 42 H16 Q10 42 10 38 Z"
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
      );
    case 'dots3':
      return (
        <g fill={color}>
          <circle cx="16" cy="32" r="3" />
          <circle cx="32" cy="32" r="3" />
          <circle cx="48" cy="32" r="3" />
        </g>
      );
    case 'spiral':
      return (
        <path
          d="M32 32 m-2 0 a2 2 0 1 1 4 0 a4 4 0 1 1 -8 0 a6 6 0 1 1 12 0 a8 8 0 1 1 -16 0 a10 10 0 1 1 20 0"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      );
    case 'leaf':
      return (
        <path
          d="M10 50 Q20 10 50 20 Q40 50 10 50 Z M14 46 Q28 38 44 26"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
  }
}
