import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLauncher } from '../components/AppLauncher';

interface FormState {
  situation: string;
  emotion: string;
  intensity: number;
  thought: string;
  evidence: string;
  counter: string;
  rethink: string;
}

const initialForm: FormState = {
  situation: '',
  emotion: '',
  intensity: 50,
  thought: '',
  evidence: '',
  counter: '',
  rethink: '',
};

type Step = {
  key: keyof FormState;
  question: string;
  hint: string;
  placeholder: string;
  type: 'textarea' | 'range';
};

const STEPS: Step[] = [
  {
    key: 'situation',
    question: 'どんなことがありましたか？\nその時、自分はどうしていましたか？',
    hint: '状況・行動',
    placeholder: '例：友人へのメッセージに既読がついているのに返信がない',
    type: 'textarea',
  },
  {
    key: 'emotion',
    question: 'そのとき、どんな気持ちになりましたか？',
    hint: '感情',
    placeholder: '例：憂鬱、不安、悲しい',
    type: 'textarea',
  },
  {
    key: 'intensity',
    question: 'その気持ちはどのくらい強かったですか？\n今まで体験した中で一番強い感情を100として教えてください。',
    hint: '感情の強度',
    placeholder: '',
    type: 'range',
  },
  {
    key: 'thought',
    question: 'そのとき、頭の中にどんな考えやイメージが浮かびましたか？',
    hint: '自動思考',
    placeholder: '例：自分は嫌われているかと思った',
    type: 'textarea',
  },
  {
    key: 'evidence',
    question: 'その考えを裏付けるような事実はありますか？',
    hint: '根拠',
    placeholder: '例：先日の会話が友人から顰蹙をかったかもしれない',
    type: 'textarea',
  },
  {
    key: 'counter',
    question: 'その考えに反するような事実はありますか？',
    hint: '反証',
    placeholder: '例：相手も忙しいだけかもしれない',
    type: 'textarea',
  },
  {
    key: 'rethink',
    question: '少し落ち着いて、もう一度考えてみましょう。\n別の視点や過去の経験から、どう思いますか？',
    hint: 'もう一度考えてみる',
    placeholder: `・ポジティブな時期だったらどう受け止めたか\n・友人が同じ状況ならどう思うか\n・類似の経験はなかったか、その時問題は起きたか`,
    type: 'textarea',
  },
];

export function MindMemoPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const set = (field: keyof FormState, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const goNext = () => {
    if (isLast) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="app-header">
        <div className="app-header-container">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <img src="/icons/icon.png" alt="アイコン" className="w-10 h-10" />
            <h1 className="app-title">mind-memo</h1>
          </div>
          <div className="flex items-center gap-2">
            {done && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="btn-reset"
              >
                <Download className="icon-sm" />
                <span className="hidden md:inline">save</span>
              </motion.button>
            )}
            <AppLauncher />
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-lg mx-auto px-4 pt-32 pb-16 flex flex-col gap-6">

        {/* プログレスバー */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                done || i <= step ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

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
              <div className="flex items-start gap-4">
                <img
                  src="/anpan.png"
                  alt="あんぱん"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shrink-0 mt-1"
                />
                <div className="relative bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 px-5 py-4 flex-1">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                    {current.question}
                  </p>
                  <span className="mt-2 inline-block text-xs text-gray-400">{current.hint}</span>
                </div>
              </div>

              {/* 入力エリア */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-5">
                {current.type === 'textarea' ? (
                  <textarea
                    key={current.key}
                    autoFocus
                    className="w-full text-sm text-gray-800 placeholder:text-gray-300 resize-none focus:outline-none min-h-[120px]"
                    placeholder={current.placeholder}
                    value={form[current.key] as string}
                    onChange={(e) => set(current.key, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) goNext();
                    }}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={form.intensity}
                      onChange={(e) => set('intensity', Number(e.target.value))}
                      className="w-full accent-gray-900"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0（ほとんどない）</span>
                      <span className="text-2xl font-bold text-gray-900 tabular-nums">{form.intensity}</span>
                      <span>100（最大）</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ナビゲーション */}
              <div className="flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goBack}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ArrowLeft size={15} />
                  戻る
                </motion.button>

                <span className="text-xs text-gray-400">{step + 1} / {STEPS.length}</span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goNext}
                  className="btn-reset"
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
              <div className="flex items-start gap-4">
                <img
                  src="/anpan.png"
                  alt="あんぱん"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shrink-0 mt-1"
                />
                <div className="relative bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 px-5 py-4 flex-1">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    お疲れ様でしたぽよ🎉<br />
                    よく向き合えましたね。<br />
                    ヘッダーの save から保存できますよ。
                  </p>
                </div>
              </div>

              {/* 回答サマリー */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                {STEPS.map((s) => (
                  <div key={s.key} className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-400 mb-1">{s.hint}</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {s.key === 'intensity'
                        ? form.intensity
                        : (form[s.key] as string) || <span className="text-gray-300">（未入力）</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* ボタン */}
              <div className="flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  <ArrowLeft size={15} />
                  戻る
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
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
