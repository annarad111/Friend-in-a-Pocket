// → client/components/Journal/JournalEntry/JournalCelebration.tsx
//
// The "sealed!" celebration that overlays the entry screen after the
// user successfully seals a chapter. Confetti + stamps + streak strip +
// next-chapter teaser. Click outside (or "back to chat" / "see notebook")
// to dismiss.

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useJournalStore } from '@/store/useJournalStore';
import { MoodSticker } from '@/components/Journal/MoodSticker/MoodSticker';
import { Doodle } from '@/components/Journal/JournalDecor/Doodle';
import type { MoodKey } from '@/types/journal';
import styles from './JournalEntry.module.scss';

type Props = {
  chapter: number;
  friendName: string;
};

const PRAISE = [
  'Chapter sealed,\nlittle adventurer.',
  'Tucked into your notebook,\nbrave one.',
  'A real noticing.\nSafe in the pages.',
  'One chapter braver.\nThe shelf is growing.',
];

export const JournalCelebration = ({ chapter, friendName }: Props) => {
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);
  const acknowledgeSeal = useJournalStore((s) => s.acknowledgeSeal);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const praise = useMemo(() => PRAISE[chapter % PRAISE.length], [chapter]);

  // Pull the last 5 sealed moods for the streak strip (newest at end).
  const recent: MoodKey[] = useMemo(() => {
    return entries.slice(0, 5).reverse().map((e) => e.mood);
  }, [entries]);

  const dismiss = () => acknowledgeSeal();

  const goNotebook = () => {
    acknowledgeSeal();
    router.push('/journal/past');
  };

  const goChat = () => {
    acknowledgeSeal();
    router.push('/');
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.celebration}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={dismiss}
        role="dialog"
        aria-label="Chapter sealed"
      >
        <Confetti />
        <motion.div
          className={styles.celebrationCard}
          initial={{ y: 30, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.celebrationStamps}>
            <span className={`${styles.celebrationStamp} ${styles.stampSun}`}>+1 brave</span>
            <span className={`${styles.celebrationStamp} ${styles.stampMint}`}>+1 curious</span>
            <span className={`${styles.celebrationStamp} ${styles.stampPink}`}>+1 honest</span>
          </div>

          <h2 className={styles.celebrationTitle}>{praise}</h2>
          <p className={styles.celebrationSub}>
            That was a real noticing. The kind that softens something later
            without you having to push for it. {friendName} tucked Chapter{' '}
            {chapter} into your notebook with the others.
          </p>

          {recent.length > 0 && (
            <div className={styles.streak}>
              <div className={styles.streakHead}>
                <span>Your streak</span>
                <span className={styles.streakCount}>
                  {recent.length} {recent.length === 1 ? 'chapter' : 'chapters'} this week
                </span>
              </div>
              <div className={styles.streakRow}>
                {recent.map((mood, i) => (
                  <div key={i} className={styles.streakDay}>
                    <MoodSticker mood={mood} size={32} rotate={(i - 2) * 4} />
                  </div>
                ))}
                {recent.length < 7 && (
                  <div className={`${styles.streakDay} ${styles.streakDayEmpty}`}>
                    <span className={styles.streakDayPlaceholder} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.tomorrow}>
            <Doodle kind="star" size={28} color="#ffd25a" />
            <span>
              next chapter unlocks at dawn — tomorrow&rsquo;s prompt is a soft one.
            </span>
          </div>

          <div className={styles.celebrationActions}>
            <button type="button" className={styles.sealButton} onClick={goNotebook}>
              Flip through past chapters →
            </button>
            <button
              type="button"
              className={styles.sealButton}
              style={{ background: 'linear-gradient(135deg, #9d4fbd 0%, #c08fff 100%)' }}
              onClick={() => { acknowledgeSeal(); router.push('/journal/letters'); }}
            >
              Write a letter to future you →
            </button>
            <button type="button" className={styles.linkButton} onClick={goChat}>
              back to {friendName}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── confetti ──────────────────────────────────────────────────
// Lottie-style party burst: ~96 pieces (rectangles + circles + curly
// streamer ribbons) explode outward from the centre of the overlay,
// follow a real parabolic trajectory (v·t + ½·g·t²) precomputed per
// piece at 6 keyframes, tumble as they fly, and fade out as they exit.
//
// Each celebration mount re-seeds (Date.now()), so two consecutive
// seals look different.
const PIECE_COUNT = 96;
const G = 720; // px/s² downward acceleration
const TIMES = [0, 0.06, 0.2, 0.45, 0.72, 1] as const;
const PALETTE = [
  '#ff4081', '#f06292', '#ba68c8', '#7e57c2',
  '#4fc3f7', '#26c6da', '#aed581', '#9ccc65',
  '#fff176', '#ffd54f', '#ffb74d', '#ff8a65',
];

type PieceKind = 'rect' | 'circle' | 'streamer';

type Piece = {
  id: number;
  kind: PieceKind;
  color: string;
  width: number;
  height: number;
  /** trajectory samples — same length as TIMES. */
  xs: number[];
  ys: number[];
  rotations: number[];
  duration: number;
  popDelay: number;
};

const Confetti = () => {
  const pieces = useMemo<Piece[]>(() => {
    const rng = mulberry32(Date.now() & 0xffffff);
    return Array.from({ length: PIECE_COUNT }, (_, i) => {
      const kindRoll = rng();
      const kind: PieceKind =
        kindRoll < 0.55 ? 'rect' : kindRoll < 0.85 ? 'circle' : 'streamer';

      // Launch angle: fan biased upward (0 = straight up, ±140°).
      // This is what gives the "POP" silhouette — most pieces go up &
      // out, then gravity takes them down.
      const angleDeg = (rng() - 0.5) * 280;
      const angleRad = (angleDeg * Math.PI) / 180;
      const speed = 320 + rng() * 380;

      const vx = Math.sin(angleRad) * speed;
      const vy = -Math.cos(angleRad) * speed;

      // Tiny per-piece origin jitter so the burst doesn't look like all
      // 96 pieces came from a single mathematical point.
      const sx = (rng() - 0.5) * 18;
      const sy = (rng() - 0.5) * 18;

      const duration = 2.2 + rng() * 1.6;
      const xs = TIMES.map((t) => sx + vx * (t * duration));
      const ys = TIMES.map(
        (t) => sy + vy * (t * duration) + 0.5 * G * (t * duration) ** 2,
      );

      const baseSize = 7 + rng() * 9;
      let width = baseSize;
      let height = baseSize;
      if (kind === 'rect') {
        height = baseSize * 0.55;
      } else if (kind === 'streamer') {
        width = 6 + rng() * 3;
        height = 32 + rng() * 24;
      }

      const rotStart = rng() * 360;
      const rotDelta = (rng() - 0.5) * (kind === 'streamer' ? 540 : 1080);
      const rotations = TIMES.map((t) => rotStart + rotDelta * t);

      return {
        id: i,
        kind,
        color: PALETTE[Math.floor(rng() * PALETTE.length)],
        width,
        height,
        xs,
        ys,
        rotations,
        duration,
        popDelay: rng() * 0.22,
      };
    });
  }, []);

  return (
    <div className={styles.confetti} aria-hidden="true">
      <div className={styles.confettiOrigin}>
        {pieces.map((p) => (
          <ConfettiPiece key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
};

const ConfettiPiece = ({ p }: { p: Piece }) => {
  const initial = {
    scale: 0,
    opacity: 0,
    x: p.xs[0],
    y: p.ys[0],
    rotate: p.rotations[0],
  };
  const animate = {
    scale: [0, 1.4, 1, 1, 1, 0.85],
    opacity: [0, 1, 1, 1, 0.95, 0],
    x: p.xs,
    y: p.ys,
    rotate: p.rotations,
  };
  // ease:'linear' because trajectory is precomputed at the keyframes;
  // anything else would distort the parabola between samples.
  const transition = {
    duration: p.duration,
    delay: p.popDelay,
    times: [...TIMES],
    ease: 'linear' as const,
  };

  const baseStyle: React.CSSProperties = {
    width: p.width,
    height: p.height,
    marginLeft: -p.width / 2,
    marginTop: -p.height / 2,
  };

  if (p.kind === 'streamer') {
    return (
      <motion.span
        className={styles.confettiStreamer}
        style={baseStyle}
        initial={initial}
        animate={animate}
        transition={transition}
      >
        <svg
          viewBox={`0 0 ${p.width} ${p.height}`}
          width={p.width}
          height={p.height}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={
              `M ${p.width / 2} 0 ` +
              `Q 0 ${p.height * 0.25} ${p.width / 2} ${p.height * 0.5} ` +
              `T ${p.width / 2} ${p.height}`
            }
            stroke={p.color}
            strokeWidth={p.width * 0.55}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </motion.span>
    );
  }

  return (
    <motion.span
      className={p.kind === 'rect' ? styles.confettiRect : styles.confettiCircle}
      style={{ ...baseStyle, backgroundColor: p.color }}
      initial={initial}
      animate={animate}
      transition={transition}
    />
  );
};

function mulberry32(seed: number) {
  let t = seed;
  return function rand() {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
