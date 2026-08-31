import { useEffect, useRef } from 'react';
import { fadeAt, type Murmur } from './murmurs';

interface MurmurStreamProps {
  murmurs: readonly Murmur[];
}

/**
 * 送った一言が積もる場所。
 * 相手側の吹き出しは作らない（作ると、返事を待つ画面になってしまう）。
 */
export function MurmurStream({ murmurs }: MurmurStreamProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 送った直後は、いま書いたものが見えている位置にしておく
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [murmurs.length]);

  return (
    <div ref={ref} className="murmur-stream">
      <div className="murmur-stream-inner">
        {murmurs.map((murmur, i) => (
          <p
            key={murmur.id}
            className="murmur-line"
            style={{ opacity: fadeAt(murmurs.length - 1 - i) }}
          >
            {murmur.text}
          </p>
        ))}
      </div>
    </div>
  );
}
