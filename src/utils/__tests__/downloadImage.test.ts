import { describe, it, expect } from 'vitest';
import { wrapText } from '../downloadImage';

// 1文字10pxとして幅を返す簡易モック
function makeCtx(charWidth = 10): CanvasRenderingContext2D {
  return {
    measureText: (text: string) => ({ width: text.length * charWidth }),
  } as unknown as CanvasRenderingContext2D;
}

describe('wrapText', () => {
  it('幅を超えないテキストは1行のまま返す', () => {
    const ctx = makeCtx();
    expect(wrapText(ctx, 'abc', 100)).toEqual(['abc']);
  });

  it('最大幅を超えるたびに改行する', () => {
    const ctx = makeCtx();
    // 1文字10px、最大幅35px → 3文字ごとに改行
    expect(wrapText(ctx, 'abcdefgh', 35)).toEqual(['abc', 'def', 'gh']);
  });

  it('改行コードで分割し、空行も保持する', () => {
    const ctx = makeCtx();
    expect(wrapText(ctx, 'line1\n\nline3', 1000)).toEqual(['line1', '', 'line3']);
  });
});
