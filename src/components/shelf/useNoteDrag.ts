import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { ZoneId } from './boxes';

/** タップ（＝箱を選ぶフォールバック）と取り違えないための、ドラッグ開始のしきい値(px) */
const DRAG_THRESHOLD = 6;

interface DragState {
  id: string;
  dx: number;
  dy: number;
  /** 今ポインタが乗っているゾーン。どこにも乗っていなければ null */
  over: ZoneId | null;
}

interface PointerOrigin {
  id: string;
  x: number;
  y: number;
  moved: boolean;
}

/**
 * 付箋をつまんで箱へ放り込む操作。
 * スマホのタッチを前提に Pointer Events で組んでいる（付箋側に touch-action: none が要る）。
 * ドラッグできない環境ではタップで箱を選べるので、ここは必須の操作ではない。
 */
export function useNoteDrag(onDrop: (noteId: string, zone: ZoneId) => void) {
  const zones = useRef(new Map<ZoneId, HTMLElement>());
  const origin = useRef<PointerOrigin | null>(null);
  const dragged = useRef(false);
  const [drag, setDrag] = useState<DragState | null>(null);

  const registerZone = useCallback(
    (zone: ZoneId) => (el: HTMLElement | null) => {
      if (el) zones.current.set(zone, el);
      else zones.current.delete(zone);
    },
    []
  );

  const zoneAt = useCallback((x: number, y: number): ZoneId | null => {
    for (const [zone, el] of zones.current) {
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return zone;
      }
    }
    return null;
  }, []);

  const handlers = useCallback(
    (noteId: string) => ({
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
        if (e.button !== 0) return;
        origin.current = { id: noteId, x: e.clientX, y: e.clientY, moved: false };
        dragged.current = false;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      },
      onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
        const start = origin.current;
        if (!start || start.id !== noteId) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (!start.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        start.moved = true;
        dragged.current = true;
        setDrag({ id: noteId, dx, dy, over: zoneAt(e.clientX, e.clientY) });
      },
      onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
        const start = origin.current;
        origin.current = null;
        setDrag(null);
        if (!start || start.id !== noteId || !start.moved) return;
        const zone = zoneAt(e.clientX, e.clientY);
        // 箱の外で放したときは、そのまま元の場所へ戻るだけ
        if (zone) onDrop(noteId, zone);
      },
      onPointerCancel: () => {
        origin.current = null;
        setDrag(null);
      },
    }),
    [onDrop, zoneAt]
  );

  /** ドラッグ直後にも click は飛んでくるので、それをタップとして扱わないための判定 */
  const consumeDrag = useCallback(() => {
    const was = dragged.current;
    dragged.current = false;
    return was;
  }, []);

  return { drag, registerZone, handlers, consumeDrag };
}

export type NoteDragHandlers = ReturnType<ReturnType<typeof useNoteDrag>['handlers']>;
