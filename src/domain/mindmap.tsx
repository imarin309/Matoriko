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