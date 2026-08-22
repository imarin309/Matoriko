import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface AnpanBubbleProps {
  children: ReactNode;
}

/** ふわふわ浮くあんぱん＋しっぽ付き吹き出し */
export function AnpanBubble({ children }: AnpanBubbleProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-start gap-4">
      <motion.div
        className="shrink-0 mt-1"
        animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.img
          src="/assets/anpan.png"
          alt="あんぱん"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md"
          initial={{ scale: 0.85, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
        />
      </motion.div>

      <div className="mm-bubble mm-card px-5 py-4 flex-1">{children}</div>
    </div>
  );
}
