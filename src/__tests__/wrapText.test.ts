import { describe, it, expect } from 'vitest';
import { wrapText } from '../utils/downloadImage';

/** 1文字10pxの等幅フォントとして計測するダミーコンテキスト */
const ctx = {
  measureText: (t: string) => ({ width: [...t].length * 10 }),
} as unknown as CanvasRenderingContext2D;

describe('wrapText', () => {
  it('指定幅で折り返す', () => {
    expect(wrapText(ctx, 'あいうえおかきくけこ', 50)).toEqual(['あいうえお', 'かきくけこ']);
  });

  it('改行を保持する', () => {
    expect(wrapText(ctx, 'あい\nうえ', 100)).toEqual(['あい', 'うえ']);
  });

  it('句読点を行頭に送らず前の行にぶら下げる', () => {
    // 5文字で折り返す幅。「。」は6文字目だが行頭に置かない
    expect(wrapText(ctx, 'あいうえお。かきくけこ', 50)).toEqual(['あいうえお。', 'かきくけこ']);
  });

  it('閉じ括弧もぶら下げる', () => {
    expect(wrapText(ctx, 'あいうえお」かきくけこ', 50)).toEqual(['あいうえお」', 'かきくけこ']);
  });

  it('ぶら下げは2文字までで打ち切る', () => {
    expect(wrapText(ctx, 'あいうえお」。、かきく', 50)).toEqual(['あいうえお」。', '、かきく']);
  });

  it('ぶら下げても行数は増えない', () => {
    const text = 'あいうえお。かきくけこ。さしすせそ。';
    expect(wrapText(ctx, text, 50).length).toBe(3);
  });
});
