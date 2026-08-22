/**
 * 画面全体に敷くグラデーション背景。
 * 装飾目的の常時アニメーションは酔いの原因になるため動かさず、
 * 色だけを --accent（ステップ色）に追従させる。
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="mm-aurora">
      <div className="mm-blob mm-blob-a" />
      <div className="mm-blob mm-blob-b" />
      <div className="mm-blob mm-blob-c" />
    </div>
  );
}
