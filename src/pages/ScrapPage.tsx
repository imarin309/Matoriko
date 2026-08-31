import { useEffect, useState } from 'react';
import { AppHeader } from '../components/header';
import { ScrapPaper } from '../components/scrap/ScrapPaper';
import { CRUMPLE_MS, SCRAP_DISCARD_LABEL } from '../components/scrap/scrap';

/**
 * ただ書き出すだけのページ。整理も答えも求めない。
 * 「ぽい」を押すと紙が丸まって飛んでいき、白紙に戻る。
 * 確認ダイアログ・完了画面・Undo は置かない（押したことを問い直すと、捨てた感じが残らないため）。
 * 書いたものは残さない（保存も書き出しも用意していない）。ページを離れれば消える。
 */
export function ScrapPage() {
  const [text, setText] = useState('');
  const [crumpling, setCrumpling] = useState(false);

  useEffect(() => {
    if (!crumpling) return;

    const timer = setTimeout(() => {
      setText('');
      setCrumpling(false);
    }, CRUMPLE_MS);
    return () => clearTimeout(timer);
  }, [crumpling]);

  return (
    <div className="scrap-shell min-h-screen">
      <div className="app-header">
        <AppHeader
          title="scrap"
          subtitle="感情を吐き出して捨てる"
          isSubPage
          iconSrc="/assets/montain_anpan.png"
        />
      </div>

      <div className="scrap-page">
        <ScrapPaper text={text} crumpling={crumpling} onChange={setText} />

        <div className="scrap-actions">
          <button
            type="button"
            onClick={() => setCrumpling(true)}
            disabled={crumpling}
            className="scrap-discard"
          >
            {SCRAP_DISCARD_LABEL}
          </button>
        </div>
      </div>
    </div>
  );
}
