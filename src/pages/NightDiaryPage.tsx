import { useState, useRef } from 'react';
import { AppHeader } from '../components/header';
import { NightDiaryActions } from '../components/night-diary/NightDiaryActions';
import { todayString } from '../utils/date';
import { PocketTagList } from '../components/night-diary/PocketTagList';
import type { PocketTagData } from '../components/night-diary/pocket-tag-types';
import { PlusCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = [
  'bg-blue-100/40',
  'bg-pink-100/40',
  'bg-purple-100/40',
  'bg-green-100/40',
  'bg-yellow-100/40',
  'bg-indigo-100/40',
];

export function NightDiaryPage() {
  const [dateType, setDateType] = useState<'day' | 'month'>('day');
  const [date, setDate] = useState(todayString());
  const [month, setMonth] = useState(() => todayString().substring(0, 7)); // YYYY-MM
  const [text, setText] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [pocketTags, setPocketTags] = useState<PocketTagData[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentDateValue = dateType === 'day' ? date : month;

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary-${currentDateValue}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setDate(todayString());
    setMonth(todayString().substring(0, 7));
    setText('');
    setPocketTags([]);
  };

  const addPocketTag = () => {
    const trimmed = quickInput.trim();
    if (trimmed) {
      const newTag: PocketTagData = {
        id: crypto.randomUUID(),
        text: trimmed,
        size: Math.min(100, 60 + trimmed.length * 2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        memoIds: [],
      };
      setPocketTags((prev) => [...prev, newTag]);
      setQuickInput('');
    }
  };

  const handleQuickSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      addPocketTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
    }
  };

  const handleTagClick = (tag: PocketTagData) => {
    setText((prev) => {
      const separator = prev.length > 0 && !prev.endsWith('\n') ? '\n' : '';
      return `${prev}${separator}${tag.text}\n`;
    });
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: "url('/assets/kamaboko.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      
      <div className="app-header z-[1000]">
        <AppHeader title="night-diary" isSubPage />
        <NightDiaryActions
          onDownload={handleDownload}
          onReset={handleReset}
          onToggleTag={() => setShowTagInput(!showTagInput)}
          isTagActive={showTagInput}
        />
        <AnimatePresence>
          {showTagInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-200/60 bg-white/60 backdrop-blur-sm"
            >
              <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
                <div className="flex-1 relative bg-white/70 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/60 px-4 py-1.5">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    onKeyDown={handleQuickSubmit}
                    placeholder="浮かんだ言葉をポケットへ..."
                    className="w-full bg-transparent text-sm text-gray-800 focus:outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                  <button
                    onClick={addPocketTag}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full transition-colors"
                    title="追加"
                  >
                    <PlusCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="max-w-lg mx-auto flex flex-col gap-4 relative z-10"
        style={{
          paddingTop: 'max(8.5rem, calc(7rem + env(safe-area-inset-top)))',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <PocketTagList tags={pocketTags} onTagClick={handleTagClick} />

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 px-5 py-3 flex flex-col gap-3">
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 border-b border-gray-100 pb-2">
            <button 
              onClick={() => setDateType('day')}
              className={`pb-1 px-1 transition-colors ${dateType === 'day' ? 'text-gray-900 border-b-2 border-gray-800' : 'hover:text-gray-700'}`}
            >
              daily
            </button>
            <button 
              onClick={() => setDateType('month')}
              className={`pb-1 px-1 transition-colors ${dateType === 'month' ? 'text-gray-900 border-b-2 border-gray-800' : 'hover:text-gray-700'}`}
            >
              monthly
            </button>
          </div>
          
          <div className="relative flex items-center justify-between group">
            <label htmlFor="diary-date" className="sr-only">日付選択</label>
            <input
              id="diary-date"
              type={dateType === 'day' ? 'date' : 'month'}
              value={currentDateValue}
              onChange={(e) => dateType === 'day' ? setDate(e.target.value) : setMonth(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="text-base text-gray-800 pointer-events-none">
              {currentDateValue.replace(/-/g, '/')}
            </div>
            <Calendar className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors pointer-events-none" />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 px-5 py-5">
          <label htmlFor="diary-text" className="sr-only">日記</label>
          <textarea
            id="diary-text"
            ref={textareaRef}
            autoFocus
            className="w-full text-base text-gray-800 placeholder:text-gray-300 resize-none focus:outline-none bg-transparent"
            style={{ minHeight: 'calc(100dvh - 340px)' }}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
