import { useState, memo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { type MindMapNodeData } from '../domain/mindmap';
import { EditableField } from './EditableField';


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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleTitleSave = (title: string) => {
    onUpdateNode(node.id, { title });
  };

  const handleTextSave = (text: string) => {
    onUpdateNode(node.id, { text });
  };

  const handleNodeClick = () => {
    setIsExpanded(!isExpanded);
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
        initial={{ scale: 0, opacity: 0, zIndex:10 }}
        animate={{
          scale: isExpanded ? 1.8 : 1,
          opacity: 1,
          zIndex: isExpanded ? 50 : isHovered ? 100 : 10
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="node-wrapper group"
        style={{ position: 'relative' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`node-base ${isRoot ? 'node-root' : 'node-child'}`}
          onClick={handleNodeClick}
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
              />
              <div className="node-divider" />
              <EditableField
                value={node.text}
                onSave={handleTextSave}
                placeholder="テキスト"
                fieldType="text"
                disabled={!isExpanded}
              />
            </div>
          </div>
        </div>

        {/* Buttons outside node */}
        {!isExpanded && (
        <div className="node-actions-outer">
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