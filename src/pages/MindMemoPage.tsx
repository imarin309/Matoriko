import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppHeader } from '../components/header';
import { MindMemoActions } from '../components/mind-memo/MindMemoActions';
import { AnpanBubble } from '../components/mind-memo/AnpanBubble';
import { AuroraBackground } from '../components/mind-memo/AuroraBackground';
import { StepProgress } from '../components/mind-memo/StepProgress';
import { IntensitySlider } from '../components/mind-memo/IntensitySlider';
import { Confetti } from '../components/mind-memo/Confetti';
import {
  STEPS,
  STEP_ACCENTS,
  DONE_ACCENT,
  initialForm,
  type FormState,
} from '../components/mind-memo/steps';

const INPUT_PLACEHOLDER = 'ここに書いてみましょう';

const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

export function MindMemoPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);
  const [confettiSeed, setConfettiSeed] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const accent = done ? DONE_ACCENT : current.accent;

  const set = (field: keyof FormState, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const goNext = () => {
    if (isLast) {
      setConfettiSeed(Math.random() * 1000);
      setDone(true);
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (done) {
      setDone(false);
    } else if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleDownload = () => {
    const content = `自分のこころを見つめなおすメモ

◼状況
${form.situation}

◼感情
${form.emotion}

◼感情の強度
${form.intensity}

◼自動思考
${form.thought}

◼根拠
${form.evidence}

◼反証
${form.counter}

◼もう一度冷静になって考えてみる
${form.rethink}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    a.href = url;
    a.download = `mindMemo_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setForm(initialForm);
    setStep(0);
    setDone(false);
  };

  const showBeforeAfter = Boolean(form.thought || form.rethink);

  return (
    <div className="mm-shell min-h-screen" style={{ ['--accent' as string]: accent }}>
      <AuroraBackground />

      {/* ヘッダー */}
      <div className="app-header">
        <AppHeader title="mind-memo" isSubPage />
        <MindMemoActions done={done} onDownload={handleDownload} />
      </div>

      {done && <Confetti colors={STEP_ACCENTS} seed={confettiSeed} />}

      {/* コンテンツ */}
      <div className="max-w-lg mx-auto px-4 pb-16 flex flex-col gap-6" style={{ paddingTop: 'max(10rem, calc(7.5rem + env(safe-area-inset-top)))' }}>

        <StepProgress steps={STEPS} step={step} done={done} />

        <AnimatePresence mode="wait" custom={direction}>
          {!done ? (
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              {/* あんぱん＋吹き出し */}
              <AnpanBubble>
                <span className="mm-pill mb-2">
                  <span className="mm-pill-dot" />
                  {current.hint}
                </span>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {current.question}
                </p>
              </AnpanBubble>

              {/* 入力エリア */}
              <div className="mm-input-card">
                {current.type === 'textarea' ? (
                  <>
                    {current.example && (
                      <p className="mm-example mb-3">{current.example}</p>
                    )}
                    <textarea
                      key={current.key}
                      autoFocus
                      className="w-full text-sm text-gray-800 placeholder:text-gray-300 resize-none focus:outline-none min-h-[120px] bg-transparent"
                      placeholder={INPUT_PLACEHOLDER}
                      value={form[current.key] as string}
                      onChange={(e) => set(current.key, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) goNext();
                      }}
                    />
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-300 tabular-nums">
                        {(form[current.key] as string).length} 文字
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-gray-400">
                        <kbd className="mm-kbd">{IS_MAC ? '⌘' : 'Ctrl'}</kbd>
                        <kbd className="mm-kbd">↵</kbd>
                        で{isLast ? '完了' : '次へ'}
                      </span>
                    </div>
                  </>
                ) : (
                  <IntensitySlider
                    value={form.intensity}
                    onChange={(v) => set('intensity', v)}
                  />
                )}
              </div>

              {/* ナビゲーション */}
              <div className="flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goBack}
                  disabled={step === 0}
                  className="mm-ghost"
                >
                  <ArrowLeft size={15} />
                  戻る
                </motion.button>

                <span className="text-xs text-gray-400 tabular-nums">{step + 1} / {STEPS.length}</span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goNext}
                  className="mm-next"
                >
                  {isLast ? '完了' : '次へ'}
                  <ArrowRight size={15} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5"
            >
              {/* 完了メッセージ */}
              <AnpanBubble>
                <p className="text-sm text-gray-800 leading-relaxed">
                  お疲れ様でしたぽよ🎉<br />
                  よく向き合えましたね。<br />
                  ヘッダーの save から保存できますよ。
                </p>
              </AnpanBubble>

              {/* ビフォーアフター */}
              {showBeforeAfter && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.35 }}
                  className="mm-card px-5 py-5"
                >
                  <span className="mm-pill">
                    <Sparkles size={11} />
                    こころの変化
                  </span>
                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="rounded-xl px-4 py-3 border border-gray-200 bg-gray-50/80">
                      <p className="text-[10px] text-gray-400 mb-1">はじめに浮かんだ考え</p>
                      <p className="text-sm text-gray-500 whitespace-pre-wrap">
                        {form.thought || '（未入力）'}
                      </p>
                    </div>
                    <ArrowRight size={16} className="hidden sm:block text-gray-300 mx-1 shrink-0" />
                    <ArrowDown size={16} className="sm:hidden text-gray-300 mx-auto" />
                    <div className="mm-after-card">
                      <p className="text-[10px] text-gray-400 mb-1">もう一度考えてみたら</p>
                      <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">
                        {form.rethink || '（未入力）'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 回答サマリー */}
              <div className="mm-card divide-y divide-gray-100 overflow-hidden">
                {STEPS.map((s, i) => (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.3 }}
                    className="px-5 py-4"
                  >
                    <p
                      className="text-xs font-semibold mb-1.5 flex items-center gap-1.5"
                      style={{ color: s.accent }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.accent }} />
                      {s.hint}
                    </p>
                    {s.key === 'intensity' ? (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: s.accent }}
                            initial={{ width: 0 }}
                            animate={{ width: `${form.intensity}%` }}
                            transition={{ delay: 0.4 + i * 0.06, duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-sm font-bold tabular-nums text-gray-800">
                          {form.intensity}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {(form[s.key] as string) || <span className="text-gray-300">（未入力）</span>}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* ボタン */}
              <div className="flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goBack}
                  className="mm-ghost"
                >
                  <ArrowLeft size={15} />
                  戻る
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="mm-ghost"
                >
                  <RotateCcw size={15} />
                  最初から
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
