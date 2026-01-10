/**
 * マインドマップのファイル名を生成する
 * @param title - ノードのタイトル（空の場合は「無題」を使用）
 * @returns タイムスタンプ付きのファイル名（例: 無題_202601101234.md）
 */
export function generateMindMapFileName(title: string): string {
  const sanitizedTitle = (title || '無題').replace(/[/\\:*?"<>|]/g, '');
  const now = new Date();
  const dateTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  return `${sanitizedTitle}_${dateTime}.md`;
}
