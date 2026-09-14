import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Plus, X } from 'lucide-react';
import { AppHeader } from '../components/header';
import { todayString } from '../utils/date';
import {
  DAY_COLORS,
  formatDate,
  type DayPlan,
  type PackingItem,
  type ScheduleItem,
} from '../components/travel/itinerary';
import { downloadTravelImage } from '../components/travel/downloadTravelImage';

function DayPlanCard({
  day,
  dayNumber,
  onDateChange,
  onItemChange,
  onAddItem,
  onDeleteItem,
  onDeleteDay,
}: {
  day: DayPlan;
  dayNumber: number;
  onDateChange: (id: number, date: string) => void;
  onItemChange: (dayId: number, itemId: number, field: keyof Omit<ScheduleItem, 'id'>, value: string) => void;
  onAddItem: (dayId: number) => void;
  onDeleteItem: (dayId: number, itemId: number) => void;
  onDeleteDay: (id: number) => void;
}) {
  const color = DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
  const dateRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative group/day rounded-3xl overflow-visible"
      style={{ background: color.bg, border: `1.5px solid ${color.border}` }}
    >
      {/* Day header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0"
          style={{ background: color.badge }}
        >
          {dayNumber}
        </span>
        <div
          className="relative cursor-pointer"
          onClick={() => { try { dateRef.current?.showPicker(); } catch { /* mobile */ } }}
        >
          <span
            className="text-base font-semibold transition-opacity hover:opacity-70"
            style={{ color: color.text }}
          >
            {formatDate(day.date) || `Day ${dayNumber} — 日付を選択`}
          </span>
          <input
            ref={dateRef}
            type="date"
            value={day.date}
            onChange={(e) => onDateChange(day.id, e.target.value)}
            className="absolute inset-0 opacity-0 w-full cursor-pointer"
          />
        </div>
      </div>

      {/* Schedule items */}
      <div className="px-5 pb-4 flex flex-col gap-3">
        {day.items.map((item) => (
          <div key={item.id} className="relative group/item flex gap-2 items-start">
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex gap-2 items-start">
                <div className="flex items-center gap-0.5 bg-white/70 rounded-xl px-2 py-1.5 border border-transparent focus-within:border-gray-300 shrink-0">
                  <select
                    value={item.time ? item.time.split(':')[0] : ''}
                    onChange={(e) => {
                      const mm = item.time ? item.time.split(':')[1] : '00';
                      onItemChange(day.id, item.id, 'time', e.target.value ? `${e.target.value}:${mm}` : '');
                    }}
                    className="text-xs text-gray-400 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-300">:</span>
                  <select
                    value={item.time ? item.time.split(':')[1] : ''}
                    onChange={(e) => {
                      const hh = item.time ? item.time.split(':')[0] : '00';
                      onItemChange(day.id, item.id, 'time', `${hh}:${e.target.value}`);
                    }}
                    className="text-xs text-gray-400 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {['00','10','20','30','40','50'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={item.place}
                  onChange={(e) => onItemChange(day.id, item.id, 'place', e.target.value)}
                  className="flex-1 text-sm font-semibold text-gray-800 bg-white/70 rounded-xl px-2 py-1.5 focus:outline-none border border-transparent focus:border-gray-300 placeholder:text-gray-300"
                  placeholder="場所・タイトル"
                />
              </div>
              <textarea
                value={item.memo}
                onChange={(e) => onItemChange(day.id, item.id, 'memo', e.target.value)}
                className="w-full text-xs text-gray-500 bg-white/70 rounded-xl px-2 py-1.5 resize-none focus:outline-none border border-transparent focus:border-gray-300 placeholder:text-gray-300 leading-relaxed"
                rows={2}
                placeholder="メモ"
              />
            </div>
            <button
              onClick={() => onDeleteItem(day.id, item.id)}
              className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 mt-1.5 hover:bg-rose-400 hover:text-white"
              aria-label="削除"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button
          onClick={() => onAddItem(day.id)}
          className="flex items-center gap-1.5 text-xs font-medium mt-1 transition-colors"
          style={{ color: color.badge }}
        >
          <Plus className="w-3.5 h-3.5" />
          項目を追加
        </button>
      </div>

      {/* Delete day */}
      <button
        onClick={() => onDeleteDay(day.id)}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-400 text-white shadow-sm opacity-0 group-hover/day:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-500 z-10"
        aria-label="日程を削除"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

export function TravelItineraryPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(todayString());
  const [endDate, setEndDate] = useState(todayString());
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const [days, setDays] = useState<DayPlan[]>(() => [
    {
      id: Date.now(),
      date: todayString(),
      items: [{ id: Date.now() + 1, time: '', place: '', memo: '' }],
    },
  ]);

  const [packing, setPacking] = useState<PackingItem[]>(() => [
    { id: Date.now() + 200, text: '' },
  ]);

  const [memo, setMemo] = useState('');

  // Day operations
  const addDay = () =>
    setDays((prev) => [
      ...prev,
      { id: Date.now(), date: '', items: [{ id: Date.now() + 1, time: '', place: '', memo: '' }] },
    ]);

  const deleteDay = (id: number) => setDays((prev) => prev.filter((d) => d.id !== id));

  const updateDayDate = (id: number, date: string) =>
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, date } : d)));

  const addScheduleItem = (dayId: number) =>
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, items: [...d.items, { id: Date.now(), time: '', place: '', memo: '' }] }
          : d
      )
    );

  const deleteScheduleItem = (dayId: number, itemId: number) =>
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d
      )
    );

  const updateScheduleItem = (
    dayId: number,
    itemId: number,
    field: keyof Omit<ScheduleItem, 'id'>,
    value: string
  ) =>
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)) }
          : d
      )
    );

  // Packing operations
  const addPacking = () =>
    setPacking((prev) => [...prev, { id: Date.now(), text: '' }]);

  const deletePacking = (id: number) =>
    setPacking((prev) => prev.filter((p) => p.id !== id));

  const updatePackingText = (id: number, text: string) =>
    setPacking((prev) => prev.map((p) => (p.id === id ? { ...p, text } : p)));

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadTravelImage({ title, startDate, endDate, days, packing, memo });
    } catch (e) {
      console.error('download failed:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(160deg, #fff0f5 0%, #fff8f0 45%, #f0f5ff 100%)',
        }}
      />

      {/* Header */}
      <div className="app-header">
        <AppHeader title="travel" subtitle="旅のしおり" isSubPage iconSrc="/assets/travel_anpan.png" />
        <div className="sub-toolbar">
          <div className="sub-toolbar-container">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => void handleDownload()}
              disabled={isDownloading}
              className="btn-sub-action"
            >
              <Download className="icon-sm" />
              <span className="text-xs">{isDownloading ? '処理中...' : '保存'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="max-w-lg mx-auto flex flex-col gap-5"
        style={{
          paddingTop: 'max(10rem, calc(7.5rem + env(safe-area-inset-top)))',
          paddingBottom: 'max(4rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        {/* Title card */}
        <div
          className="rounded-3xl px-5 py-5 shadow-sm relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fff0f5 0%, #fff8f0 100%)',
            border: '1.5px solid #f9c0d0',
          }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="旅行タイトル"
            className="w-full text-2xl font-bold text-gray-800 placeholder:text-gray-300 bg-transparent focus:outline-none mb-3"
          />

          <div className="flex items-center gap-2 text-sm">
            <div
              className="relative cursor-pointer"
              onClick={() => { try { startDateRef.current?.showPicker(); } catch { /* */ } }}
            >
              <span className="text-gray-600 font-medium hover:text-pink-500 transition-colors">
                {formatDate(startDate) || '出発日'}
              </span>
              <input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
              />
            </div>
            <span className="text-gray-400">〜</span>
            <div
              className="relative cursor-pointer"
              onClick={() => { try { endDateRef.current?.showPicker(); } catch { /* */ } }}
            >
              <span className="text-gray-600 font-medium hover:text-pink-500 transition-colors">
                {formatDate(endDate) || '帰着日'}
              </span>
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Sticker 1 */}
        <div className="relative z-10 flex justify-end pr-2 -mt-14 -mb-14">
          <img
            src="/assets/takoyaki_anpan.png"
            alt=""
            className="w-24 h-24 pointer-events-none select-none drop-shadow-md"
            style={{ transform: 'rotate(12deg)' }}
          />
        </div>

        {/* Schedule section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <img src="/assets/travel_anpan.png" alt="" className="w-7 h-7 shrink-0" />
            <h3 className="text-sm font-bold text-gray-500 tracking-wide">旅程</h3>
          </div>

          <AnimatePresence>
            {days.map((day, index) => (
              <DayPlanCard
                key={day.id}
                day={day}
                dayNumber={index + 1}
                onDateChange={updateDayDate}
                onItemChange={updateScheduleItem}
                onAddItem={addScheduleItem}
                onDeleteItem={deleteScheduleItem}
                onDeleteDay={deleteDay}
              />
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addDay}
            className="relative z-20 w-full py-3 rounded-3xl border-2 border-dashed text-pink-300 hover:text-pink-400 hover:border-pink-300 transition-colors duration-200 text-sm font-medium"
          >
            + 日程を追加
          </motion.button>
        </div>

        {/* Sticker 2 */}
        <div className="relative z-10 flex justify-start pl-2 -mt-14 -mb-14">
          <img
            src="/assets/onsen_anpan.png"
            alt=""
            className="w-24 h-24 pointer-events-none select-none drop-shadow-md"
            style={{ transform: 'rotate(-10deg)' }}
          />
        </div>

        {/* Packing list section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <img src="/assets/travel_anpan.png" alt="" className="w-7 h-7 shrink-0" />
            <h3 className="text-sm font-bold text-gray-500 tracking-wide">持ち物</h3>
          </div>

          <div
            className="rounded-3xl px-5 py-4"
            style={{ background: '#fdf4ff', border: '1.5px solid #e9d5ff' }}
          >
            <div className="flex flex-col gap-2.5">
              <AnimatePresence>
                {packing.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="relative group/pack flex items-center gap-2.5"
                  >
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updatePackingText(item.id, e.target.value)}
                      className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-300 text-gray-700"
                      placeholder="アイテムを追加"
                    />
                    <button
                      onClick={() => deletePacking(item.id)}
                      className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center opacity-0 group-hover/pack:opacity-100 transition-opacity hover:bg-rose-400 hover:text-white shrink-0"
                      aria-label="削除"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={addPacking}
                className="flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-500 transition-colors mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                追加
              </button>
            </div>
          </div>
        </div>

        {/* Sticker 3 */}
        <div className="relative z-10 flex justify-end pr-2 -mt-14 -mb-14">
          <img
            src="/assets/montain_anpan.png"
            alt=""
            className="w-24 h-24 pointer-events-none select-none drop-shadow-md"
            style={{ transform: 'rotate(-8deg)' }}
          />
        </div>

        {/* Free memo section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <img src="/assets/travel_anpan.png" alt="" className="w-7 h-7 shrink-0" />
            <h3 className="text-sm font-bold text-gray-500 tracking-wide">メモ</h3>
          </div>

          <div
            className="rounded-3xl px-5 py-4"
            style={{ background: '#fefce8', border: '1.5px solid #fde68a' }}
          >
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full text-sm text-gray-700 bg-transparent placeholder:text-gray-300 resize-none focus:outline-none leading-relaxed"
              style={{ minHeight: '6rem' }}
              placeholder="自由にメモ..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
