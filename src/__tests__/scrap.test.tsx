import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ScrapPage } from '../pages/ScrapPage';
import {
  CRUMPLE_MS,
  SCRAP_DISCARD_LABEL,
  SCRAP_INPUT_LABEL,
} from '../components/scrap/scrap';

// vitest の globals を使っていないため、自動クリーンアップは効かない
afterEach(cleanup);

function renderPage() {
  return render(
    <MemoryRouter>
      <ScrapPage />
    </MemoryRouter>
  );
}

function paper() {
  return screen.getByLabelText(SCRAP_INPUT_LABEL) as HTMLTextAreaElement;
}

function write(text: string) {
  fireEvent.change(paper(), { target: { value: text } });
}

function discard() {
  fireEvent.click(screen.getByRole('button', { name: SCRAP_DISCARD_LABEL }));
}

/** 紙が飛んでいくのを待つ。実時間は使わない */
function waitForCrumple() {
  act(() => {
    vi.advanceTimersByTime(CRUMPLE_MS);
  });
}

describe('ScrapPage', () => {
  it('開いたときは、入力欄が1つあるだけ', () => {
    const { container } = renderPage();

    expect(paper()).toHaveValue('');
    expect(container.querySelectorAll('textarea')).toHaveLength(1);
  });

  it('改行を含めてそのまま書ける', () => {
    renderPage();

    write('つかれた\n\nもういい');

    expect(paper()).toHaveValue('つかれた\n\nもういい');
  });

  it('ぽい を押すと紙が丸まり、終わると白紙に戻る', () => {
    vi.useFakeTimers();
    try {
      const { container } = renderPage();
      write('つかれた');

      discard();
      expect(container.querySelector('.scrap-crumpling')).not.toBeNull();
      expect(paper()).toHaveValue('つかれた');

      waitForCrumple();

      expect(container.querySelector('.scrap-crumpling')).toBeNull();
      expect(paper()).toHaveValue('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('捨てるとき、確認も完了画面も出さない', () => {
    vi.useFakeTimers();
    try {
      const { container } = renderPage();
      write('つかれた');

      discard();
      waitForCrumple();

      expect(container.textContent).not.toMatch(
        /本当に|よろしい|削除しました|完了|お疲れ|もう一度/
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('空のまま押しても、何も言われない', () => {
    vi.useFakeTimers();
    try {
      const { container } = renderPage();

      discard();
      waitForCrumple();

      expect(paper()).toHaveValue('');
      expect(container.textContent).not.toMatch(/入力|必須|エラー/);
    } finally {
      vi.useRealTimers();
    }
  });

  it('文字数も、進み具合も数えない', () => {
    const { container } = renderPage();

    write('つかれた\nねむい');

    expect(container.textContent).not.toMatch(/\d/);
  });

  it('いつでもそのまま離れられる', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'Matoriko トップへ' })).toHaveAttribute('href', '/');
  });

  it('残す手段は置かない（書いたものは消える前提のページ）', () => {
    renderPage();
    write('つかれた');

    expect(screen.queryByRole('button', { name: /save|保存/ })).toBeNull();
  });
});
