import { useState, useEffect, useRef } from 'react';
import { MindMapNode} from './components/MindMapNode';
import { Header } from './components/header';
import {
  type MindMapNodeData,
  addChildToNode,
  deleteNodeById,
  updateNodeTextById,
  updateNodeById,
  convertToMarkdown,
} from './domain/mindmap';
import { generateMindMapFileName } from './domain/fileName';

export default function App() {
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

    // ダウンロードリンクを作成
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // リンクをクリックしてダウンロード
    document.body.appendChild(link);
    link.click();

    // クリーンアップ
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 初期表示時にrootノードの位置にスクロール
  useEffect(() => {
    if (mainContentRef.current && mindmapWrapperRef.current) {
      const mainContent = mainContentRef.current;
      const wrapper = mindmapWrapperRef.current;

      // 余白の中央にスクロール
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
          // 最小0.1倍、最大5倍
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
        initialZoom = zoomRef.current; // 最新のzoom値を使用
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance;

        const newZoom = initialZoom * scale;
        // 最小0.1倍、最大5倍
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
  }, []); // 依存配列を空にして、イベントリスナーの再登録を防ぐ

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReset={resetMindMap} onSave={saveMindMap} />

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