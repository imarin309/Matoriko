export interface FormState {
  situation: string;
  emotion: string;
  intensity: number;
  thought: string;
  evidence: string;
  counter: string;
  rethink: string;
}

export const initialForm: FormState = {
  situation: '',
  emotion: '',
  intensity: 50,
  thought: '',
  evidence: '',
  counter: '',
  rethink: '',
};

export type Step = {
  key: keyof FormState;
  question: string;
  /** カード上のラベル */
  hint: string;
  /** プログレスバー用の短縮ラベル */
  short: string;
  /** 入力欄の上に表示する記入例 */
  example?: string;
  type: 'textarea' | 'range';
  /** ステップごとのアクセントカラー */
  accent: string;
};

export const STEPS: Step[] = [
  {
    key: 'situation',
    question: 'どんなことがありましたか？\nその時、自分はどうしていましたか？',
    hint: '状況・行動',
    short: '状況',
    example: '例：友人へのメッセージに既読がついているのに返信がない',
    type: 'textarea',
    accent: '#0ea5e9',
  },
  {
    key: 'emotion',
    question: 'そのとき、どんな気持ちになりましたか？',
    hint: '感情',
    short: '感情',
    example: '例：憂鬱、不安、悲しい',
    type: 'textarea',
    accent: '#f43f5e',
  },
  {
    key: 'intensity',
    question: 'その気持ちはどのくらい強かったですか？\n今まで体験した中で一番強い感情を100として教えてください。',
    hint: '感情の強度',
    short: '強度',
    type: 'range',
    accent: '#f59e0b',
  },
  {
    key: 'thought',
    question: 'そのとき、頭の中にどんな考えやイメージが浮かびましたか？',
    hint: '自動思考',
    short: '自動思考',
    example: '例：自分は嫌われているかと思った',
    type: 'textarea',
    accent: '#8b5cf6',
  },
  {
    key: 'evidence',
    question: 'その考えを裏付けるような事実はありますか？',
    hint: '根拠',
    short: '根拠',
    example: '例：先日の会話が友人から顰蹙をかったかもしれない',
    type: 'textarea',
    accent: '#14b8a6',
  },
  {
    key: 'counter',
    question: 'その考えに反するような事実はありますか？',
    hint: '反証',
    short: '反証',
    example: '例：相手も忙しいだけかもしれない',
    type: 'textarea',
    accent: '#06b6d4',
  },
  {
    key: 'rethink',
    question: '少し落ち着いて、もう一度考えてみましょう。\n別の視点や過去の経験から、どう思いますか？',
    hint: 'もう一度考えてみる',
    short: '再考',
    example: `・ポジティブな時期だったらどう受け止めたか\n・友人が同じ状況ならどう思うか\n・類似の経験はなかったか、その時問題は起きたか`,
    type: 'textarea',
    accent: '#10b981',
  },
];

/** 完了画面のアクセント（＝再考の色） */
export const DONE_ACCENT = '#10b981';

/** 紙吹雪などで使い回す、全ステップのアクセント一覧（参照が安定するようモジュール定数） */
export const STEP_ACCENTS = STEPS.map((s) => s.accent);
