import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MurmurPage } from '../pages/MurmurPage';
import {
  CLEAR_COUNT,
  MURMUR_PLACEHOLDER,
  addMurmur,
  createMurmur,
  fadeAt,
} from '../components/murmur/murmurs';
import { buildMurmurText, murmurFileName } from '../components/murmur/downloadMurmurText';

// vitest の globals を使っていないため、自動クリーンアップは効かない
afterEach(cleanup);

function renderPage() {
  return render(
    <MemoryRouter>
      <MurmurPage />
    </MemoryRouter>
  );
}

function say(text: string) {
  fireEvent.change(screen.getByPlaceholderText(MURMUR_PLACEHOLDER), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole('button', { name: '書く' }));
}

function lines(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('.murmur-line'));
}

describe('MurmurPage', () => {
  it('開いたときは何も積もっていない', () => {
    const { container } = renderPage();

    expect(lines(container)).toHaveLength(0);
    expect(screen.getByPlaceholderText(MURMUR_PLACEHOLDER)).toBeInTheDocument();
  });

  it('送った一言が積もり、入力欄は空に戻る', () => {
    const { container } = renderPage();

    say('つかれた');

    expect(lines(container).map((el) => el.textContent)).toEqual(['つかれた']);
    expect(screen.getByPlaceholderText(MURMUR_PLACEHOLDER)).toHaveValue('');
  });

  it('何度でも送れて、新しいものが下に来る', () => {
    const { container } = renderPage();

    say('つかれた');
    say('もういい');
    say('ねむい');

    expect(lines(container).map((el) => el.textContent)).toEqual([
      'つかれた',
      'もういい',
      'ねむい',
    ]);
  });

  it('空のまま送っても、何も起きないし何も言われない', () => {
    const { container } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: '書く' }));

    expect(lines(container)).toHaveLength(0);
    expect(container.textContent).not.toMatch(/入力|必須|エラー/);
  });

  it('直近の数件ははっきり見えて、古いものから薄くなる', () => {
    const { container } = renderPage();

    for (const text of ['1つめ', '2つめ', '3つめ', '4つめ', '5つめ']) say(text);

    const opacities = lines(container).map((el) => Number(el.style.opacity));
    // 下（新しい方）から数えて CLEAR_COUNT 件はそのまま
    expect(opacities.slice(-CLEAR_COUNT)).toEqual([1, 1, 1]);
    // それより上は、さかのぼるほど薄い
    expect(opacities[1]).toBeLessThan(1);
    expect(opacities[0]).toBeLessThan(opacities[1]);
  });

  it('返事も、あいづちも、相手の入力中も出ない', () => {
    const { container } = renderPage();

    say('つかれた');
    say('もういい');

    // 画面に出る文字は、自分が書いたものと操作ラベルだけ
    expect(lines(container)).toHaveLength(2);
    expect(container.textContent).not.toMatch(/入力中|そうなんだ|わかる|うんうん/);
  });

  it('件数も時刻も出さない', () => {
    const { container } = renderPage();

    say('つかれた');
    say('もういい');

    expect(container.textContent).not.toMatch(/\d/);
  });

  it('いつでもそのまま離れられる', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'Matoriko トップへ' })).toHaveAttribute('href', '/');
  });
});

describe('ひとりごとの積もり方（純粋関数）', () => {
  it('空白だけの入力は、ひとりごとにしない', () => {
    expect(createMurmur('   ')).toBeNull();
    expect(addMurmur([], '\n ')).toHaveLength(0);
  });

  it('前後の空白を落として積む', () => {
    expect(createMurmur('  つかれた  ')?.text).toBe('つかれた');
  });

  it('addMurmur は元の配列を書き換えない', () => {
    const murmurs = addMurmur([], 'つかれた');
    const next = addMurmur(murmurs, 'ねむい');

    expect(murmurs).toHaveLength(1);
    expect(next.map((m) => m.text)).toEqual(['つかれた', 'ねむい']);
  });

  it('直近はそのまま、さかのぼるほど薄くなり、溶けきっても消えはしない', () => {
    for (let i = 0; i < CLEAR_COUNT; i += 1) expect(fadeAt(i)).toBe(1);

    expect(fadeAt(CLEAR_COUNT)).toBeLessThan(1);
    expect(fadeAt(CLEAR_COUNT + 1)).toBeLessThan(fadeAt(CLEAR_COUNT));
    expect(fadeAt(100)).toBeGreaterThan(0);
  });
});

describe('buildMurmurText / murmurFileName', () => {
  const now = new Date(2026, 7, 31, 9, 5); // 2026-08-31 09:05

  it('書いた順にそのまま並べる', () => {
    const murmurs = addMurmur(addMurmur(addMurmur([], 'つかれた'), 'もういい'), 'ねむい');

    expect(buildMurmurText(murmurs, now)).toBe(
      ['2026-08-31 09:05', '', 'つかれた', 'もういい', 'ねむい', ''].join('\n')
    );
  });

  it('件数や1件ごとの時刻は書き出さない', () => {
    const murmurs = addMurmur(addMurmur([], 'つかれた'), 'ねむい');
    const text = buildMurmurText(murmurs, now).replace('2026-08-31 09:05', '');

    expect(text).not.toMatch(/\d/);
    expect(text).not.toMatch(/件|完了/);
  });

  it('薄れて読めなくなったものも書き出す', () => {
    let murmurs = addMurmur([], 'いちばん古い');
    for (let i = 0; i < 50; i += 1) murmurs = addMurmur(murmurs, `ひとりごと${i}`);

    expect(buildMurmurText(murmurs, now)).toContain('いちばん古い');
  });

  it('何も書いていなければ、書き出す中身がない', () => {
    expect(buildMurmurText([], now)).toBe('');
  });

  it('ファイル名は分まで入れる（同じ日に何度でも保存できる）', () => {
    expect(murmurFileName(now)).toBe('murmur_20260831_0905.txt');
  });
});

describe('MurmurPage: 保存', () => {
  /** jsdom には Blob URL がないので、書き出しの入口だけ差し替えて中身を見る */
  function captureDownload() {
    const saved: { name: string; href: string }[] = [];
    const createObjectURL = vi.fn(() => 'blob:murmur');
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL,
      revokeObjectURL: vi.fn(),
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        saved.push({ name: this.download, href: this.href });
      });
    return {
      saved,
      createObjectURL,
      restore: () => {
        click.mockRestore();
        vi.unstubAllGlobals();
      },
    };
  }

  it('save で、書いたものをテキストとして書き出せる', () => {
    const dl = captureDownload();
    try {
      renderPage();
      say('つかれた');

      fireEvent.click(screen.getByRole('button', { name: 'save' }));

      expect(dl.saved).toHaveLength(1);
      expect(dl.saved[0].name).toMatch(/^murmur_\d{8}_\d{4}\.txt$/);
      expect(dl.createObjectURL).toHaveBeenCalledOnce();
    } finally {
      dl.restore();
    }
  });

  it('何も書いていないときは、押しても何も起きない', () => {
    const dl = captureDownload();
    try {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'save' }));

      expect(dl.saved).toHaveLength(0);
      expect(dl.createObjectURL).not.toHaveBeenCalled();
    } finally {
      dl.restore();
    }
  });
});
