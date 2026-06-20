import { Download, RotateCcw, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface NightDiaryActionsProps {
  onDownload: () => void;
  onReset: () => void;
  onToggleTag: () => void;
  isTagActive: boolean;
}

export function NightDiaryActions({
  onDownload,
  onReset,
  onToggleTag,
  isTagActive,
}: NightDiaryActionsProps) {
  return (
    <div className="sub-toolbar">
      <div className="sub-toolbar-container">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleTag}
          className={isTagActive ? 'btn-sub-action' : 'btn-sub-action-ghost'}
          title="タグ追加"
        >
          <Tag className="icon-sm" />
          <span className="hidden md:inline">tag</span>
        </motion.button>
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

