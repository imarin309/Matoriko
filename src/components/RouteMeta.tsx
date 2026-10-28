import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_META, pageKeyForPath } from '../utils/pageMeta';
import { appleTouchIconFor, manifestHrefFor } from '../utils/webAppManifest';

function setMetaContent(selector: string, content: string) {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.content = content;
}

function setLinkHref(rel: string, href: string) {
  const el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (el) el.setAttribute('href', href);
}

/**
 * ルートに合わせて document.title と meta description を切り替える。
 * manifest などは各ページの初期 HTML で設定済みだが、SPA 内で遷移した先でホーム画面に追加された場合に備えて合わせておく。
 */
export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageKey = pageKeyForPath(pathname);
    const { title, description, shortName } = PAGE_META[pageKey];
    document.title = title;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="apple-mobile-web-app-title"]', shortName);
    setLinkHref('manifest', manifestHrefFor(pageKey));
    setLinkHref('apple-touch-icon', appleTouchIconFor(pageKey));
  }, [pathname]);

  return null;
}
