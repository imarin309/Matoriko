import { useState, memo, useRef, useEffect } from 'react';
import { Plus, Trash2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { type MindMapNodeData } from '../domain/mindmap';
import { EditableField } from './EditableField';
import { useIsMobile } from '../hooks/useIsMobile';


interface MindMapNodeProps {
  node: MindMapNodeData;
  onAddChild: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdateText: (nodeId: string, text: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<Pick<MindMapNodeData, 'title' | 'text'>>) => void;
  isRoot?: boolean;
  level?: number;
}

export const MindMapNode = memo(({
  node,
  onAddChild,
  onDelete,
  onUpdateText,
  onUpdateNode,
  isRoot = false,
  level = 0,
}: MindMapNodeProps) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTitleEdit, setIsTitleEdit] = useState(false);
  const [isTextEdit, setIsTextEdit] = useState(false);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [expandScale, setExpandScale] = useState(2);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // 画面サイズに応じた拡大倍率を計算
  useEffect(() => {
    const calculateScale = () => {
      if (!nodeRef.current) return;

      const viewportMin = Math.min(window.innerWidth, window.innerHeight);
      const targetSize = viewportMin * 0.7;
      const nodeSize = nodeRef.current.offsetWidth || (isRoot ? 176 : 144);
      const scale = targetSize / nodeSize;

      setExpandScale(scale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [isRoot]);

  // 拡大時の画面中央への移動量を計算
  useEffect(() => {
    if (isExpanded && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const nodeCenterX = rect.left + rect.width / 2;
      const nodeCenterY = rect.top + rect.height / 2;
      setCenterOffset({
        x: centerX - nodeCenterX,
        y: centerY - nodeCenterY,
      });
    } else {
      setCenterOffset({ x: 0, y: 0 });
    }
  }, [isExpanded]);

  const handleTitleSave = (title: string) => {
    onUpdateNode(node.id, { title });
  };

  const handleTextSave = (text: string) => {
    onUpdateNode(node.id, { text });
  };

  const handleNodeClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleTitleRequestEdit = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setIsTitleEdit((prev) => !prev);
  };

  const handleTextRequestEdit = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setIsTextEdit((prev) => !prev);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete(node.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <div className="node-container">
      <motion.div
        ref={nodeRef}
        initial={{ scale: 0, opacity: 0, zIndex:10 }}
        animate={{
          scale: isExpanded ? expandScale : 1,
          x: centerOffset.x,
          y: centerOffset.y,
          opacity: 1,
          zIndex: isExpanded ? 200 : isHovered ? 50 : 10
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="node-wrapper group"
        style={{ position: 'relative' }}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onTouchStart={() => isMobile && setIsHovered(true)}
      >
        <div
          className={`node-base ${isRoot ? 'node-root' : 'node-child'}`}
          onClick={handleNodeClick}
        >
          <div className="node-glow" />

          {/* Close button - 拡大時のみ表示 */}
          {isExpanded && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors z-20"
              title="閉じる"
            >
              <Minimize2 className="w-5 h-5" />
            </motion.button>
          )}

          <div className="node-content">
            <div className="node-display-container">
              <EditableField
                value={node.title}
                onSave={handleTitleSave}
                placeholder="タイトル"
                fieldType="title"
                disabled={!isExpanded}
                onRequestEdit={handleTitleRequestEdit}
                isEdit={isTitleEdit}
              />
              <div className="node-divider" />
              <EditableField
                value={node.text}
                onSave={handleTextSave}
                placeholder="テキスト"
                fieldType="text"
                disabled={!isExpanded}
                onRequestEdit={handleTextRequestEdit}
                isEdit={isTextEdit}
              />
            </div>
          </div>
        </div>

        {/* Buttons outside node */}
        {!isExpanded && (
        <div className={`node-actions-outer ${isMobile ? 'mobile-visible' : ''}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            className="btn-action-add"
            title="子ノードを追加"
          >
            <Plus className="icon-md icon-text" />
          </motion.button>

          {/* delete button */}
          {!isRoot && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick();
              }}
              className="btn-action-delete"
              title="削除"
            >
              <Trash2 className="icon-md icon-delete" />
            </motion.button>
          )}
        </div>
        )}
      </motion.div>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="children-container">
          {/* Connecting line - vertical */}
          <div className="connection-line-vertical" />

          {/* Children in horizontal row */}
          <div className="children-row">
            {node.children.map((child) => (
              <div key={child.id} className="child-wrapper">
                {/* Vertical connecting line to parent */}
                <div className="connection-line-to-parent" />

                <MindMapNode
                  node={child}
                  onAddChild={onAddChild}
                  onDelete={onDelete}
                  onUpdateText={onUpdateText}
                  onUpdateNode={onUpdateNode}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100]"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                削除の確認
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                削除してもいいですか？
              </p>
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelDelete}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium"
                >
                  cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
                >
                  delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});