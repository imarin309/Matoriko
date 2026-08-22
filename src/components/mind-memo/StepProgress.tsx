import { motion } from 'motion/react';
import type { Step } from './steps';

interface StepProgressProps {
  steps: Step[];
  /** 現在のステップ index */
  step: number;
  done: boolean;
}

const IDLE = '#e5e7eb';

/** 現在地だけが太くなる、ステップ色つきプログレスバー */
export function StepProgress({ steps, step, done }: StepProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => {
          const active = !done && i === step;
          const filled = done || i <= step;
          return (
            <motion.div
              key={s.key}
              className="h-1.5 rounded-full"
              style={{ flexBasis: 0 }}
              animate={{
                flexGrow: active ? 2.4 : 1,
                backgroundColor: filled ? s.accent : IDLE,
                boxShadow: active ? `0 2px 12px ${s.accent}80` : `0 0px 0px ${s.accent}00`,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            />
          );
        })}
      </div>

      <div className="hidden sm:flex items-center gap-1.5">
        {steps.map((s, i) => {
          const active = !done && i === step;
          return (
            <motion.span
              key={s.key}
              className="text-[10px] text-center truncate"
              style={{ flexBasis: 0 }}
              animate={{
                flexGrow: active ? 2.4 : 1,
                color: active ? s.accent : '#9ca3af',
                fontWeight: active ? 700 : 400,
                opacity: done || i <= step ? 1 : 0.55,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            >
              {s.short}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
