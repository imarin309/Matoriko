import { useState } from 'react';
import { AppHeader } from '../components/header';
import { NightDiaryActions } from '../components/night-diary/NightDiaryActions';

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
        <AppHeader title="night-diary" isSubPage />
        <NightDiaryActions onDownload={handleDownload} onReset={handleReset} />
      </div>

      {/* コンテンツ */}
      <div
        className="max-w-lg mx-auto flex flex-col gap-4"
        style={{
          paddingTop: 'max(10rem, calc(7.5rem + env(safe-area-inset-top)))',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 px-5 py-4">
          <label htmlFor="diary-date" className="sr-only">日付</label>
          <input
            id="diary-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-base text-gray-800 focus:outline-none bg-transparent"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 px-5 py-5">
          <label htmlFor="diary-text" className="sr-only">日記</label>
          <textarea
            id="diary-text"
            autoFocus
            className="w-full text-base text-gray-800 placeholder:text-gray-300 resize-none focus:outline-none bg-transparent"
            style={{ minHeight: 'calc(100dvh - 280px)' }}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
