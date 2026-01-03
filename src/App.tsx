import { useState } from 'react';
import { MindMapNode} from './components/MindMapNode';
import { Header } from './components/header';
import {
  type MindMapNodeData,
  addChildToNode,
  deleteNodeById,
  updateNodeTextById,
  updateNodeById,
} from './domain/mindmap';

export default function App() {
  const [rootNode, setRootNode] = useState<MindMapNodeData>({
    id: 'root',
    title: '',
    text: '',
    children: [],
  });

  const addChild = (nodeId: string) => {
    setRootNode(addChildToNode(rootNode, nodeId));
  };

  const deleteNode = (nodeId: string) => {
    setRootNode(deleteNodeById(rootNode, nodeId));
  };

  const updateNodeText = (nodeId: string, text: string) => {
    setRootNode(updateNodeTextById(rootNode, nodeId, text));
  };

  const updateNode = (nodeId: string, updates: Partial<Pick<MindMapNodeData, 'title' | 'text'>>) => {
    setRootNode(updateNodeById(rootNode, nodeId, updates));
  };

  const resetMindMap = () => {
    setRootNode({
      id: 'root',
      title: '',
      text: '',
      children: [],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReset={resetMindMap} />

      <div className="main-content">
        <div className="main-content-container">
          <div className="mindmap-wrapper">
            <div className="inline-block">
              <MindMapNode
                node={rootNode}
                onAddChild={addChild}
                onDelete={deleteNode}
                onUpdateText={updateNodeText}
                onUpdateNode={updateNode}
                isRoot
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}