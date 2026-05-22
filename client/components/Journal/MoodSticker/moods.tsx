// → client/components/Journal/MoodSticker/moods.tsx
//
// The 9 mood stickers, hand-drawn in SVG. Each `body` is the inner artwork
// that fits inside a 64×64 viewBox; the MoodSticker component wraps it in
// the white die-cut rim + drop shadow.

import type { ReactNode } from 'react';
import type { MoodKey } from '@/types/journal';

export type MoodDef = {
  key: MoodKey;
  label: string;
  /** A short hint shown when the user hovers / focuses the sticker. */
  hint: string;
  body: ReactNode;
};

export const MOODS: MoodDef[] = [
  {
    key: 'sunny',
    label: 'Sunny',
    hint: 'Bright. Energy on tap.',
    body: (
      <g>
        <g stroke="#c98a1a" strokeWidth="3" strokeLinecap="round">
          <line x1="32" y1="6" x2="32" y2="14" />
          <line x1="32" y1="50" x2="32" y2="58" />
          <line x1="6" y1="32" x2="14" y2="32" />
          <line x1="50" y1="32" x2="58" y2="32" />
          <line x1="13" y1="13" x2="18" y2="18" />
          <line x1="46" y1="46" x2="51" y2="51" />
          <line x1="13" y1="51" x2="18" y2="46" />
          <line x1="46" y1="18" x2="51" y2="13" />
        </g>
        <circle cx="32" cy="32" r="14" fill="#ffd25a" stroke="#c98a1a" strokeWidth="2.5" />
        <circle cx="28" cy="30" r="1.6" fill="#3a2810" />
        <circle cx="36" cy="30" r="1.6" fill="#3a2810" />
        <path d="M27 35 Q32 39 37 35" stroke="#3a2810" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="26" cy="34" r="1.3" fill="#ff8aa0" opacity="0.7" />
        <circle cx="38" cy="34" r="1.3" fill="#ff8aa0" opacity="0.7" />
      </g>
    ),
  },
  {
    key: 'cozy',
    label: 'Cozy',
    hint: 'Warm. Slow. A blanket day.',
    body: (
      <g>
        <path d="M24 12 Q22 16 24 20 Q26 24 24 28" stroke="#caa790" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M32 10 Q30 14 32 18 Q34 22 32 26" stroke="#caa790" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M40 12 Q38 16 40 20 Q42 24 40 28" stroke="#caa790" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M16 30 H44 V50 Q44 56 38 56 H22 Q16 56 16 50 Z" fill="#ff9b6e" stroke="#a8472a" strokeWidth="2.2" />
        <path d="M44 36 Q52 36 52 42 Q52 48 44 48" fill="none" stroke="#a8472a" strokeWidth="2.2" />
        <circle cx="26" cy="42" r="1.6" fill="#3a2810" />
        <circle cx="34" cy="42" r="1.6" fill="#3a2810" />
        <path d="M25 46 Q30 49 35 46" stroke="#3a2810" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    key: 'sparkly',
    label: 'Sparkly',
    hint: 'A little electric. Things click.',
    body: (
      <g>
        <path
          d="M32 8 L36 26 L54 30 L36 34 L32 52 L28 34 L10 30 L28 26 Z"
          fill="#c8a4ff"
          stroke="#6f4cd1"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="30" r="4" fill="#fff7d4" />
        <circle cx="14" cy="14" r="2" fill="#ffd25a" />
        <circle cx="50" cy="50" r="2" fill="#ffd25a" />
        <circle cx="50" cy="14" r="1.4" fill="#ff8aa0" />
        <circle cx="14" cy="50" r="1.4" fill="#ff8aa0" />
      </g>
    ),
  },
  {
    key: 'hopeful',
    label: 'Hopeful',
    hint: 'Quiet upward feeling.',
    body: (
      <g>
        <path d="M18 48 L46 48 L42 58 H22 Z" fill="#c97a5a" stroke="#7a3e26" strokeWidth="2" />
        <rect x="16" y="44" width="32" height="6" rx="2" fill="#e09a78" stroke="#7a3e26" strokeWidth="2" />
        <path d="M32 44 Q32 30 32 22" stroke="#3f8a5a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M32 30 Q22 28 20 18 Q30 18 32 28" fill="#7ec88f" stroke="#3f8a5a" strokeWidth="2" />
        <path d="M32 26 Q42 24 44 14 Q34 14 32 24" fill="#9ad6a8" stroke="#3f8a5a" strokeWidth="2" />
        <circle cx="26" cy="52" r="1.4" fill="#3a2810" />
        <circle cx="38" cy="52" r="1.4" fill="#3a2810" />
        <path d="M28 55 Q32 57 36 55" stroke="#3a2810" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    key: 'calm',
    label: 'Calm',
    hint: 'Steady. The water is flat.',
    body: (
      <g>
        <path d="M6 38 Q14 32 22 38 T38 38 T58 38 V58 H6 Z" fill="#9ec9ff" stroke="#3d6bb4" strokeWidth="2" />
        <path d="M6 44 Q14 40 22 44 T38 44 T58 44" fill="none" stroke="#cfe2ff" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 50 Q14 46 22 50 T38 50 T58 50" fill="none" stroke="#cfe2ff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        <path d="M44 14 A14 14 0 1 0 56 26 A10 10 0 0 1 44 14 Z" fill="#fff3c2" stroke="#bf8d2a" strokeWidth="2" />
        <circle cx="18" cy="16" r="1.4" fill="#fff3c2" />
        <circle cx="28" cy="22" r="1.2" fill="#fff3c2" />
      </g>
    ),
  },
  {
    key: 'cloudy',
    label: 'Cloudy',
    hint: 'Soft grey. Things are blurry.',
    body: (
      <g>
        <path
          d="M14 36 Q8 36 8 30 Q8 22 18 22 Q20 14 30 14 Q42 14 44 24 Q56 24 56 34 Q56 42 46 42 H16 Q10 42 10 38 Z"
          fill="#e2dff0"
          stroke="#7e7898"
          strokeWidth="2"
        />
        <circle cx="24" cy="32" r="1.6" fill="#3a2810" />
        <circle cx="34" cy="32" r="1.6" fill="#3a2810" />
        <path d="M22 36 Q29 38 36 36" stroke="#3a2810" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M44 48 Q44 52 40 52" stroke="#7e7898" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M50 50 Q50 54 46 54" stroke="#7e7898" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    key: 'foggy',
    label: 'Foggy',
    hint: 'Hard to see what\u2019s true.',
    body: (
      <g>
        <path d="M10 28 H54 M6 36 H58 M10 44 H54 M14 52 H50" stroke="#a59cc4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="22" cy="36" r="2" fill="#5b5168" opacity="0.6" />
        <circle cx="42" cy="36" r="2" fill="#5b5168" opacity="0.6" />
        <path d="M24 42 Q32 40 40 42" stroke="#5b5168" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    ),
  },
  {
    key: 'stormy',
    label: 'Stormy',
    hint: 'Big weather inside. Notice it.',
    body: (
      <g>
        <path
          d="M14 32 Q8 32 8 26 Q8 18 18 18 Q20 10 30 10 Q42 10 44 20 Q56 20 56 30 Q56 38 46 38 H16 Q10 38 10 34 Z"
          fill="#7a6f9a"
          stroke="#3d3552"
          strokeWidth="2"
        />
        <path d="M28 38 L22 50 L30 50 L26 60 L36 46 L28 46 Z" fill="#ffe066" stroke="#a87a14" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="22" cy="28" r="1.5" fill="#fff" />
        <circle cx="34" cy="28" r="1.5" fill="#fff" />
        <path d="M22 32 Q28 30 34 32" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    key: 'heavy',
    label: 'Heavy',
    hint: 'A weight. Worth setting down.',
    body: (
      <g>
        <path
          d="M14 50 Q10 38 18 30 Q26 22 36 24 Q48 26 50 38 Q52 50 42 54 Q26 58 14 50 Z"
          fill="#a59c9c"
          stroke="#564f4f"
          strokeWidth="2"
        />
        <path d="M18 38 Q24 36 26 40" stroke="#7a7272" strokeWidth="1.5" fill="none" />
        <path d="M40 32 Q44 36 42 40" stroke="#7a7272" strokeWidth="1.5" fill="none" />
        <circle cx="26" cy="46" r="1.5" fill="#2a2622" />
        <circle cx="38" cy="46" r="1.5" fill="#2a2622" />
        <path d="M26 52 Q32 50 38 52" stroke="#2a2622" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M23 41 L29 43" stroke="#2a2622" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M41 41 L35 43" stroke="#2a2622" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    ),
  },
];

export const MOOD_INDEX: Record<MoodKey, MoodDef> = Object.fromEntries(
  MOODS.map((m) => [m.key, m]),
) as Record<MoodKey, MoodDef>;
