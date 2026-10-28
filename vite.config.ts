/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { PAGE_META } from './src/utils/pageMeta.ts'
import { buildManifest, manifestHrefFor, renderPageHtml } from './src/utils/webAppManifest.ts'

const pageKeys = Object.keys(PAGE_META)

function manifestSource(pageKey: string): string {
  return JSON.stringify(buildManifest(pageKey), null, 2)
}

/**
 * 機能ごとにホーム画面へ追加できるよう、ページごとの manifest と初期 HTML を出力する。
 * Cloudflare Pages は /mind-memo に mind-memo.html を返し、存在するファイルは _redirects の SPA フォールバックより優先される。
 */
function perPageWebApp(): Plugin {
  const pageKeyByManifestHref = new Map(pageKeys.map((key) => [manifestHrefFor(key), key]))

  return {
    name: 'matoriko-per-page-web-app',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pageKey = pageKeyByManifestHref.get(req.url?.split('?')[0] ?? '')
        if (!pageKey) return next()
        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(manifestSource(pageKey))
      })
    },
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        const index = bundle['index.html']
        if (index?.type !== 'asset') throw new Error('index.html が出力されていません')

        for (const pageKey of pageKeys) {
          this.emitFile({
            type: 'asset',
            fileName: manifestHrefFor(pageKey).slice(1),
            source: manifestSource(pageKey),
          })
          if (pageKey === '/') continue
          this.emitFile({
            type: 'asset',
            fileName: `${pageKey.slice(1)}.html`,
            source: renderPageHtml(String(index.source), pageKey),
          })
        }
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), perPageWebApp()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
