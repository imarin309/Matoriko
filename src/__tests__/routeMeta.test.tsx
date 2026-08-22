import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RouteMeta } from '../components/RouteMeta';
import { PomodoroPage } from '../pages/PomodoroPage';
import { PAGE_META } from '../utils/pageMeta';

function metaContent(selector: string) {
  return document.head.querySelector<HTMLMetaElement>(selector)?.content;
}

describe('RouteMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta name="description" content="" />
      <meta property="og:title" content="" />
      <meta property="og:description" content="" />
    `;
  });

  it('ルートに対応するタイトルと説明文をdocumentに反映する', () => {
    render(
      <MemoryRouter initialEntries={['/mind-memo']}>
        <RouteMeta />
      </MemoryRouter>
    );

    const expected = PAGE_META['/mind-memo'];
    expect(document.title).toBe(expected.title);
    expect(metaContent('meta[name="description"]')).toBe(expected.description);
    expect(metaContent('meta[property="og:title"]')).toBe(expected.title);
    expect(metaContent('meta[property="og:description"]')).toBe(expected.description);
  });

  it('ページ側のtitle操作とぶつからない（/pomodoro）', () => {
    render(
      <MemoryRouter initialEntries={['/pomodoro']}>
        <RouteMeta />
        <PomodoroPage />
      </MemoryRouter>
    );

    expect(document.title).toBe(PAGE_META['/pomodoro'].title);
  });
});
