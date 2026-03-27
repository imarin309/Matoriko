import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EyeOff } from 'lucide-react';
import { AppHeader } from '../components/header';

interface MemoryEntry {
  id: number;
  text: string;
  imageUrl: string;
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
    const url = URL.createObjectURL(file);
    onImageChange(url);
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
  index,
  onTextChange,
  onImageChange,
  onDelete,
}: {
  entry: MemoryEntry;
  index: number;
  onTextChange: (id: number, text: string) => void;
  onImageChange: (id: number, url: string) => void;
  onDelete: (id: number) => void;
}) {
  const isEven = index % 2 === 0;

  const textBlock = (
    <div className="flex-1 flex flex-col">
      <textarea
        className="flex-1 w-full bg-transparent text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none text-base leading-relaxed"
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
      className="relative group"
    >
      <div className="rounded-3xl p-5">
        <div className="flex gap-4 items-start">
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
      </div>

      {/* 削除ボタン */}
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

export function MemoryPage() {
  const [date, setDate] = useState(todayString());
  const [title, setTitle] = useState('');
  const [isUIHidden, setIsUIHidden] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<MemoryEntry[]>(() => [
    { id: Date.now(), text: '', imageUrl: '/kamaboko.jpeg' },
  ]);
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text: '', imageUrl: '/kamaboko.jpeg' },
    ]);
  };

  const updateText = (id: number, text: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, text } : e))
    );
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
      if (entry?.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(entry.imageUrl);
      }
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

  return (
    <div
      className="min-h-screen relative"
      onClick={isUIHidden ? () => setIsUIHidden(false) : undefined}
    >
      {/* 背景 */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(160deg, #fff9f0 0%, #fdf5ff 50%, #f0f7ff 100%)',
        }}
      />

      {/* ヘッダー */}
      {!isUIHidden && (
        <div className="app-header">
          <AppHeader title="memory" isSubPage />
          <div className="sub-toolbar">
            <div className="sub-toolbar-container">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setIsUIHidden(true); }}
                aria-label="UIを非表示"
                className="btn-sub-action-ghost"
              >
                <EyeOff className="icon-sm" />
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* コンテンツ */}
      <div
        className="max-w-2xl mx-auto flex flex-col gap-6"
        style={{
          paddingTop: isUIHidden
            ? 'max(2rem, env(safe-area-inset-top))'
            : 'max(10rem, calc(7.5rem + env(safe-area-inset-top)))',
          paddingBottom: 'max(4rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
          paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
        }}
      >
        {/* 日付 & タイトル */}
        <div
          className="rounded-3xl px-6 py-5 shadow-sm border"
          style={{
            background: 'linear-gradient(135deg, #fff9f0 0%, #fffdf8 100%)',
            borderColor: '#f5deb3',
          }}
        >
          <button
            onClick={() => dateInputRef.current?.showPicker()}
            className="text-sm text-amber-600 mb-2 hover:text-amber-500 transition-colors text-left"
          >
            {formatDate(date)}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="sr-only"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            className="w-full text-2xl font-bold text-gray-800 placeholder:text-gray-300 bg-transparent focus:outline-none"
          />
        </div>

        {/* エントリーリスト */}
        <AnimatePresence>
          {entries.map((entry, index) => (
            <MemoryCard
              key={entry.id}
              entry={entry}
              index={index}
              onTextChange={updateText}
              onImageChange={updateImage}
              onDelete={deleteEntry}
            />
          ))}
        </AnimatePresence>

        {/* 追加ボタン */}
        {!isUIHidden && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addEntry}
            className="w-full py-4 rounded-3xl border-2 border-dashed text-amber-400 hover:text-amber-500 hover:border-amber-400 transition-colors duration-200 text-sm font-medium"
            style={{ borderColor: '#f5deb3' }}
          >
            +
          </motion.button>
        )}
      </div>
    </div>
  );
}
