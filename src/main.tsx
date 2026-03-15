import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import { MindMemoPage } from "./pages/MindMemoPage.tsx";
import { NightDiaryPage } from "./pages/NightDiaryPage.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/mind-memo" element={<MindMemoPage />} />
      <Route path="/night-diary" element={<NightDiaryPage />} />
    </Routes>
  </BrowserRouter>
);
