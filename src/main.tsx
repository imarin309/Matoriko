import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import { RouteMeta } from "./components/RouteMeta.tsx";
import { MindMapPage } from "./pages/MindMapPage.tsx";
import { MindMemoPage } from "./pages/MindMemoPage.tsx";
import { DiaryPage } from "./pages/DiaryPage.tsx";
import { MemoryPage } from "./pages/MemoryPage.tsx";
import { TravelItineraryPage } from "./pages/TravelItineraryPage.tsx";
import { MessageCardPage } from "./pages/MessageCardPage.tsx";
import { PomodoroPage } from "./pages/PomodoroPage.tsx";
import { ShelfPage } from "./pages/ShelfPage.tsx";
import { MurmurPage } from "./pages/MurmurPage.tsx";
import { ScrapPage } from "./pages/ScrapPage.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RouteMeta />
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
  </BrowserRouter>
);
