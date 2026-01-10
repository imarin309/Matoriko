import { useState, memo, useRef, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { type MindMapNodeData } from '../domain/mindmap';
import { EditableField } from './EditableField';
import { useIsMobile } from '../hooks/useIsMobile';
import { useSwipeGesture } from '../hooks/useSwipeGesture';


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
  const [titleEditTrigger, setTitleEditTrigger] = useState(0);
  const [textEditTrigger, setTextEditTrigger] = useState(0);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [expandScale, setExpandScale] = useState(2);
  const nodeRef = useRef<HTMLDivElement>(null);

  // 画面サイズに応じた拡大倍率を計算（画面の短い方の70%）
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

  // スワイプジェスチャー（モバイルのみ、拡大していない時のみ）
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      if (isMobile && !isExpanded && !isRoot) {
        onDelete(node.id);
      }
    },
    onSwipeRight: () => {
      if (isMobile && !isExpanded) {
        onAddChild(node.id);
      }
    },
  });

  const handleTitleSave = (title: string) => {
    onUpdateNode(node.id, { title });
  };

  const handleTextSave = (text: string) => {
    onUpdateNode(node.id, { text });
  };

  const handleNodeClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTitleRequestEdit = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setTitleEditTrigger((prev) => prev + 1);
  };

  const handleTextRequestEdit = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setTextEditTrigger((prev) => prev + 1);
  };

  return (
    <div className="node-container">
      {/* オーバーレイ: 拡大時のみ表示 */}
      {isExpanded && (
        <div
          className="node-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
        />
      )}

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
          {...(isMobile ? swipeHandlers : {})}
        >
          <div className="node-glow" />

          <div className="node-content">
            <div className="node-display-container">
              <EditableField
                value={node.title}
                onSave={handleTitleSave}
                placeholder="タイトル"
                fieldType="title"
                disabled={!isExpanded}
                onRequestEdit={handleTitleRequestEdit}
                editTrigger={titleEditTrigger}
              />
              <div className="node-divider" />
              <EditableField
                value={node.text}
                onSave={handleTextSave}
                placeholder="テキスト"
                fieldType="text"
                disabled={!isExpanded}
                onRequestEdit={handleTextRequestEdit}
                editTrigger={textEditTrigger}
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
                onDelete(node.id);
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
    </div>
  );
});