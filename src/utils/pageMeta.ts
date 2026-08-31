export interface PageMeta {
  title: string;
  description: string;
}

export const SITE_NAME = 'Matoriko';

export const DEFAULT_META: PageMeta = {
  title: 'Matoriko | 自分の心を書き出すメモアプリ',
  description:
    'マインドマップ、心のメモ、日記、絵日記、旅のしおり、メッセージカード、タイマー。自分の心を書き出して整理するためのメモアプリです。',
};

export const PAGE_META: Record<string, PageMeta> = {
  '/': DEFAULT_META,
  '/mind-map': {
    title: 'mind-map | Matoriko',
    description:
      '頭の中の考えを枝分かれさせて整理するマインドマップ。思いついた言葉をノードに書き足しながら広げて、そのままMarkdownで保存できます。',
  },
  '/mind-memo': {
    title: 'mind-memo | Matoriko',
    description:
      '心のひっかかりを言葉にするメモ。問いに順番に答えていくだけで、そのときの気持ちと考え方を整理して、1枚の画像として残せます。',
  },
  '/diary': {
    title: 'diary | Matoriko',
    description:
      '一日の終わりにできごとや気持ちを書きとめる日記。日付ごとに記録して、テキストファイルとして手元に保存できます。',
  },
  '/memory': {
    title: 'memory | Matoriko',
    description:
      '写真と言葉でつづる絵日記。お気に入りの画像に短い言葉をそえて並べ、思い出を1枚の画像として保存できます。',
  },
  '/travel': {
    title: 'travel | Matoriko',
    description:
      '日程と持ち物をまとめる旅のしおり。日ごとのスケジュールと持ち物リストをつくって、旅の計画を1ページに整理できます。',
  },
  '/message': {
    title: 'message | Matoriko',
    description:
      '気持ちを伝えるメッセージカードをつくるツール。背景色やスタンプ、フォントを選んで、そのまま画像として保存・共有できます。',
  },
  '/pomodoro': {
    title: '25timer | Matoriko',
    description:
      '25分の集中と5分の休憩をくり返すポモドーロタイマー。応援メッセージにはげまされながら、作業のリズムを整えられます。',
  },
  '/shelf': {
    title: 'shelf | Matoriko',
    description:
      'しんどいことを短い付箋に書いて、「今は置いとく」「もういい」「よくわからない」の3つの箱に放り込むページ。考えずに、仕分けるだけで終われます。',
  },
  '/murmur': {
    title: 'murmur | Matoriko',
    description:
      '思ったことを一言ずつ書いていくページ。返事は返ってきません。書いたものは古いものから静かに薄くなっていくので、まとまった文章を書く体力がないときにどうぞ。',
  },
};

export function metaForPath(pathname: string): PageMeta {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.replace(/\/+$/, '') : pathname;
  return PAGE_META[normalized] ?? DEFAULT_META;
}
