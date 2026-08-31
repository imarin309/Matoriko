import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShelfPage } from '../pages/ShelfPage';
import {
  SHELF_BOXES,
  SHELF_PLACEHOLDER,
  UNSORTED,
  addNote,
  createNote,
  moveNote,
  notesInZone,
} from '../components/shelf/boxes';
import { buildShelfText, shelfFileName } from '../components/shelf/downloadShelfText';

// vitest の globals を使っていないため、自動クリーンアップは効かない
afterEach(cleanup);

function renderPage() {
  return render(
    <MemoryRouter>
      <ShelfPage />
    </MemoryRouter>
  );
}

function write(text: string) {
  fireEvent.change(screen.getByPlaceholderText(SHELF_PLACEHOLDER), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole('button', { name: '置く' }));
}

function note(text: string) {
  return screen.getByRole('button', { name: text });
}

/** その付箋が今どこにあるか（箱のラベル、未仕分けなら null） */
function placeOf(text: string): string | null {
  const box = note(text).closest('.shelf-box');
  return box?.querySelector('.shelf-box-label')?.textContent ?? null;
}

describe('ShelfPage', () => {
  it('書いた付箋は、まず未仕分けの置き場に出る', () => {
    renderPage();

    write('明日の打合せ');

    expect(note('明日の打合せ')).toBeInTheDocument();
    expect(placeOf('明日の打合せ')).toBeNull();
    expect(note('明日の打合せ').closest('.shelf-tray')).not.toBeNull();
  });

  it('空のまま押しても、何も起きないし何も言われない', () => {
    const { container } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: '置く' }));

    expect(container.querySelectorAll('.shelf-note')).toHaveLength(0);
    expect(container.textContent).not.toMatch(/入力|必須|エラー/);
  });

  it('タップで付箋を選んでから箱を選べる（ドラッグできない環境向け）', () => {
    renderPage();
    write('返信');

    // 選ぶ前は、置き先は出ていない
    expect(screen.queryByRole('button', { name: '「もういい」に置く' })).toBeNull();

    fireEvent.click(note('返信'));
    expect(note('返信')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '「もういい」に置く' }));

    expect(placeOf('返信')).toBe('もういい');
    expect(note('返信')).toHaveAttribute('aria-pressed', 'false');
  });

  it('一度置いた付箋も、別の箱へ動かし直せる', () => {
    renderPage();
    write('返信');

    fireEvent.click(note('返信'));
    fireEvent.click(screen.getByRole('button', { name: '「もういい」に置く' }));

    fireEvent.click(note('返信'));
    // 今いる箱には置き先を出さない
    expect(screen.queryByRole('button', { name: '「もういい」に置く' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '「よくわからない」に置く' }));
    expect(placeOf('返信')).toBe('よくわからない');
  });

  it('未仕分けの置き場にも戻せる', () => {
    renderPage();
    write('返信');

    fireEvent.click(note('返信'));
    fireEvent.click(screen.getByRole('button', { name: '「今は置いとく」に置く' }));
    expect(placeOf('返信')).toBe('今は置いとく');

    fireEvent.click(note('返信'));
    fireEvent.click(screen.getByRole('button', { name: 'ここに戻す' }));

    expect(placeOf('返信')).toBeNull();
  });

  it('もう一度タップすれば選択を解除できる', () => {
    renderPage();
    write('返信');

    fireEvent.click(note('返信'));
    fireEvent.click(note('返信'));

    expect(note('返信')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('button', { name: '「もういい」に置く' })).toBeNull();
  });

  it('3つの箱のラベルが並び、件数や完了の表示は出ない', () => {
    const { container } = renderPage();

    for (const box of SHELF_BOXES) {
      expect(screen.getByText(box.label)).toBeInTheDocument();
    }

    write('明日の打合せ');
    write('返信');
    fireEvent.click(note('返信'));
    fireEvent.click(screen.getByRole('button', { name: '「もういい」に置く' }));

    expect(container.textContent).not.toMatch(/\d/);
    expect(container.textContent).not.toMatch(/件|完了|残り|片付/);
  });

  it('何もせずに離れられる', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'とじる' })).toHaveAttribute('href', '/');
  });
});

/**
 * jsdom は要素の矩形を返さないので、ゾーンの位置だけ与えてドラッグの当たり判定を見る。
 * 盆: y 0-100 / 箱: y 200-300 を x 100 ずつ 3 つ。
 */
function layoutZones(container: HTMLElement) {
  const put = (el: Element, top: number, bottom: number, left: number, right: number) => {
    (el as HTMLElement).getBoundingClientRect = () =>
      ({
        top,
        bottom,
        left,
        right,
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
        toJSON: () => ({}),
      }) as DOMRect;
  };
  put(container.querySelector('.shelf-tray')!, 0, 100, 0, 300);
  container.querySelectorAll('.shelf-box').forEach((box, i) => {
    put(box, 200, 300, i * 100, i * 100 + 100);
  });
}

function drag(el: HTMLElement, to: { x: number; y: number }) {
  fireEvent.pointerDown(el, { button: 0, pointerId: 1, clientX: 10, clientY: 50 });
  fireEvent.pointerMove(el, { pointerId: 1, clientX: to.x, clientY: to.y });
  fireEvent.pointerUp(el, { pointerId: 1, clientX: to.x, clientY: to.y });
}

