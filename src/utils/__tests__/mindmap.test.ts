import { describe, it, expect } from 'vitest';
import {
  type MindMapNodeData,
  addChildToNode,
  deleteNodeById,
  updateNodeTextById,
  updateNodeById,
  convertToMarkdown,
} from '../mindmap';

function makeTree(): MindMapNodeData {
  return {
    id: 'root',
    title: 'ルート',
    text: '',
    children: [
      {
        id: 'child-1',
        title: '子1',
        text: '子1のメモ',
        children: [
          { id: 'grandchild-1', title: '孫1', text: '', children: [] },
        ],
      },
      { id: 'child-2', title: '子2', text: '', children: [] },
    ],
  };
}

describe('addChildToNode', () => {
  it('指定したノードの子として新しいノードを追加する', () => {
    const tree = makeTree();
    const result = addChildToNode(tree, 'child-2');

    const target = result.children.find((c) => c.id === 'child-2')!;
    expect(target.children).toHaveLength(1);
    expect(target.children[0]).toMatchObject({ title: '', text: '', children: [] });
  });

  it('元のツリーを変更しない（イミュータブル）', () => {
    const tree = makeTree();
    const original = JSON.parse(JSON.stringify(tree));
    addChildToNode(tree, 'child-2');
    expect(tree).toEqual(original);
  });

  it('存在しないIDを指定した場合はツリーの内容を変えない', () => {
    const tree = makeTree();
    const result = addChildToNode(tree, 'nonexistent');
    expect(result).toEqual(tree);
  });
});

describe('deleteNodeById', () => {
  it('指定したIDのノードを（孫階層でも）削除する', () => {
    const tree = makeTree();
    const result = deleteNodeById(tree, 'grandchild-1');
    const child1 = result.children.find((c) => c.id === 'child-1')!;
    expect(child1.children).toHaveLength(0);
  });

  it('元のツリーを変更しない（イミュータブル）', () => {
    const tree = makeTree();
    const original = JSON.parse(JSON.stringify(tree));
    deleteNodeById(tree, 'child-1');
    expect(tree).toEqual(original);
  });

  it('ルートノード自体は削除されない（childrenの走査のみ）', () => {
    const tree = makeTree();
    const result = deleteNodeById(tree, 'root');
    expect(result.id).toBe('root');
  });
});

describe('updateNodeTextById', () => {
  it('指定ノードのtextのみ更新し、titleは変更しない', () => {
    const tree = makeTree();
    const result = updateNodeTextById(tree, 'child-1', '更新後のテキスト');
    const child1 = result.children.find((c) => c.id === 'child-1')!;
    expect(child1.text).toBe('更新後のテキスト');
    expect(child1.title).toBe('子1');
  });
});

describe('updateNodeById', () => {
  it('titleとtextをまとめて更新できる', () => {
    const tree = makeTree();
    const result = updateNodeById(tree, 'child-2', { title: '新タイトル', text: '新テキスト' });
    const child2 = result.children.find((c) => c.id === 'child-2')!;
    expect(child2).toMatchObject({ title: '新タイトル', text: '新テキスト' });
  });

  it('部分的な更新は他フィールドを保持する', () => {
    const tree = makeTree();
    const result = updateNodeById(tree, 'child-1', { title: '新タイトルのみ' });
    const child1 = result.children.find((c) => c.id === 'child-1')!;
    expect(child1.title).toBe('新タイトルのみ');
    expect(child1.text).toBe('子1のメモ');
  });
});

describe('convertToMarkdown', () => {
  it('階層の深さに応じて#の数が増える', () => {
    const tree = makeTree();
    const markdown = convertToMarkdown(tree);
    expect(markdown).toContain('# ルート');
    expect(markdown).toContain('## 子1');
    expect(markdown).toContain('### 孫1');
  });

  it('titleとtextが両方空のノードは出力しない', () => {
    const tree: MindMapNodeData = {
      id: 'root',
      title: '',
      text: '',
      children: [{ id: 'empty', title: '', text: '', children: [] }],
    };
    expect(convertToMarkdown(tree)).toBe('');
  });

  it('textのみのノードは見出しなしで本文として出力する', () => {
    const tree: MindMapNodeData = {
      id: 'root',
      title: '',
      text: '本文のみ',
      children: [],
    };
    expect(convertToMarkdown(tree)).toBe('本文のみ\n\n');
  });
});
