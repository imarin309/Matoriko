import { useState, useRef } from 'react';
import { AppHeader } from '../components/header';
import { todayString } from '../utils/date';
import { PocketTagList } from '../components/diary/PocketTagList';
import type { PocketTagData } from '../components/diary/pocket-tag-types';
import { PlusCircle, Calendar, Download } from 'lucide-react';
import { motion } from 'motion/react';

export function DiaryPage() {
  const [dateType, setDateType] = useState<'day' | 'month'>('day');
  const [date, setDate] = useState(todayString());
  const [month, setMonth] = useState(() => todayString().substring(0, 7)); // YYYY-MM
  const [text, setText] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [pocketTags, setPocketTags] = useState<PocketTagData[]>([]);
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

  const addPocketTag = () => {
    const trimmed = quickInput.trim();
    if (trimmed) {
      const newTag: PocketTagData = {
        id: crypto.randomUUID(),
        text: trimmed,
      };
      setPocketTags((prev) => [...prev, newTag]);
      setQuickInput('');
    }
  };

  const handleQuickSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      addPocketTag();
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
        <AppHeader title="diary" subtitle="シンプルな日記" isSubPage />
      </div>

      <div
        className="max-w-lg mx-auto min-h-[100dvh] flex flex-col gap-4 relative z-10"
        style={{
          paddingTop: 'max(6rem, calc(4.5rem + env(safe-area-inset-top)))',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
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

          <div className="relative pr-8 border-t border-gray-100 pt-3">
            <label htmlFor="diary-tag" className="sr-only">タグ追加</label>
            <input
              id="diary-tag"
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={handleQuickSubmit}
              placeholder="浮かんだ言葉をポケットへ..."
              className="w-full bg-transparent text-sm text-gray-800 focus:outline-none placeholder:text-gray-400"
            />
            <button
              onClick={addPocketTag}
              className="absolute right-0 bottom-0 p-1 hover:bg-black/5 rounded-full transition-colors"
              title="追加"
            >
              <PlusCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 px-5 py-5 flex flex-col gap-3 flex-1 min-h-0">
          <label htmlFor="diary-text" className="sr-only">日記</label>
          <textarea
            id="diary-text"
            ref={textareaRef}
            autoFocus
            className="w-full flex-1 min-h-[8rem] text-base text-gray-800 placeholder:text-gray-300 resize-none focus:outline-none bg-transparent"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <PocketTagList tags={pocketTags} onTagClick={handleTagClick} />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          className="btn-sub-action w-full justify-center py-2.5 rounded-2xl"
        >
          <Download className="icon-sm" />
          <span>save</span>
        </motion.button>
      </div>
    </div>
  );
}
