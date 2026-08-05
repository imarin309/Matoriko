import '@testing-library/jest-dom/vitest';

// jsdom は Element.prototype.scrollTo を実装していないため補完する
Element.prototype.scrollTo = () => {};
