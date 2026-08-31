import type { ReactNode } from 'react';

interface ShelfZoneProps {
  /** 未仕分けの置き場は 'tray'、3つの箱は 'box' */
  variant: 'tray' | 'box';
  label?: string;
  /** ドラッグ中の付箋がこの上に乗っている */
  active: boolean;
  /** タップで選ばれた付箋の置き先になれる（今いる場所には出さない） */
  receiving: boolean;
  dropLabel: string;
  /** 読み上げ用。どの箱に置くのかまで含めた言い方にする */
  dropAriaLabel: string;
  onDrop: () => void;
  zoneRef: (el: HTMLDivElement | null) => void;
  children: ReactNode;
}

/**
 * 付箋の置き場。ドラッグの落とし先であり、タップで選んだときの行き先でもある。
 * 件数や割合は出さない。空のままでも何も言わない。
 */
export function ShelfZone({
  variant,
  label,
  active,
  receiving,
  dropLabel,
  dropAriaLabel,
  onDrop,
  zoneRef,
  children,
}: ShelfZoneProps) {
  const className = [
    'shelf-zone',
    variant === 'tray' ? 'shelf-tray' : 'shelf-box',
    active ? 'shelf-zone-active' : '',
    receiving ? 'shelf-zone-receiving' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={zoneRef} className={className} onClick={onDrop}>
      {label && <span className="shelf-box-label">{label}</span>}
      <div className={variant === 'tray' ? 'shelf-tray-notes' : 'shelf-box-notes'}>
        {children}
      </div>
      {receiving && (
        <button
          type="button"
          className="shelf-drop"
          aria-label={dropAriaLabel}
          onClick={(e) => {
            e.stopPropagation();
            onDrop();
          }}
        >
          {dropLabel}
        </button>
      )}
    </div>
  );
}
