// → client/components/Journal/MoodSticker/MoodSticker.tsx
//
// A single die-cut mood sticker. Behaves as:
//   - presentational by default (just renders the sticker)
//   - interactive when `onClick` is passed (becomes a real button)
// `selected` adds the dashed selection ring; `dimmed` greys it out so
// other stickers in a picker row fade back when one is chosen.

'use client';

import { MOOD_INDEX } from './moods';
import type { MoodKey } from '@/types/journal';
import styles from './MoodSticker.module.scss';

type Props = {
  mood: MoodKey;
  size?: number;
  rotate?: number;
  selected?: boolean;
  dimmed?: boolean;
  showRim?: boolean;
  onClick?: () => void;
  /** Renders the label beneath the sticker. */
  showLabel?: boolean;
  /** Tweak the title attribute (defaults to the mood's hint). */
  title?: string;
  className?: string;
};

export const MoodSticker = ({
  mood,
  size = 64,
  rotate = 0,
  selected = false,
  dimmed = false,
  showRim = true,
  onClick,
  showLabel = false,
  title,
  className,
}: Props) => {
  const def = MOOD_INDEX[mood];
  if (!def) return null;

  const interactive = typeof onClick === 'function';
  const stickerClass = [
    styles.sticker,
    selected && styles.selected,
    dimmed && styles.dimmed,
    interactive && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <span
      className={stickerClass}
      style={
        {
          '--mood-size': `${size}px`,
          '--mood-rotate': `${rotate}deg`,
        } as React.CSSProperties
      }
    >
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        {showRim && (
          <circle cx="32" cy="32" r="30" fill="#fffaf4" stroke="rgba(60,40,80,0.16)" strokeWidth="1" />
        )}
        {def.body}
      </svg>
      {selected && <span className={styles.selectionRing} aria-hidden="true" />}
    </span>
  );

  const content = (
    <>
      {inner}
      {showLabel && <span className={styles.label}>{def.label}</span>}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        className={styles.wrapper}
        onClick={onClick}
        aria-label={`Tag this chapter as ${def.label.toLowerCase()}`}
        aria-pressed={selected}
        title={title ?? def.hint}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={styles.wrapper} title={title ?? def.hint}>
      {content}
    </span>
  );
};
