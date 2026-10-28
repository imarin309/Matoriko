import { describe, it, expect } from 'vitest';
import indexHtml from '../../../index.html?raw';
import { PAGE_META } from '../pageMeta';
import {
  appleTouchIconFor,
  buildManifest,
  manifestHrefFor,
  renderPageHtml,
} from '../webAppManifest';

const pageKeys = Object.keys(PAGE_META);
const publicFiles = Object.keys(import.meta.glob('/public/icons/**/*.png')).map((path) =>
  path.replace(/^\/public/, '')
);

function attr(html: string, tag: RegExp): string | undefined {
  return html.match(new RegExp(`${tag.source}([^"]*)"`))?.[1];
}

describe('buildManifest', () => {
  it.each(pageKeys)('%s のmanifestは対象ページから起動する', (pageKey) => {
    const manifest = buildManifest(pageKey);
    expect(manifest.start_url).toBe(pageKey);
    expect(manifest.scope).toBe(pageKey);
    expect(manifest.display).toBe('standalone');
    expect(manifest.short_name).toBe(PAGE_META[pageKey].shortName);
  });

  it('id と manifest のURLがページごとに重複しない', () => {
    expect(new Set(pageKeys.map((key) => buildManifest(key).id)).size).toBe(pageKeys.length);
    expect(new Set(pageKeys.map(manifestHrefFor)).size).toBe(pageKeys.length);
  });

  it('トップページは既存のmanifestのURLとidを保つ', () => {
    expect(manifestHrefFor('/')).toBe('/manifest.json');
    expect(buildManifest('/').id).toBe('/');
    expect(buildManifest('/').name).toBe('Matoriko');
  });

  it('機能ページのnameにはサイト名を添える', () => {
    expect(buildManifest('/mind-memo').name).toBe('mind-memo | Matoriko');
  });

  it.each(pageKeys)('%s のアイコン画像が存在する', (pageKey) => {
    for (const icon of buildManifest(pageKey).icons) {
      expect(publicFiles).toContain(icon.src);
    }
  });
});

describe('renderPageHtml', () => {
  it('元のindex.htmlはトップページ用の値を参照している', () => {
    expect(attr(indexHtml, /<link\s+rel="manifest"\s+href="/)).toBe(manifestHrefFor('/'));
    expect(attr(indexHtml, /<link\s+rel="apple-touch-icon"\s+href="/)).toBe(appleTouchIconFor('/'));
    expect(attr(indexHtml, /<meta\s+name="apple-mobile-web-app-title"\s+content="/)).toBe('Matoriko');
  });

  it.each(pageKeys)('%s の初期HTMLは専用のmanifestとアプリ名を参照する', (pageKey) => {
    const html = renderPageHtml(indexHtml, pageKey);
    const { title, description, shortName } = PAGE_META[pageKey];

    expect(attr(html, /<link\s+rel="manifest"\s+href="/)).toBe(manifestHrefFor(pageKey));
    expect(attr(html, /<link\s+rel="apple-touch-icon"\s+href="/)).toBe(appleTouchIconFor(pageKey));
    expect(attr(html, /<meta\s+name="apple-mobile-web-app-title"\s+content="/)).toBe(shortName);
    expect(attr(html, /<meta\s+name="description"\s+content="/)).toBe(description);
    expect(html).toContain(`<title>${title}</title>`);
  });

  it('アプリの読み込み部分は書き換えない', () => {
    const html = renderPageHtml(indexHtml, '/diary');
    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain('<script type="module" src="/src/main.tsx"></script>');
  });

  it('書き換え対象のタグがなければエラーにする', () => {
    expect(() => renderPageHtml('<html></html>', '/diary')).toThrow();
  });

  it('属性値をエスケープする', () => {
    const original = PAGE_META['/diary'].shortName;
    PAGE_META['/diary'].shortName = 'a"b<c';
    try {
      const html = renderPageHtml(indexHtml, '/diary');
      expect(html).toContain('content="a&quot;b&lt;c"');
    } finally {
      PAGE_META['/diary'].shortName = original;
    }
  });
});
