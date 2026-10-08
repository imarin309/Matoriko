import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Minus, Plus } from 'lucide-react';
import { AppHeader } from '../components/header';
import { PAGE_META } from '../utils/pageMeta';

const BASE_TITLE = PAGE_META['/pomodoro'].title;

type Phase = 'work' | 'break';

const DEFAULT_DURATIONS: Record<Phase, number> = {
  work: 25 * 60,
  break: 5 * 60,
};

const PHASE_LABEL: Record<Phase, string> = {
  work: '作業',
  break: '休憩',
};

const PHASES: Phase[] = ['work', 'break'];

const DURATION_STEP_SECONDS = 60;
const MIN_DURATION_SECONDS = 1 * 60;
const MAX_DURATION_SECONDS = 90 * 60;

const adjustButtonClass =
  'flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm disabled:opacity-40';

type Message = string | ((minutesLeft: number) => string);

// 時間を変えられるので、何分目かではなく進み具合（序盤・中盤・終盤）で選ぶ
const MESSAGE_STAGES: Record<Phase, Message[][]> = {
  work: [
    ['ぽよー！！', 'はじめたのえらいぽよ', 'まずは一歩だぽよ', '集中モードぽよ〜'],
    ['頑張っててえらいぽよねえ', 'いい調子ぽよ', '半分きたぽよ！', '水分とってるぽよ？'],
    [
      (minutesLeft) => `あと${minutesLeft}分だぽよ！！！`,
      'こんなに頑張っている人見たことない、、',
      'ラストスパートぽよ',
      'もうすぐ休めるぽよ〜',
    ],
  ],
  break: [
    ['お疲れ様だぽよねえ', 'のびーってするぽよ', '目を閉じてみるぽよ', 'お茶でも飲むぽよ', 'えらかったぽよ'],
  ],
};

function randomSeed() {
  return Math.floor(Math.random() * 1000);
}

// 毎秒の再描画で文言が変わらないよう、乱数はフェーズ開始時に1回だけ引いて段階ごとにずらす
function pickMessage(phase: Phase, progress: number, seed: number, secondsLeft: number) {
  const stages = MESSAGE_STAGES[phase];
  const stageIndex = Math.min(stages.length - 1, Math.floor(progress * stages.length));
  const candidates = stages[stageIndex];
  const message = candidates[(seed + stageIndex) % candidates.length];
  return typeof message === 'function' ? message(Math.ceil(secondsLeft / 60)) : message;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      ctx.close();
    };
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // 再生できない環境では無視
  }
}

