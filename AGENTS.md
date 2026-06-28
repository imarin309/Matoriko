# Matoriko プロジェクトガイド

This file provides guidance to agents (including Antigravity) when working with code in this repository.

## プロジェクト概要

React、TypeScript、Viteで構築されたWebアプリケーション。React Routerで3つのツールを提供するアプリランチャー構成。

- `/` — マインドマップ（階層的なノード編集、Markdownエクスポート）
- `/mind-memo` — 認知行動療法のコラム法（7ステップの思考整理フォーム、.txtエクスポート）
- `/night-diary` — 夜日記（日付付きフリーテキスト、.txtエクスポート）

各ページのヘッダーに`AppLauncher`コンポーネントを配置し、ページ間を遷移できる。

## コマンド

### 開発
```bash
pnpm dev             # 開発サーバーを起動
make exe             # 開発サーバーを起動（代替）
```

### ビルド & プレビュー
```bash
pnpm build           # 型チェックとプロダクションビルド
pnpm preview         # プロダクションビルドをプレビュー
```

### コード品質
```bash
pnpm lint            # ESLintを実行
make format          # ESLintで自動修正（--fix）
```

### その他
```bash
pnpm install         # 依存関係をインストール
make clean           # ビルド成果物を削除（dist、dist-ssr、.viteキャッシュ）
```

## アーキテクチャ

### ルーティング
`src/main.tsx`でBrowserRouterを設定。`App.tsx`はマインドマップページそのもの（ページコンポーネントではなくルートコンポーネント）。`MindMemoPage`と`NightDiaryPage`は`src/pages/`に配置。

### 状態管理パターン
マインドマップのツリー構造には**イミュータブルな状態更新**を使用している。`src/domain/mindmap.tsx`の全操作（追加、削除、更新）は既存のノードを変更せず、新しいノードツリーを作成する。

**重要**: ノード操作を修正する際は、必ず新しいオブジェクト/配列を返すこと。既存のものを直接変更しないこと。

### コンポーネント階層（マインドマップ）
- **App.tsx**: `rootNode`としてマインドマップ全体の状態を管理、ズーム操作（ピンチ/トラックパッド）も処理
- **MindMapNode**: 自身と子ノードを再帰的にレンダリング。`memo()`でパフォーマンス最適化
- **EditableField**: タイトルとテキスト両方で使用するインライン編集コンポーネント
- **Header**: リセットと保存（Markdown出力）機能

### ドメインロジック（`src/domain/mindmap.tsx`）
ツリーを受け取り新しいツリーを返す純粋関数群：
- `addChildToNode` / `deleteNodeById`
- `updateNodeById` / `updateNodeTextById`
- `convertToMarkdown`: 深さに応じた`#`レベルで出力

ノードID生成: `Date.now()` + `Math.random()`。

### スタイリング
- **Tailwind CSS**: ユーティリティクラス用
- **カスタムCSS**: `src/styles/theme.css`にノード固有のスタイル（アニメーション、グラデーション、接続線）
- CSSクラス命名規則: ケバブケース（例: `node-container`、`children-row`、`app-header`、`launcher-btn`）

### アニメーションとインタラクション
- **motion**（Framer Motion）ライブラリを使用
- マインドマップノード: クリックで展開/折りたたみ（展開時1.8倍スケール）、展開時のみ編集可能
- z-index管理: 展開中（50）< ホバー中（100）; 通常（10）
- ノード展開時にオーバーレイ背景が表示される

### エクスポート機能
各ページ共通のパターン: `Blob` → `URL.createObjectURL` → `<a download>` → クリック → クリーンアップ。
- マインドマップ: `mindmap_YYYYMMDD_HHMM.md`（`src/domain/fileName.tsx`でファイル名生成）
- mind-memo: `mindMemo_YYYYMMDD_HHMM.txt`
- night-diary: `diary-YYYY-MM-DD.txt`


## Antigravity CLI 動作ルール

1. **勝手にコードを修正・保存しないこと。**
2. ユーザーから指示を受けたら、まず「修正方針」と「実行予定のコマンド/変更箇所」をリストアップして提示すること。
3. ユーザーへの確認や承諾、方針の決定を行う際は、可能な限り `default_api:ask_question` ツールを使用し、インタラクティブな選択肢形式で確認を行うこと。
4. ユーザーから選択肢等で明示的な許可（「OK」「実行して」等）を得た場合のみ、実際のファイル編集やコマンド実行を行うこと。
5. エラーが起きた場合も、自動でリトライループに入らず、原因と対策をユーザーに報告して（必要に応じて `default_api:ask_question` ツールを利用し）指示を仰ぐこと。