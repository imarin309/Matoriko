import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export interface MindMapNodeData {
  id: string;
  text: string;
  children: MindMapNodeData[];
}

interface MindMapNodeProps {
  node: MindMapNodeData;
  onAddChild: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdateText: (nodeId: string, text: string) => void;
  isRoot?: boolean;
  level?: number;
}

export function MindMapNode({
  node,
  onAddChild,
  onDelete,
  onUpdateText,
  isRoot = false,
  level = 0,
}: MindMapNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdateText(node.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(node.text);
      setIsEditing(false);
    }
  };

  
  const colorClass = 'bg-white border-2 border-blue-200';

  const textColorClass = 'text-gray-900';

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative group"
      >
        <div
          className={`
            relative
            ${isRoot ? 'w-40 h-40 md:w-48 md:h-48' : 'w-32 h-32 md:w-36 md:h-36'}
            rounded-2xl
            ${colorClass}
            shadow-lg hover:shadow-2xl
            transition-all duration-300
            flex items-center justify-center
            cursor-pointer
            ${!isRoot && 'hover:scale-105'}
          `}
          onClick={() => !isEditing && setIsEditing(true)}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          
          {/* Content */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
            {isEditing ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-gray-50 text-gray-900 placeholder:text-gray-400 text-center rounded-lg px-2 outline-none border-2 border-gray-300 focus:border-gray-500"
                placeholder="テキストを入力"
                autoFocus
              />
            ) : (
              <p className={`${textColorClass} text-center break-words overflow-hidden`}>
                {node.text}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="子ノードを追加"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </motion.button>

            {!isRoot && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500 shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                title="削除"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="relative">
          {/* Connecting line - vertical */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-300 -translate-y-6" />
          
          {/* Children in horizontal row */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 relative">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                {/* Vertical connecting line to parent */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-px h-6 bg-gray-300" />
                
                <MindMapNode
                  node={child}
                  onAddChild={onAddChild}
                  onDelete={onDelete}
                  onUpdateText={onUpdateText}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}