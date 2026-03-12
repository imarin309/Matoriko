import { RotateCcw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { AppLauncher } from './AppLauncher';

interface HeaderProps {
  onReset: () => void;
  onSave: () => void;
}

export function Header({ onReset, onSave }: HeaderProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleConfirmReset = () => {
    setShowResetDialog(false);
    onReset();
  };

  return (
    <>
      <div className="app-header">
        <div className="app-header-container">
          <div className="flex items-center gap-3">
            <img src="/icons/icon.png" alt="アイコン" className="w-12 h-12" />
            <h1 className="app-title">Matriko</h1>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSave}
              className="btn-reset"
            >
              <Download className="icon-sm" />
              <span className="hidden md:inline">save</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResetDialog(true)}
              className="btn-reset"
            >
              <RotateCcw className="icon-sm" />
              <span className="hidden md:inline">reset</span>
            </motion.button>

            <AppLauncher />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showResetDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100]"
            onClick={() => setShowResetDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">リセットの確認</h2>
              <p className="text-gray-600 mb-6">記載内容をリセットしてもいいですか？</p>
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResetDialog(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium"
                >
                  cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmReset}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
                >
                  reset
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
