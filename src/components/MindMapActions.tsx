import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmDialog } from './ConfirmDialog';

interface MindMapActionsProps {
  onSave: () => void;
  onReset: () => void;
}

export function MindMapActions({ onSave, onReset }: MindMapActionsProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDialog(true)}
            className="btn-sub-action-ghost"
          >
            <RotateCcw className="icon-sm" />
            <span className="hidden md:inline">reset</span>
          </motion.button>
        </div>
      </div>
      <ConfirmDialog
        open={showDialog}
        title="リセットの確認"
        message="記載内容をリセットしてもいいですか？"
        onConfirm={() => { setShowDialog(false); onReset(); }}
        onCancel={() => setShowDialog(false)}
      />
    </>
  );
}
