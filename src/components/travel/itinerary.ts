export interface ScheduleItem {
  id: number;
  time: string;
  place: string;
  memo: string;
}

export interface DayPlan {
  id: number;
  date: string;
  items: ScheduleItem[];
}

export interface PackingItem {
  id: number;
  text: string;
}

export interface TravelPlan {
  title: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  packing: PackingItem[];
  memo: string;
}

export const DAY_COLORS = [
  { bg: '#fff0f5', border: '#f9c0d0', badge: '#f472a8', text: '#9d174d' },
  { bg: '#fff7ed', border: '#fed7aa', badge: '#fb923c', text: '#9a3412' },
  { bg: '#f0fdf4', border: '#bbf7d0', badge: '#4ade80', text: '#14532d' },
  { bg: '#eff6ff', border: '#bfdbfe', badge: '#60a5fa', text: '#1e3a8a' },
  { bg: '#fdf4ff', border: '#e9d5ff', badge: '#c084fc', text: '#6b21a8' },
  { bg: '#f0fdfa', border: '#99f6e4', badge: '#2dd4bf', text: '#134e4a' },
  { bg: '#fefce8', border: '#fde68a', badge: '#facc15', text: '#78350f' },
];

export function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${Number(m)}月${Number(d)}日（${weekdays[date.getDay()]}）`;
}
