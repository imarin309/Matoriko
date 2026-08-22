import { motion } from 'motion/react';

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

type Level = { emoji: string; color: string; label: string };

const LEVELS: { max: number; level: Level }[] = [
  { max: 20, level: { emoji: '😌', color: '#34d399', label: 'おだやか' } },
  { max: 40, level: { emoji: '🙂', color: '#a3e635', label: 'すこし' } },
  { max: 60, level: { emoji: '😟', color: '#fbbf24', label: 'まあまあ' } },
  { max: 80, level: { emoji: '😣', color: '#fb923c', label: 'かなり' } },
  { max: 100, level: { emoji: '😰', color: '#fb7185', label: 'とても' } },
];

const levelOf = (value: number): Level =>
  (LEVELS.find((l) => value <= l.max) ?? LEVELS[LEVELS.length - 1]).level;

const TICKS = [25, 50, 75];

/** 感情の強度スライダー。値に応じて色と表情が変わる */
export function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const level = levelOf(value);

  return (
    <div className="flex flex-col gap-4">
      {/* 現在値 */}
      <div className="flex items-end justify-center gap-3">
        <motion.span
          key={level.emoji}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="text-3xl leading-none mb-1.5"
        >
          {level.emoji}
        </motion.span>
        <motion.span
          key={value}
          initial={{ scale: 1.18, opacity: 0.55 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="text-5xl font-bold tabular-nums leading-none"
          style={{ color: level.color }}
        >
          {value}
        </motion.span>
        <span className="text-xs text-gray-400 mb-1.5">{level.label}</span>
      </div>

      {/* トラック */}
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          aria-label="感情の強度"
          onChange={(e) => onChange(Number(e.target.value))}
          className="peer absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="mm-track">
          {TICKS.map((t) => (
            <span key={t} className="mm-tick" style={{ left: `${t}%` }} />
          ))}
          <div className="mm-track-mask" style={{ left: `${value}%` }} />
        </div>
        <motion.div
          className="mm-thumb peer-focus-visible:ring-4"
          style={{ borderColor: level.color, ['--tw-ring-color' as string]: `${level.color}55` }}
          animate={{ left: `${value}%` }}
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>0（ほとんどない）</span>
        <span>100（最大）</span>
      </div>
    </div>
  );
}
