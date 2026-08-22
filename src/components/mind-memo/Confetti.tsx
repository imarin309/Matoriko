import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface ConfettiProps {
  /** 紙吹雪の色。参照が安定した配列を渡すこと */
  colors: string[];
  /** 見た目を変えるための種。イベントハンドラ側で生成して渡す */
  seed?: number;
  count?: number;
}

const LIFETIME_MS = 4500;

/** 決定的な擬似乱数（レンダー中に呼んでも純粋） */
const noise = (i: number, salt: number, seed: number) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233 + seed * 3.7) * 43758.5453;
  return x - Math.floor(x);
};

/** 完了時にひらひら降る紙吹雪。ライブラリ非依存 */
export function Confetti({ colors, seed = 0, count = 28 }: ConfettiProps) {
  const reduceMotion = useReducedMotion();
  const [alive, setAlive] = useState(true);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: noise(i, 1, seed) * 100,
        delay: noise(i, 2, seed) * 0.6,
        duration: 2.4 + noise(i, 3, seed) * 1.4,
        drift: noise(i, 4, seed) * 80 - 40,
        rotate: noise(i, 5, seed) * 720 - 360,
        size: 6 + noise(i, 6, seed) * 6,
        color: colors[i % colors.length],
        round: noise(i, 7, seed) > 0.6,
      })),
    [colors, count, seed]
  );

  useEffect(() => {
    const timer = setTimeout(() => setAlive(false), LIFETIME_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!alive || reduceMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[900] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            backgroundColor: p.color,
            borderRadius: p.round ? '9999px' : '2px',
          }}
          initial={{ y: '-12vh', x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '108vh', x: p.drift, rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
            opacity: { duration: p.duration, delay: p.delay, ease: 'linear', times: [0, 0.8, 1] },
          }}
        />
      ))}
    </div>
  );
}
