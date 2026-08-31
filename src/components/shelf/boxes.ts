/** 未仕分けの付箋を置いておく場所。箱と同じように、いつでもここへ戻せる */
export const UNSORTED = 'unsorted';

export type ShelfBoxId = 'later' | 'enough' | 'unsure';
export type ZoneId = typeof UNSORTED | ShelfBoxId;

export interface ShelfBox {
  id: ShelfBoxId;
  label: string;
}

/**
 * 箱のラベル。
 * 「今日どうにかなる／ならない」のような解決可能性では分けない（判断を要求しないため）。
 * 「よくわからない」があることで、どこにも置けない付箋が出ないようにしている。
 */
export const SHELF_BOXES: ShelfBox[] = [
  { id: 'later', label: '今は置いとく' },
  { id: 'enough', label: 'もういい' },
  { id: 'unsure', label: 'よくわからない' },
];

export interface ShelfNote {
  id: string;
  text: string;
  zone: ZoneId;
}

export const SHELF_LEAD = '今おもってること、ひとつずつ書いておこう。';
/** 操作のしかたの案内。指示ではなく、できることを添えるだけに留める */
export const SHELF_HINT = '下の箱へ動かしてみて。付箋をタップしてから箱を選んでもいいよ。';
export const SHELF_PLACEHOLDER = '今おもってることを書く';
export const SHELF_ADD_LABEL = '置く';
/** 付箋を選んでいるときだけ、置き先に出る言葉 */
export const SHELF_DROP_LABEL = 'ここに置く';
export const SHELF_RETURN_LABEL = 'ここに戻す';
export const SHELF_CLOSE_LABEL = 'とじる';

let counter = 0;

/** 空白だけの入力は付箋にしない（何も言わずに受け流す） */
export function createNote(text: string): ShelfNote | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  counter += 1;
  return { id: `${Date.now()}-${counter}`, text: trimmed, zone: UNSORTED };
}

export function addNote(notes: readonly ShelfNote[], text: string): ShelfNote[] {
  const note = createNote(text);
  return note ? [...notes, note] : [...notes];
}

/** 置き直しも同じ操作でできる。何度動かしても咎めない */
export function moveNote(
  notes: readonly ShelfNote[],
  id: string,
  zone: ZoneId
): ShelfNote[] {
  return notes.map((note) => (note.id === id ? { ...note, zone } : note));
}

export function notesInZone(notes: readonly ShelfNote[], zone: ZoneId): ShelfNote[] {
  return notes.filter((note) => note.zone === zone);
}
