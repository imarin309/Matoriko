/**
 * 朝4時を日付の境目として今日の日付文字列 (YYYY-MM-DD) を返す
 */
export function todayString(): string {
  const d = new Date();
  if (d.getHours() < 4) {
    d.setDate(d.getDate() - 1);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