describe('ShelfPage: ドラッグで箱に放り込む', () => {
  // jsdom には実装がないので、掴んだ指の追従だけ無効化しておく
  beforeAll(() => {
    Element.prototype.setPointerCapture = () => {};
  });

  it('箱の上で放すと、その箱に入る', () => {
    const { container } = renderPage();
    write('返信');
    layoutZones(container);

    drag(note('返信'), { x: 150, y: 250 });

    expect(placeOf('返信')).toBe('もういい');
  });

  it('箱の外で放したときは、元の場所のまま', () => {
    const { container } = renderPage();
    write('返信');
    layoutZones(container);

    drag(note('返信'), { x: 280, y: 150 });

    expect(placeOf('返信')).toBeNull();
    expect(note('返信').closest('.shelf-tray')).not.toBeNull();
  });

  it('箱に入れたあとも、別の箱へ放り直せる', () => {
    const { container } = renderPage();
    write('返信');
    layoutZones(container);

    drag(note('返信'), { x: 50, y: 250 });
    expect(placeOf('返信')).toBe('今は置いとく');

    layoutZones(container);
    drag(note('返信'), { x: 250, y: 250 });
    expect(placeOf('返信')).toBe('よくわからない');
  });

  it('ドラッグした付箋は、タップとして選択されない', () => {
    const { container } = renderPage();
    write('返信');
    layoutZones(container);

    drag(note('返信'), { x: 150, y: 250 });
    fireEvent.click(note('返信'));

    expect(note('返信')).toHaveAttribute('aria-pressed', 'false');
  });

  it('しきい値以下のわずかな動きは、ドラッグにしない', () => {
    const { container } = renderPage();
    write('返信');
    layoutZones(container);

    fireEvent.pointerDown(note('返信'), { button: 0, pointerId: 1, clientX: 10, clientY: 50 });
    fireEvent.pointerMove(note('返信'), { pointerId: 1, clientX: 12, clientY: 52 });
    fireEvent.pointerUp(note('返信'), { pointerId: 1, clientX: 12, clientY: 52 });
    fireEvent.click(note('返信'));

    expect(placeOf('返信')).toBeNull();
    expect(note('返信')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('ShelfPage: 保存', () => {
  /** jsdom には Blob URL がないので、書き出しの入口だけ差し替えて中身を見る */
  function captureDownload() {
    const saved: { name: string; href: string }[] = [];
    const createObjectURL = vi.fn(() => 'blob:shelf');
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
    return { saved, createObjectURL, restore: () => { click.mockRestore(); vi.unstubAllGlobals(); } };
  }

  it('save で、置いたものをテキストとして書き出せる', () => {
    const dl = captureDownload();
    try {
      renderPage();
      write('返信');
      fireEvent.click(note('返信'));
      fireEvent.click(screen.getByRole('button', { name: '「もういい」に置く' }));

      fireEvent.click(screen.getByRole('button', { name: 'save' }));

      expect(dl.saved).toHaveLength(1);
      expect(dl.saved[0].name).toMatch(/^shelf_\d{8}_\d{4}\.txt$/);
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

describe('buildShelfText / shelfFileName', () => {
  const now = new Date(2026, 7, 31, 9, 5); // 2026-08-31 09:05

  it('画面と同じ並びで、箱ごとに書き出す', () => {
    let notes = addNote(addNote(addNote([], '明日の打合せ'), '返信'), 'あれ');
    notes = moveNote(notes, notes[1].id, 'enough');
    notes = moveNote(notes, notes[2].id, 'later');

    expect(buildShelfText(notes, now)).toBe(
      [
        '2026-08-31 09:05',
        '',
        '[まだどこにも置いていない]',
        '- 明日の打合せ',
        '',
        '[今は置いとく]',
        '- あれ',
        '',
        '[もういい]',
        '- 返信',
        '',
      ].join('\n')
    );
  });

  it('空の箱は見出しごと出さない', () => {
    const notes = addNote([], '返信');
    const text = buildShelfText(notes, now);

    expect(text).toContain('[まだどこにも置いていない]');
    expect(text).not.toContain('[もういい]');
    expect(text).not.toContain('[よくわからない]');
  });

  it('件数や「完了」は書き出さない', () => {
    const notes = addNote(addNote([], '返信'), 'あれ');
    expect(buildShelfText(notes, now)).not.toMatch(/件|完了|残り|片付/);
  });

  it('付箋が1枚もなければ、書き出す中身がない', () => {
    expect(buildShelfText([], now)).toBe('');
  });

  it('ファイル名は分まで入れる（同じ日に何度でも保存できる）', () => {
    expect(shelfFileName(now)).toBe('shelf_20260831_0905.txt');
  });
});

describe('付箋の仕分け（純粋関数）', () => {
  it('空白だけの入力は付箋にしない', () => {
    expect(createNote('   ')).toBeNull();
    expect(addNote([], '\n ')).toHaveLength(0);
  });

  it('前後の空白を落として付箋にする', () => {
    expect(createNote('  返信  ')?.text).toBe('返信');
    expect(createNote('返信')?.zone).toBe(UNSORTED);
  });

  it('moveNote は元の配列を書き換えない', () => {
    const notes = addNote([], '返信');
    const moved = moveNote(notes, notes[0].id, 'enough');

    expect(notes[0].zone).toBe(UNSORTED);
    expect(moved[0].zone).toBe('enough');
    expect(notesInZone(moved, 'enough')).toHaveLength(1);
    expect(notesInZone(moved, UNSORTED)).toHaveLength(0);
  });

  it('知らない id を渡しても何も壊れない', () => {
    const notes = addNote([], '返信');
    expect(moveNote(notes, 'なにか', 'later')).toEqual(notes);
  });
});
