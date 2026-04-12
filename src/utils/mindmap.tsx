export interface MindMapNodeData {
  id: string;
  title: string;
  text: string;
  children: MindMapNodeData[];
}


export function addChildToNode(
  node: MindMapNodeData,
  nodeId: string
): MindMapNodeData {
  const newNode: MindMapNodeData = {
    id: `node-${Date.now()}-${Math.random()}`,
    title: '',
    text: '',
    children: [],
  };

  const updateNode = (currentNode: MindMapNodeData): MindMapNodeData => {
    if (currentNode.id === nodeId) {
      return {
        ...currentNode,
        children: [...currentNode.children, newNode],
      };
    }
    return {
      ...currentNode,
      children: currentNode.children.map(updateNode),
    };
  };

  return updateNode(node);
}

export function deleteNodeById(
  node: MindMapNodeData,
  nodeId: string
): MindMapNodeData {
  const removeNode = (currentNode: MindMapNodeData): MindMapNodeData => {
    return {
      ...currentNode,
      children: currentNode.children
        .filter((child) => child.id !== nodeId)
        .map(removeNode),
    };
  };

  return removeNode(node);
}


export function updateNodeTextById(
  node: MindMapNodeData,
  nodeId: string,
  text: string
): MindMapNodeData {
  const updateNode = (currentNode: MindMapNodeData): MindMapNodeData => {
    if (currentNode.id === nodeId) {
      return { ...currentNode, text };
    }
    return {
      ...currentNode,
      children: currentNode.children.map(updateNode),
    };
  };

  return updateNode(node);
}

/**
 * 指定されたノードIDのノードを更新する（title, text など）
 */
export function updateNodeById(
  node: MindMapNodeData,
  nodeId: string,
  updates: Partial<Pick<MindMapNodeData, 'title' | 'text'>>
): MindMapNodeData {
  const updateNode = (currentNode: MindMapNodeData): MindMapNodeData => {
    if (currentNode.id === nodeId) {
      return { ...currentNode, ...updates };
    }
    return {
      ...currentNode,
      children: currentNode.children.map(updateNode),
    };
  };

  return updateNode(node);
}

/**
 * マインドマップをMarkdown形式に変換する
 * 階層が一つ下がるごとに#が増える
 */
export function convertToMarkdown(
  node: MindMapNodeData,
  level: number = 1
): string {
  let markdown = '';

  // タイトルまたはテキストがある場合のみ出力
  if (node.title || node.text) {
    const heading = '#'.repeat(level);

    // タイトルを見出しとして追加
    if (node.title) {
      markdown += `${heading} ${node.title}\n\n`;
    }

    // テキストを本文として追加
    if (node.text) {
      markdown += `${node.text}\n\n`;
    }
  }

  // 子ノードを再帰的に処理
  node.children.forEach(child => {
    markdown += convertToMarkdown(child, level + 1);
  });

  return markdown;
}