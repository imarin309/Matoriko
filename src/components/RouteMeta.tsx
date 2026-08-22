import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { metaForPath } from '../utils/pageMeta';

function setMetaContent(selector: string, content: string) {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.content = content;
}

/** ルートに合わせて document.title と meta description を切り替える。 */
export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description } = metaForPath(pathname);
    document.title = title;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
  }, [pathname]);

  return null;
}