export function PomodoroPage() {
  const [phase, setPhase] = useState<Phase>('work');
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [messageSeed, setMessageSeed] = useState(randomSeed);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          playChime();
          setIsRunning(false);
          setMessageSeed(randomSeed());
          setPhase((prevPhase) => {
            const nextPhase: Phase = prevPhase === 'work' ? 'break' : 'work';
            setSecondsLeft(durations[nextPhase]);
            return nextPhase;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, durations]);

  useEffect(() => {
    // 基準となるタイトルは pageMeta に集約し、計測中だけ残り時間を前置きする。
    // 離脱時のリセットは RouteMeta が遷移先のタイトルを設定するため不要。
    document.title = isRunning
      ? `${formatTime(secondsLeft)} - ${PHASE_LABEL[phase]}中 | ${BASE_TITLE}`
      : BASE_TITLE;
  }, [isRunning, secondsLeft, phase]);

  const total = durations[phase];
  const progress = (total - secondsLeft) / total;

  const handleToggle = () => setIsRunning((v) => !v);

  const selectPhase = (next: Phase) => {
    setIsRunning(false);
    setPhase(next);
    setMessageSeed(randomSeed());
    setSecondsLeft(durations[next]);
  };

  const adjustDuration = (delta: number) => {
    const next = Math.min(MAX_DURATION_SECONDS, Math.max(MIN_DURATION_SECONDS, total + delta));
    setDurations({ ...durations, [phase]: next });
    setSecondsLeft(next);
  };

  const isFresh = secondsLeft === total;

  const primaryLabel = isRunning
    ? '一時停止'
    : isFresh
      ? phase === 'work'
        ? '作業を開始'
        : '休憩を開始'
      : '再開';

  const accent = phase === 'work' ? '#6b8afd' : '#4dbf8a';
  const bgColor = phase === 'work' ? '#fdeceb' : '#eaf3fb';

  const message = pickMessage(phase, progress, messageSeed, secondsLeft);

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: bgColor }}>
      <div className="app-header">
        <AppHeader title="25timer" subtitle="25分集中・5分休憩のポモドーロ" isSubPage />
      </div>

      <div className="flex flex-col max-md:landscape:flex-row md:flex-row items-center justify-center min-h-screen px-4 pt-20 gap-10 max-md:landscape:gap-6 md:gap-16">
        <button
          onClick={handleToggle}
          aria-label={primaryLabel}
          title={primaryLabel}
          className="w-64 h-64 md:w-72 md:h-72 max-md:landscape:w-32 max-md:landscape:h-32 rounded-full overflow-hidden shadow-md hover:opacity-90 active:scale-95 transition-all shrink-0"
        >
          <img
            src="/assets/anpan/funny.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </button>

        <div className="flex flex-col items-center gap-4 max-md:landscape:gap-2">
          <div role="group" aria-label="フェーズ" className="flex bg-white rounded-full p-1 shadow-sm border border-gray-200">
            {PHASES.map((p) => (
              <button
                key={p}
                onClick={() => selectPhase(p)}
                aria-pressed={phase === p}
                className="px-4 py-1 max-md:landscape:px-3 max-md:landscape:py-0.5 rounded-full text-sm transition-colors"
                style={phase === p ? { background: accent, color: '#fff' } : { color: '#6b7280' }}
              >
                {PHASE_LABEL[p]}
              </button>
            ))}
          </div>

          <div className="relative bg-white rounded-2xl px-6 py-4 max-md:landscape:px-4 max-md:landscape:py-2 shadow-sm border border-gray-200 max-w-[260px] max-md:landscape:max-w-[200px] text-base max-md:landscape:text-sm text-gray-700 text-center">
            {message}
            <div className="absolute top-1/2 -left-[9px] -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45 hidden max-md:landscape:block md:block" />
            <div className="absolute left-1/2 -top-[9px] -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45 max-md:landscape:hidden md:hidden" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustDuration(-DURATION_STEP_SECONDS)}
              disabled={total <= MIN_DURATION_SECONDS}
              aria-label="1分短くする"
              className={`${adjustButtonClass} ${isRunning ? 'invisible' : ''}`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-2xl md:text-3xl max-md:landscape:text-xl font-bold tabular-nums" style={{ color: accent }}>
              {formatTime(secondsLeft)}
            </span>
            <button
              onClick={() => adjustDuration(DURATION_STEP_SECONDS)}
              disabled={total >= MAX_DURATION_SECONDS}
              aria-label="1分長くする"
              className={`${adjustButtonClass} ${isRunning ? 'invisible' : ''}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-64 md:w-72 max-md:landscape:w-40">
            <button
              onClick={handleToggle}
              aria-label={primaryLabel}
              title={primaryLabel}
              className="flex items-center justify-center w-8 h-8 max-md:landscape:w-6 max-md:landscape:h-6 rounded-full text-white shadow-md shrink-0"
              style={{ background: accent }}
            >
              {isRunning
                ? <Pause className="w-4 h-4 max-md:landscape:w-3 max-md:landscape:h-3" />
                : <Play className="w-4 h-4 max-md:landscape:w-3 max-md:landscape:h-3 translate-x-0.5" />}
            </button>

            <div className="flex-1 h-2.5 max-md:landscape:h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${progress * 100}%`, background: accent, transition: 'width 1s linear' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
