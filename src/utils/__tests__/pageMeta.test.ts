import { describe, it, expect } from 'vitest';
import { DEFAULT_META, PAGE_META, metaForPath } from '../pageMeta';

describe('metaForPath', () => {
  it('既知のパスのメタ情報を返す', () => {
    expect(metaForPath('/diary')).toBe(PAGE_META['/diary']);
  });

  it('末尾のスラッシュを無視する', () => {
    expect(metaForPath('/mind-map/')).toBe(PAGE_META['/mind-map']);
  });

  it('ルートパスはデフォルトのメタ情報を返す', () => {
    expect(metaForPath('/')).toBe(DEFAULT_META);
  });

  it('未知のパスはデフォルトのメタ情報にフォールバックする', () => {
    expect(metaForPath('/unknown')).toBe(DEFAULT_META);
  });
});

describe('PAGE_META', () => {
  it('全ページにタイトルと説明文が設定されている', () => {
    for (const [path, meta] of Object.entries(PAGE_META)) {
      expect(meta.title, path).not.toBe('');
      expect(meta.description.length, path).toBeGreaterThan(20);
    }
  });
});
