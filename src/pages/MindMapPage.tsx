import { useState, useEffect, useRef } from 'react';
import { MindMapNode} from '../components/mindmap/MindMapNode';
import { AppHeader } from '../components/header';
import { MindMapActions } from '../components/mindmap/MindMapActions';
import {
  type MindMapNodeData,
  addChildToNode,
  deleteNodeById,
  updateNodeTextById,
  updateNodeById,
  convertToMarkdown,
} from '../utils/mindmap';
import { generateMindMapFileName } from '../utils/fileName';

export function MindMapPage() {
  const [rootNode, setRootNode] = useState<MindMapNodeData>({
    id: 'root',
    title: '',
    text: '',
    children: [],
  });
  const [zoom, setZoom] = useState(0.8);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const mindmapWrapperRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);

  // zoomRefを常に最新の値に更新
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

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

  const saveMindMap = () => {
    const markdown = convertToMarkdown(rootNode);
    const fileName = generateMindMapFileName(rootNode.title);

    const blob = new Blob([markdown], { type: 'text/markdown' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 初期表示時にrootノードの位置にスクロール
  useEffect(() => {
    if (mainContentRef.current && mindmapWrapperRef.current) {
      const mainContent = mainContentRef.current;
      const wrapper = mindmapWrapperRef.current;

      const scrollX = (wrapper.scrollWidth - mainContent.clientWidth) / 2;
      const scrollY = (wrapper.scrollHeight - mainContent.clientHeight) / 2;

      mainContent.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'auto',
      });
    }
  }, []);

  // ピンチ操作でズーム（トラックパッド）
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();

        const zoomSpeed = 0.01;
        const delta = -e.deltaY * zoomSpeed;

        setZoom((prevZoom) => {
          const newZoom = prevZoom + delta;
          return Math.min(Math.max(newZoom, 0.1), 5);
        });
      }
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('wheel', handleWheel, { passive: false });
      return () => mainContent.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // ピンチ操作でズーム（スマホタッチ）
  useEffect(() => {
    let initialDistance = 0;
    let initialZoom = 0;

    const getDistance = (touches: TouchList) => {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getDistance(e.touches);
        initialZoom = zoomRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance;

        const newZoom = initialZoom * scale;
        const clampedZoom = Math.min(Math.max(newZoom, 0.1), 5);
        setZoom(clampedZoom);
      }
    };

    const handleTouchEnd = () => {
      initialDistance = 0;
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('touchstart', handleTouchStart, { passive: false });
      mainContent.addEventListener('touchmove', handleTouchMove, { passive: false });
      mainContent.addEventListener('touchend', handleTouchEnd);
      return () => {
        mainContent.removeEventListener('touchstart', handleTouchStart);
        mainContent.removeEventListener('touchmove', handleTouchMove);
        mainContent.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="app-header">
        <AppHeader title="mind-map" isSubPage />
        <MindMapActions onSave={saveMindMap} onReset={resetMindMap} />
      </div>

      <div className="main-content" ref={mainContentRef}>
        <div className="main-content-container">
          <div
            className="mindmap-wrapper"
            ref={mindmapWrapperRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
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
