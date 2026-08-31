import { Download } from 'lucide-react';
import { motion } from 'motion/react';

interface ShelfActionsProps {
  onSave: () => void;
}

/** 他ページと同じ位置・同じ見た目の保存ボタン */
export function ShelfActions({ onSave }: ShelfActionsProps) {
  return (
    <div className="sub-toolbar">
      <div className="sub-toolbar-container">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="btn-sub-action"
        >
          <Download className="icon-sm" />
          <span className="hidden md:inline">save</span>
        </motion.button>
      </div>
    </div>
  );
}
