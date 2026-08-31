import { motion, useReducedMotion } from 'motion/react';

interface MurmurAnpanProps {
  /** 送るたびに増える値。傾きがわずかに変わるだけ */
  nudge: number;
}

/**
 * 端に座っているだけのあんぱん。
 * あいづちも表情の切り替えも返さない（反応を返すと、返事を待つ画面になってしまう）。
 */
export function MurmurAnpan({ nudge }: MurmurAnpanProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.img
      src="/assets/takoyaki_anpan.png"
      alt=""
      aria-hidden
      className="murmur-anpan"
      animate={reduceMotion ? undefined : { y: [0, -4, 0], rotate: nudge % 2 === 0 ? 0 : -2 }}
      transition={{
        y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 1.6, ease: 'easeInOut' },
      }}
    />
  );
}
