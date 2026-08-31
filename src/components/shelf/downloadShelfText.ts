import { SHELF_BOXES, UNSORTED, notesInZone, type ShelfNote } from './boxes';

/** 書き出しのときだけ使う、未仕分けの見出し（画面には出さない） */
const TRAY_HEADING = 'まだどこにも置いていない';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function shelfFileName(now: Date = new Date()): string {
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  return `shelf_${date}_${pad(now.getHours())}${pad(now.getMinutes())}.txt`;
}

/**
 * 棚に置いたものをそのまま書き出す。
 * 件数も、空の箱の見出しも出さない（「埋まっていない」を見せないため）。
 * 付箋が1枚もなければ空文字を返し、保存そのものを起こさない。
 */
export function buildShelfText(notes: readonly ShelfNote[], now: Date = new Date()): string {
  if (notes.length === 0) return '';

  const sections: string[] = [];
  const section = (heading: string, zone: Parameters<typeof notesInZone>[1]) => {
    const inZone = notesInZone(notes, zone);
    if (inZone.length === 0) return;
    sections.push([`[${heading}]`, ...inZone.map((note) => `- ${note.text}`)].join('\n'));
  };

  // 画面と同じ並び（未仕分けが上、その下に3つの箱）
  section(TRAY_HEADING, UNSORTED);
  for (const box of SHELF_BOXES) section(box.label, box.id);

  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return [stamp, ...sections].join('\n\n') + '\n';
}

/** 他ページと同じ、Blob → <a download> の書き出し */
export function downloadShelfText(notes: readonly ShelfNote[], now: Date = new Date()) {
  const text = buildShelfText(notes, now);
  if (text === '') return;

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = shelfFileName(now);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
