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

  it('ルートに対応するmanifestとホーム画面用の名前・アイコンに切り替える', () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      `
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      <meta name="apple-mobile-web-app-title" content="Matoriko" />
    `
    );

    render(
      <MemoryRouter initialEntries={['/diary/']}>
        <RouteMeta />
      </MemoryRouter>
    );

    const head = document.head;
    expect(head.querySelector('link[rel="manifest"]')?.getAttribute('href')).toBe(
      '/manifests/diary.webmanifest'
    );
    expect(head.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href')).toBe(
      '/icons/apps/diary-192.png'
    );
    expect(metaContent('meta[name="apple-mobile-web-app-title"]')).toBe('diary');
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
