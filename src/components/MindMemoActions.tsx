import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MindMemoActionsProps {
  done: boolean;
  onDownload: () => void;
}

export function MindMemoActions({ done, onDownload }: MindMemoActionsProps) {
  return (
    <AnimatePresence>
      {done && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="sub-toolbar overflow-hidden"
        >
          <div className="sub-toolbar-container">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownload}
              className="btn-sub-action"
            >
              <Download className="icon-sm" />
              <span className="hidden md:inline">save</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
