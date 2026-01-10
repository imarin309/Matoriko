import { useState, useEffect } from 'react';

/**
 * モバイルデバイスかどうかを判定するカスタムフック
 * 画面幅768px以下、またはタッチデバイスの場合にtrueを返す
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrowScreen = window.innerWidth < 768;
      setIsMobile(hasTouch || isNarrowScreen);
    };

    // 初回チェック
    checkIsMobile();

    // リサイズ時に再チェック
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};
