import { motion } from 'motion/react';

interface AuroraBackgroundProps {
  /** 現在のステップのアクセントカラー */
  accent: string;
}

/** 画面全体に敷く、ゆっくり漂うグラデーション背景 */
export function AuroraBackground({ accent }: AuroraBackgroundProps) {
  return (
    <div aria-hidden className="mm-aurora">
      <motion.div
        className="mm-blob mm-blob-a"
        animate={{ backgroundColor: accent, x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{
          backgroundColor: { duration: 0.9, ease: 'easeInOut' },
          x: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 19, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      <motion.div
        className="mm-blob mm-blob-b"
        animate={{ backgroundColor: accent, x: [0, -30, 25, 0], y: [0, 25, -15, 0] }}
        transition={{
          backgroundColor: { duration: 1.2, ease: 'easeInOut' },
          x: { duration: 27, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 21, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      <motion.div
        className="mm-blob mm-blob-c"
        animate={{ x: [0, 20, -25, 0], y: [0, -20, 15, 0] }}
        transition={{
          x: { duration: 31, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 23, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
}
