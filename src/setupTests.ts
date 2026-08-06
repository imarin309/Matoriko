import '@testing-library/jest-dom/vitest';

// jsdom が Element.prototype.scrollTo を未実装の場合のみ補完する
if (typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = () => {};
}
