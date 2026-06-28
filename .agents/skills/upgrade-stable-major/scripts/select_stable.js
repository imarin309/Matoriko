#!/usr/bin/env node

import { execSync } from 'child_process';

// pnpm outdated --format json を実行
let stdout;
try {
  stdout = execSync('pnpm outdated --format json', { encoding: 'utf8' });
} catch (error) {
  // pnpm outdated は古いパッケージがあると終了コードが 1 になる
  stdout = error.stdout;
}

if (!stdout || stdout.trim() === '') {
  console.log('すべてのパッケージは最新です。');
  process.exit(0);
}

let data;
try {
  data = JSON.parse(stdout);
} catch (e) {
  console.error('JSONのパースに失敗しました:', e.message);
  process.exit(1);
}

const candidates = [];

for (const [name, info] of Object.entries(data)) {
  const current = info.current;
  const latest = info.latest;
  if (!current || !latest) continue;

  const currentMajor = current.split('.')[0];
  const latestMajor = latest.split('.')[0];

  // メジャーバージョンアップが可能なものに限定
  if (currentMajor !== latestMajor) {
    let score = 0;
    let category = '';

    if (name.startsWith('@types/')) {
      score = 100;
      category = 'A: 型定義パッケージ（本番挙動への影響なし、最も安全）';
    } else if (info.dependencyType === 'devDependencies') {
      score = 50;
      category = 'B: 開発用パッケージ（開発環境・ビルドツールへの影響のみ）';
    } else {
      score = 10;
      category = 'C: 本番用パッケージ（アプリの動作コードに直接影響）';
    }

    candidates.push({
      name,
      current,
      latest,
      score,
      category
    });
  }
}

if (candidates.length === 0) {
  console.log('メジャーバージョンアップが可能なパッケージはありません。');
  process.exit(0);
}

// 安全度が高い順（スコア降順）にソート
candidates.sort((a, b) => b.score - a.score);

// --json 引数がある場合は JSON で出力
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(candidates, null, 2));
  process.exit(0);
}

// 通常はMarkdown形式で出力
console.log('### メジャーバージョンアップ候補（安全度順）\n');
console.log('| パッケージ名 | 現在のVer | 最新のVer | 安全度区分 |');
console.log('| :--- | :--- | :--- | :--- |');
candidates.forEach(c => {
  console.log(`| \`${c.name}\` | \`${c.current}\` | \`${c.latest}\` | ${c.category} |`);
});

console.log('\n**【おすすめの更新パッケージ】**');
const recommended = candidates[0];
console.log(`- **\`${recommended.name}\`** (\`${recommended.current}\` -> \`${recommended.latest}\`)`);
console.log(`  - 理由: 安全度区分が最も高い「${recommended.category}」に分類されるため、枯れており最も安全にアップデート可能です。`);
