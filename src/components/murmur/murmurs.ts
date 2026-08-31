export interface Murmur {
  id: string;
  text: string;
}

export const MURMUR_PLACEHOLDER = 'ひとこと';
export const MURMUR_SEND_LABEL = '書く';
export const MURMUR_INPUT_LABEL = 'ひとりごとを書く';

/**
 * 薄れ方。
 * 積み上がりが「たくさん書いてしまった」という圧にならないよう、
 * さかのぼるほど背景に近づけて、最後は読めないところまで落とす。
 */
export const CLEAR_COUNT = 3;
const FADE_STEP = 0.18;
const FADE_FLOOR = 0.12;

let counter = 0;

/** 空白だけの入力は、何も言わずに受け流す */
export function createMurmur(text: string): Murmur | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  counter += 1;
  return { id: `${Date.now()}-${counter}`, text: trimmed };
}

export function addMurmur(murmurs: readonly Murmur[], text: string): Murmur[] {
  const murmur = createMurmur(text);
  if (!murmur) return [...murmurs];
  return [...murmurs, murmur];
}

export function fadeAt(indexFromNewest: number): number {
  if (indexFromNewest < CLEAR_COUNT) return 1;
  return Math.max(FADE_FLOOR, 1 - (indexFromNewest - CLEAR_COUNT + 1) * FADE_STEP);
}
