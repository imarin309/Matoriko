export interface PocketTagData {
  id: string;
  text: string;
  size: number;
  color: string;
  memoIds: string[];
}

export const POCKET_TAGS_STORAGE_KEY = 'matoriko_pocket_tags';
