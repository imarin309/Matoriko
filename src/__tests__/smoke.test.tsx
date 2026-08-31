import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../App';
import { MindMapPage } from '../pages/MindMapPage';
import { MindMemoPage } from '../pages/MindMemoPage';
import { DiaryPage } from '../pages/DiaryPage';
import { MemoryPage } from '../pages/MemoryPage';
import { TravelItineraryPage } from '../pages/TravelItineraryPage';
import { MessageCardPage } from '../pages/MessageCardPage';
import { PomodoroPage } from '../pages/PomodoroPage';
import { ShelfPage } from '../pages/ShelfPage';
import { MurmurPage } from '../pages/MurmurPage';
import { ScrapPage } from '../pages/ScrapPage';

const routes = [
  { path: '/', label: 'App (トップ)' },
  { path: '/mind-map', label: 'MindMapPage' },
  { path: '/mind-memo', label: 'MindMemoPage' },
  { path: '/diary', label: 'DiaryPage' },
  { path: '/memory', label: 'MemoryPage' },
  { path: '/travel', label: 'TravelItineraryPage' },
  { path: '/message', label: 'MessageCardPage' },
  { path: '/pomodoro', label: 'PomodoroPage' },
  { path: '/shelf', label: 'ShelfPage' },
  { path: '/murmur', label: 'MurmurPage' },
  { path: '/scrap-word', label: 'ScrapPage' },
];

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/mind-map" element={<MindMapPage />} />
        <Route path="/mind-memo" element={<MindMemoPage />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/memory" element={<MemoryPage />} />
        <Route path="/travel" element={<TravelItineraryPage />} />
        <Route path="/message" element={<MessageCardPage />} />
        <Route path="/pomodoro" element={<PomodoroPage />} />
        <Route path="/shelf" element={<ShelfPage />} />
        <Route path="/murmur" element={<MurmurPage />} />
        <Route path="/scrap-word" element={<ScrapPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('smoke: 各ルートがクラッシュせずレンダリングされる', () => {
  for (const { path, label } of routes) {
    it(`${label} (${path})`, () => {
      const { container } = renderAt(path);
      expect(container.firstChild).not.toBeNull();
    });
  }
});
