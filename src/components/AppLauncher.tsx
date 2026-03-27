import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

function LauncherIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <rect x="0" y="0" width="5" height="5" rx="1" />
      <rect x="6.5" y="0" width="5" height="5" rx="1" />
      <rect x="13" y="0" width="5" height="5" rx="1" />
      <rect x="0" y="6.5" width="5" height="5" rx="1" />
      <rect x="6.5" y="6.5" width="5" height="5" rx="1" />
      <rect x="13" y="6.5" width="5" height="5" rx="1" />
      <rect x="0" y="13" width="5" height="5" rx="1" />
      <rect x="6.5" y="13" width="5" height="5" rx="1" />
      <rect x="13" y="13" width="5" height="5" rx="1" />
    </svg>
  );
}

export function AppLauncher() {
  const [showLauncher, setShowLauncher] = useState(false);
  const launcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (launcherRef.current && !launcherRef.current.contains(e.target as Node)) {
        setShowLauncher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={launcherRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowLauncher((v) => !v)}
        className="launcher-btn"
        aria-label="アプリ一覧"
      >
        <LauncherIcon />
      </motion.button>

      <AnimatePresence>
        {showLauncher && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="launcher-dropdown"
          >
            <Link
              to="/"
              className="launcher-item"
              onClick={() => setShowLauncher(false)}
            >
              <img src="/icons/icon.png" alt="" className="w-5 h-5 shrink-0" />
              <span className="launcher-item-label">Matriko</span>
            </Link>
            <Link
              to="/mind-memo"
              className="launcher-item"
              onClick={() => setShowLauncher(false)}
            >
              <span className="launcher-item-icon">📝</span>
              <span className="launcher-item-label">mind-memo</span>
            </Link>
            <Link
              to="/night-diary"
              className="launcher-item"
              onClick={() => setShowLauncher(false)}
            >
              <span className="launcher-item-icon">🌙</span>
              <span className="launcher-item-label">night-diary</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
