.PHONY: help lint format exe dev build preview clean install

# デフォルトターゲット
.DEFAULT_GOAL := help

# ヘルプ
help:
	@echo "Available targets:"
	@echo "  make install  - Install dependencies"
	@echo "  make lint     - Run ESLint"
	@echo "  make format   - Auto-fix code with ESLint"
	@echo "  make exe      - Run development server"
	@echo "  make dev      - Run development server (alias for exe)"
	@echo "  make build    - Build for production"
	@echo "  make preview  - Preview production build"
	@echo "  make clean    - Remove build artifacts"

# 依存関係のインストール
install:
	npm install

# ESLintでコードをチェック
lint:
	npm run lint

# ESLintで自動修正
format:
	npm run lint -- --fix

# 開発サーバーを起動
exe:
	npm run dev

# 開発サーバーを起動（エイリアス）
dev: exe

# プロダクションビルド
build:
	npm run build

# ビルド後のプレビュー
preview:
	npm run preview

# ビルド成果物を削除
clean:
	rm -rf dist dist-ssr node_modules/.vite
