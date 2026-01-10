import { useRef, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
}

interface SwipeGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

/**
 * スワイプジェスチャーを検出するカスタムフック
 */
export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
}: SwipeGestureOptions): SwipeGestureHandlers => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    hasMoved.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    hasMoved.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    // タップの場合（指を動かしていない場合）はスワイプ判定をスキップ
    if (!hasMoved.current) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      return;
    }

    const swipeDistance = touchStartX.current - touchEndX.current;

    // 左スワイプ（削除）
    if (swipeDistance > minSwipeDistance && onSwipeLeft) {
      onSwipeLeft();
    }

    // 右スワイプ（追加）
    if (swipeDistance < -minSwipeDistance && onSwipeRight) {
      onSwipeRight();
    }

    // リセット
    touchStartX.current = 0;
    touchEndX.current = 0;
    hasMoved.current = false;
  }, [onSwipeLeft, onSwipeRight, minSwipeDistance]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};
