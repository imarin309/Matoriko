import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { AppLauncher } from '../components/AppLauncher';

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function NightDiaryPage() {
  const [date, setDate] = useState(todayString());
  const [text, setText] = useState('');

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary-${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setDate(todayString());
    setText('');
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: "url('/kamaboko.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      {/* ヘッダー */}
      <div className="app-header">
        <div className="app-header-container">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="戻る"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <img src="/icons/icon.png" alt="アイコン" className="w-10 h-10" />
            <h1 className="app-title">night-diary</h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="btn-reset"
            >
              <Download className="icon-sm" />
              <span className="hidden md:inline">save</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              aria-label="リセット"
            >
              <RotateCcw size={16} />
            </motion.button>
            <AppLauncher />
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-lg mx-auto px-4 pt-32 pb-16 flex flex-col gap-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 px-5 py-4">
          <label htmlFor="diary-date" className="sr-only">日付</label>
          <input
            id="diary-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm text-gray-800 focus:outline-none bg-transparent"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 px-5 py-5">
          <label htmlFor="diary-text" className="sr-only">日記</label>
          <textarea
            id="diary-text"
            autoFocus
            className="w-full text-sm text-gray-800 placeholder:text-gray-300 resize-none focus:outline-none min-h-[400px] bg-transparent"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
