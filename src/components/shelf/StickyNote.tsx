import type { ShelfNote } from './boxes';
import type { NoteDragHandlers } from './useNoteDrag';

interface StickyNoteProps {
  note: ShelfNote;
  /** タップで選ばれている状態（この付箋の置き先を選んでいる最中） */
  selected: boolean;
  dragging: boolean;
  dx: number;
  dy: number;
  onTap: () => void;
  handlers: NoteDragHandlers;
}

/** しんどいことを1枚書いた付箋。掴んで動かせるし、タップして箱を選んでもいい */
export function StickyNote({
  note,
  selected,
  dragging,
  dx,
  dy,
  onTap,
  handlers,
}: StickyNoteProps) {
  const className = [
    'shelf-note',
    selected ? 'shelf-note-on' : '',
    dragging ? 'shelf-note-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={className}
      // 掴んでいる間だけ指に追従させる。放すと transform が外れて元の位置へ戻る
      style={dragging ? { transform: `translate3d(${dx}px, ${dy}px, 0)` } : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      {...handlers}
    >
      {note.text}
    </button>
  );
}
