import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download } from 'lucide-react';
import { AppHeader } from '../components/header';
import { todayString } from '../utils/date';
import { loadImage, roundedRect, wrapText, saveImage } from '../utils/downloadImage';

interface MemoryEntry {
  id: number;
  text: string;
  imageUrl: string;
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function ImageBlock({
  imageUrl,
  onImageChange,
}: {
  imageUrl: string;
  onImageChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    onImageChange(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ aspectRatio: '4/3' }}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <img
        src={imageUrl}
        alt="memory"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full transition-opacity duration-200">
          画像を変更
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

function MemoryCard({
  entry,
  localIndex,
  onTextChange,
  onImageChange,
  onDelete,
}: {
  entry: MemoryEntry;
  localIndex: number;
  onTextChange: (id: number, text: string) => void;
  onImageChange: (id: number, url: string) => void;
  onDelete: (id: number) => void;
}) {
  const isEven = localIndex % 2 === 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [entry.text]);

  const textBlock = (
    <div className="flex-1">
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none text-base leading-relaxed overflow-hidden"
        style={{ minHeight: '160px' }}
        placeholder="＿φ(￣ー￣ )"
        value={entry.text}
        onChange={(e) => onTextChange(entry.id, e.target.value)}
      />
    </div>
  );

  const imageBlock = (
    <div className="flex-1">
      <ImageBlock
        imageUrl={entry.imageUrl}
        onImageChange={(url) => onImageChange(entry.id, url)}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative group p-2 sm:p-4"
    >
      <div className="flex gap-2 sm:gap-4 items-center">
        {isEven ? (
          <>
            {textBlock}
            {imageBlock}
          </>
        ) : (
          <>
            {imageBlock}
            {textBlock}
          </>
        )}
      </div>

      <button
        onClick={() => onDelete(entry.id)}
        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-400 text-white shadow-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex items-center justify-center text-sm hover:bg-rose-500"
        aria-label="削除"
      >
        ×
      </button>
    </motion.div>
  );
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

async function downloadMemory(
  entries: MemoryEntry[],
  title: string,
  dateStr: string,
) {
  const groups = chunk(entries, 3);
  const numGroups = groups.length;
  const colW = 560;
  const imgW = Math.floor(colW * 0.48);
  const imgH = Math.round(imgW * 3 / 4); // 4:3
  const textW = colW - imgW - 12;
  const rowPad = 14;
  const rowH = imgH + rowPad * 2;
  const gapX = 36;
  const padX = 44;
  const padY = 44;
  const headerH = 178;
  const width = padX * 2 + numGroups * colW + (numGroups - 1) * gapX;
  const height = headerH + rowH * 3 + padY;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#fff9f0');
  bg.addColorStop(0.5, '#fdf5ff');
  bg.addColorStop(1, '#f0f7ff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#d97706';
  ctx.font = 'bold 36px "Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif';
  ctx.fillText(formatDate(dateStr), padX, 30);

  if (title) {
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 64px "Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif';
    ctx.fillText(title, padX, 98, width - padX * 2);
  }

  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    const colX = padX + gi * (colW + gapX);

    for (let ri = 0; ri < 3; ri++) {
      const entry = group[ri];
      if (!entry) continue;
      const rowY = headerH + ri * rowH;
      const isEven = ri % 2 === 0; // even: text left, image right
      const imgX = isEven ? colX + colW - imgW : colX;
      const textX = isEven ? colX : colX + imgW + 12;
      const imgY = rowY + rowPad;
      const textAreaH = imgH;

      try {
        const img = await loadImage(entry.imageUrl);
        const srcAR = img.naturalWidth / img.naturalHeight;
        const dstAR = imgW / imgH;
        let sx: number, sy: number, sw: number, sh: number;
        if (srcAR > dstAR) {
          sh = img.naturalHeight;
          sw = sh * dstAR;
          sx = (img.naturalWidth - sw) / 2;
          sy = 0;
        } else {
          sw = img.naturalWidth;
          sh = sw / dstAR;
          sx = 0;
          sy = (img.naturalHeight - sh) / 2;
        }
        ctx.save();
        roundedRect(ctx, imgX, imgY, imgW, imgH, 12);
        ctx.clip();
        ctx.drawImage(img, sx, sy, sw, sh, imgX, imgY, imgW, imgH);
        ctx.restore();
      } catch { /* skip */ }

      if (entry.text) {
        ctx.fillStyle = '#374151';
        ctx.font = '20px "Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const lines = wrapText(ctx, entry.text, textW);
        const lineH = 30;
        const totalH = lines.length * lineH;
        const startY = imgY + Math.max(0, (textAreaH - totalH) / 2);
        lines.forEach((line, li) => ctx.fillText(line, textX, startY + li * lineH, textW));
      }
    }

    // グループ間の縦区切り線
    if (gi < groups.length - 1) {
      const sepX = colX + colW + gapX / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 222, 179, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sepX, headerH);
      ctx.lineTo(sepX, height - padY);
      ctx.stroke();
      ctx.restore();
    }
  }

  await saveImage(canvas, `memory-${dateStr}.jpg`);
}

export function MemoryPage() {
  const [date, setDate] = useState(todayString());
  const [title, setTitle] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<MemoryEntry[]>(() => [
    { id: Date.now(), text: '', imageUrl: '/assets/kamaboko.jpeg' },
  ]);
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text: '', imageUrl: '/assets/kamaboko.jpeg' },
    ]);
  };

  const updateText = (id: number, text: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, text } : e)));
  };

  const updateImage = (id: number, imageUrl: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        if (e.imageUrl.startsWith('blob:')) URL.revokeObjectURL(e.imageUrl);
        return { ...e, imageUrl };
      })
    );
  };

  const deleteEntry = (id: number) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry?.imageUrl.startsWith('blob:')) URL.revokeObjectURL(entry.imageUrl);
      return prev.filter((e) => e.id !== id);
    });
  };

  useEffect(() => {
    return () => {
      entriesRef.current.forEach((e) => {
        if (e.imageUrl.startsWith('blob:')) URL.revokeObjectURL(e.imageUrl);
      });
    };
  }, []);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadMemory(entries, title, date);
    } catch (e) {
      console.error('download failed:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(160deg, #fff9f0 0%, #fdf5ff 50%, #f0f7ff 100%)',
        }}
      />

      <div className="app-header">
        <AppHeader title="memory" isSubPage />
        <div className="sub-toolbar">
          <div className="sub-toolbar-container">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); void handleDownload(); }}
              disabled={isDownloading}
              className="btn-sub-action"
            >
              <Download className="icon-sm" />
              <span className="text-xs">{isDownloading ? '処理中...' : '保存'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div
        className="max-w-2xl mx-auto flex flex-col gap-6"
        style={{
          paddingTop: 'max(10rem, calc(7.5rem + env(safe-area-inset-top)))',
          paddingBottom: 'max(4rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
        }}
      >
        {/* 日付 & タイトル */}
        <div
          className="rounded-3xl px-4 py-4 sm:px-6 sm:py-5 shadow-sm border"
          style={{
            background: 'linear-gradient(135deg, #fff9f0 0%, #fffdf8 100%)',
            borderColor: '#f5deb3',
          }}
        >
          <div
            className="relative inline-block cursor-pointer mb-2"
            onClick={(e) => {
              e.stopPropagation();
              try { dateInputRef.current?.showPicker(); } catch { /* mobile unsupported */ }
            }}
          >
            <span className="text-base font-semibold text-amber-600 hover:text-amber-500 transition-colors pointer-events-none">
              {formatDate(date)}
            </span>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            className="w-full text-2xl font-bold text-gray-800 placeholder:text-gray-300 bg-transparent focus:outline-none"
          />
        </div>

        {/* エントリリスト（全て1カード） */}
        <div
          className="rounded-3xl border shadow-sm overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fffdf8 0%, #fdf5ff 100%)',
            borderColor: '#f5deb3',
          }}
        >
          <AnimatePresence>
            {entries.map((entry, index) => (
              <motion.div key={entry.id} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <MemoryCard
                  entry={entry}
                  localIndex={index}
                  onTextChange={updateText}
                  onImageChange={updateImage}
                  onDelete={deleteEntry}
                />
                {index < entries.length - 1 && (
                  <div
                    className="mx-4 border-t"
                    style={{ borderColor: 'rgba(245, 222, 179, 0.6)' }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 追加ボタン */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addEntry}
          className="w-full py-4 rounded-3xl border-2 border-dashed text-amber-400 hover:text-amber-500 hover:border-amber-400 transition-colors duration-200 text-sm font-medium"
          style={{ borderColor: '#f5deb3' }}
        >
          +
        </motion.button>
      </div>
    </div>
  );
}
