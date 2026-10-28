import { PAGE_META, SITE_NAME } from './pageMeta';

const THEME_COLOR = '#4F46E5';

/** トップページは、インストール済みの端末のために従来のURLを保つ */
export function manifestHrefFor(pageKey: string): string {
  return pageKey === '/' ? '/manifest.json' : `/manifests${pageKey}.webmanifest`;
}

export function appleTouchIconFor(pageKey: string): string {
  return `${PAGE_META[pageKey].iconPrefix}-192.png`;
}

export function buildManifest(pageKey: string) {
  const { description, shortName, iconPrefix } = PAGE_META[pageKey];
  return {
    // id を省いたときの既定値は start_url なので、トップページの id は従来と変わらない
    id: pageKey,
    name: shortName === SITE_NAME ? SITE_NAME : `${shortName} | ${SITE_NAME}`,
    short_name: shortName,
    description,
    start_url: pageKey,
    scope: pageKey,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: THEME_COLOR,
    icons: [192, 512].map((size) => ({
      src: `${iconPrefix}-${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: 'any maskable',
    })),
  };
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceAttr(html: string, prefix: RegExp, value: string): string {
  const pattern = new RegExp(`(${prefix.source})[^"<]*`);
  // index.html の書き方が変わったときに、黙って共通の値のまま出力しないようにする
  if (!pattern.test(html)) throw new Error(`index.html に ${prefix} が見つかりません`);
  return html.replace(pattern, (_, matchedPrefix: string) => matchedPrefix + escapeAttr(value));
}

/**
 * iOS はホーム画面への追加時に、JS で書き換える前の manifest を使うことがあるため、
 * ページごとの初期 HTML に最初から正しい値を入れておく。
 */
export function renderPageHtml(indexHtml: string, pageKey: string): string {
  const { title, description, shortName } = PAGE_META[pageKey];
  const replacements: [RegExp, string][] = [
    [/<title>/, title],
    [/<meta\s+name="description"\s+content="/, description],
    [/<meta\s+property="og:title"\s+content="/, title],
    [/<meta\s+property="og:description"\s+content="/, description],
    [/<link\s+rel="manifest"\s+href="/, manifestHrefFor(pageKey)],
    [/<link\s+rel="apple-touch-icon"\s+href="/, appleTouchIconFor(pageKey)],
    [/<meta\s+name="apple-mobile-web-app-title"\s+content="/, shortName],
  ];
  return replacements.reduce((html, [prefix, value]) => replaceAttr(html, prefix, value), indexHtml);
}
