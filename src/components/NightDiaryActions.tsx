import { Download, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface NightDiaryActionsProps {
  onDownload: () => void;
  onReset: () => void;
}

export function NightDiaryActions({ onDownload, onReset }: NightDiaryActionsProps) {
  return (
    <div className="sub-toolbar">
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          aria-label="リセット"
          className="btn-sub-action-ghost"
        >
          <RotateCcw className="icon-sm" />
        </motion.button>
      </div>
    </div>
  );
}
