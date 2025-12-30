import { useState } from 'react';
import { MindMapNode, type MindMapNodeData } from './components/MindMapNode';
import { RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [rootNode, setRootNode] = useState<MindMapNodeData>({
    id: 'root',
    text: '',
    children: [],
  });

  
  const addChild = (nodeId: string) => {
    const newNode: MindMapNodeData = {
      id: `node-${Date.now()}-${Math.random()}`,
      text: '',
      children: [],
    };

    const updateNode = (node: MindMapNodeData): MindMapNodeData => {
      if (node.id === nodeId) {
        return {
          ...node,
          children: [...node.children, newNode],
        };
      }
      return {
        ...node,
        children: node.children.map(updateNode),
      };
    };

    setRootNode(updateNode(rootNode));
  };

  const deleteNode = (nodeId: string) => {
    const removeNode = (node: MindMapNodeData): MindMapNodeData => {
      return {
        ...node,
        children: node.children
          .filter((child) => child.id !== nodeId)
          .map(removeNode),
      };
    };

    setRootNode(removeNode(rootNode));
  };

  const updateNodeText = (nodeId: string, text: string) => {
    const updateNode = (node: MindMapNodeData): MindMapNodeData => {
      if (node.id === nodeId) {
        return { ...node, text };
      }
      return {
        ...node,
        children: node.children.map(updateNode),
      };
    };

    setRootNode(updateNode(rootNode));
  };

  const resetMindMap = () => {
    setRootNode({
      id: 'root',
      text: '',
      children: [],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* TODO: アイコンを設定 */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                マインドマップ
              </h1>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetMindMap}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">リセット</span>
          </motion.button>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-24 pb-12 px-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Mind map */}
          <div className="flex justify-center items-start">
            <div className="inline-block">
              <MindMapNode
                node={rootNode}
                onAddChild={addChild}
                onDelete={deleteNode}
                onUpdateText={updateNodeText}
                isRoot
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}