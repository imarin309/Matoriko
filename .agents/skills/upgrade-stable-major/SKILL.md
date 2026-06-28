---
name: upgrade-stable-major
description: プロジェクトの古いパッケージ（outdated）の中から、最も安定してそうな（枯れている）パッケージを自動選定し、メジャーバージョンを上げてビルド動作確認を行うスキル。
---

# upgrade-stable-major スキル

このスキルは、プロジェクト内の依存関係パッケージのうち、メジャーアップデート可能なものを抽出し、最も安全（枯れている）なものを優先してアップデートします。

## 実行手順

1. **安全度スコアの計算と推薦パッケージの取得**
   `.agents/skills/upgrade-stable-major/scripts/select_stable.js` スクリプトを実行して、アップデート候補と推薦パッケージのリストを取得します。
   
   ```bash
   node .agents/skills/upgrade-stable-major/scripts/select_stable.js
   ```

2. **ユーザーへの確認**
   出力された結果をユーザーに提示し、実行の許可を求めます。

3. **アップデートの実行**
   指定されたパッケージをインストールします。
   - `devDependencies` の場合: `pnpm add -D <package>@<latest>`
   - `dependencies` の場合: `pnpm add <package>@<latest>`

4. **動作確認**
   ビルドを実行し、型エラーや動作上の不具合が発生しないことを確認します。
   ```bash
   pnpm build
   ```
