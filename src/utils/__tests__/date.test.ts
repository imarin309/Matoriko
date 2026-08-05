import { describe, it, expect, afterEach, vi } from 'vitest';
import { todayString } from '../date';

describe('todayString', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('4時以降はその日の日付を返す', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 4, 0));
    expect(todayString()).toBe('2026-01-05');
  });

  it('3時59分は前日扱いになる', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 3, 59));
    expect(todayString()).toBe('2026-01-04');
  });

  it('月初をまたぐ場合も正しく前日になる', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 1, 0, 30)); // 2026-02-01 00:30
    expect(todayString()).toBe('2026-01-31');
  });
});
