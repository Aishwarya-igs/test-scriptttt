import { useMemo, type CSSProperties } from 'react';

const COLORS = ['var(--status-good)', 'var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];

/** Fired once when a run finishes fully green — cosmetic only, no deps. */
export function Confetti({ pieceCount = 70 }: { pieceCount?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        duration: 1.6 + Math.random() * 1.3,
        color: COLORS[i % COLORS.length],
        rotate: Math.round(Math.random() * 360),
        drift: Math.round((Math.random() - 0.5) * 140),
      })),
    [pieceCount],
  );

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--drift': `${p.drift}px`,
              transform: `rotate(${p.rotate}deg)`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
