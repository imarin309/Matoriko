import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateMindMapFileName } from '../fileName';

describe('generateMindMapFileName', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 9, 7)); // 2026-01-05 09:07
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('タイトルとタイムスタンプ（分まで0埋め）でファイル名を生成する', () => {
    expect(generateMindMapFileName('旅行計画')).toBe('旅行計画_202601050907.md');
  });

  it('タイトルが空の場合は「無題」を使う', () => {
    expect(generateMindMapFileName('')).toBe('無題_202601050907.md');
  });

  it('ファイル名に使えない文字を除去する', () => {
    expect(generateMindMapFileName('a/b\\c:d*e?f"g<h>i|j')).toBe('abcdefghij_202601050907.md');
  });
});
