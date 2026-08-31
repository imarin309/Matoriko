import type { Murmur } from './murmurs';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function murmurFileName(now: Date = new Date()): string {
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  return `murmur_${date}_${pad(now.getHours())}${pad(now.getMinutes())}.txt`;
}

/**
 * 件数も、1件ずつの時刻も付けない。
 * 画面で薄れて読めなくなったものも、ここには残す（残すと決めたときだけ渡す紙なので）。
 * 何も書いていなければ空文字を返し、保存そのものを起こさない。
 */
export function buildMurmurText(murmurs: readonly Murmur[], now: Date = new Date()): string {
  if (murmurs.length === 0) return '';

  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return [stamp, '', ...murmurs.map((murmur) => murmur.text)].join('\n') + '\n';
}

/** 他ページと同じ、Blob → <a download> の書き出し */
export function downloadMurmurText(murmurs: readonly Murmur[], now: Date = new Date()) {
  const text = buildMurmurText(murmurs, now);
  if (text === '') return;

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = murmurFileName(now);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
