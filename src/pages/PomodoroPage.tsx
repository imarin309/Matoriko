import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { AppHeader } from '../components/header';

type Phase = 'work' | 'break';

const DURATIONS: Record<Phase, number> = {
  work: 25 * 60,
  break: 5 * 60,
};

const PHASE_LABEL: Record<Phase, string> = {
  work: '作業',
  break: '休憩',
};

const WORK_MESSAGES_25 = ['ぽよー！！']; 
const WORK_MESSAGES_20 = ['頑張っててえらいぽよねえ'];     
const WORK_MESSAGES_15 = ['10分も頑張ったぽよか、、']; 
const WORK_MESSAGES_10 = ['あと10分だぽよ！！！']; // 残り10分
const WORK_MESSAGES_5  = ['こんなに頑張っている人見たことない、、'];   // 残り5分

const WORK_MESSAGE_BRACKETS = [
  WORK_MESSAGES_25,
  WORK_MESSAGES_20,
  WORK_MESSAGES_15,
  WORK_MESSAGES_10,
  WORK_MESSAGES_5,
];

const BREAK_MESSAGES_5 = ['お疲れ様だぽよねえ'];

const BREAK_MESSAGE_BRACKETS = [
  BREAK_MESSAGES_5,
];

const MESSAGE_INTERVAL_SECONDS = 5 * 60;

function pickMessage(bracket: string[], seed: number) {
  return bracket[seed % bracket.length];
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
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // 再生できない環境では無視
  }
}

export function PomodoroPage() {
  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          playChime();
          setIsRunning(false);
          setPhase((prevPhase) => {
            const nextPhase: Phase = prevPhase === 'work' ? 'break' : 'work';
            setSecondsLeft(DURATIONS[nextPhase]);
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
  }, [isRunning]);

  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(secondsLeft)} - ${PHASE_LABEL[phase]}中 | 25timer`
      : '25timer';
    return () => {
      document.title = 'Matoriko';
    };
  }, [isRunning, secondsLeft, phase]);

  const total = DURATIONS[phase];
  const progress = (total - secondsLeft) / total;

  const handleToggle = () => setIsRunning((v) => !v);

  const isFresh = secondsLeft === DURATIONS[phase];

  const primaryLabel = isRunning
    ? '一時停止'
    : isFresh
      ? phase === 'work'
        ? '作業を開始'
        : '休憩を開始'
      : '再開';

  const accent = phase === 'work' ? '#6b8afd' : '#4dbf8a';
  const bgColor = phase === 'work' ? '#fdeceb' : '#eaf3fb';

  const elapsed = total - secondsLeft;
  const brackets = phase === 'work' ? WORK_MESSAGE_BRACKETS : BREAK_MESSAGE_BRACKETS;
  const bracketIndex = Math.floor(elapsed / MESSAGE_INTERVAL_SECONDS) % brackets.length;
  const message = pickMessage(brackets[bracketIndex], bracketIndex);

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: bgColor }}>
      <div className="app-header">
        <AppHeader title="25timer" isSubPage />
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
          <div className="relative bg-white rounded-2xl px-6 py-4 max-md:landscape:px-4 max-md:landscape:py-2 shadow-sm border border-gray-200 max-w-[260px] max-md:landscape:max-w-[200px] text-base max-md:landscape:text-sm text-gray-700 text-center">
            {message}
            <div className="absolute top-1/2 -left-[9px] -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45 hidden max-md:landscape:block md:block" />
            <div className="absolute left-1/2 -top-[9px] -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45 max-md:landscape:hidden md:hidden" />
          </div>

          <span className="text-2xl md:text-3xl max-md:landscape:text-xl font-bold tabular-nums" style={{ color: accent }}>
            {formatTime(secondsLeft)}
          </span>

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
