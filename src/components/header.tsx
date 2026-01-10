import { RotateCcw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface HeaderProps {
  onReset: () => void;
  onSave: () => void;
}

export function Header({ onReset, onSave }: HeaderProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleResetClick = () => {
    setShowResetDialog(true);
  };

  const handleConfirmReset = () => {
    setShowResetDialog(false);
    onReset();
  };

  const handleCancelReset = () => {
    setShowResetDialog(false);
  };

  return (
    <>
      <div className="app-header">
        <div className="app-header-container">
          <div className="flex items-center gap-3">
            <img src="/icons/icon.png" alt="アイコン" className="w-12 h-12" />
            <div>
              <h1 className="app-title">
                mind dialy
              </h1>
            </div>
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
              onClick={handleResetClick}
              className="btn-reset"
            >
              <RotateCcw className="icon-sm" />
              <span className="hidden md:inline">reset</span>
            </motion.button>
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
            onClick={handleCancelReset}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                リセットの確認
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                記載内容をリセットしてもいいですか？
              </p>
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelReset}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium"
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
