# Performance Budget

## Key assets

| Asset | Size (raw) | Gzip | When loaded |
|---|---|---|---|
| `to-jyutping` dictionary | ~2 MB | ~700 KB | Lazy — on first song analysis |
| Main bundle (`index-*.js`) | 568 KB | 130 KB | Initial load |
| Chunked vendor (`dist-*.js`) | 684 KB | 424 KB | On first analysis trigger |
| PWA precache (14 entries) | 2.03 MB | — | Service worker on install |

## First-analysis latency

- **First load**: dictionary is fetched (~700 KB gzip), then parsed in a Web Worker. Expect 1–3 s on a fast connection, 5–10 s on 3G. Progress indicator shown in UI.
- **Subsequent loads**: dictionary served from service worker cache. Analysis is near-instant (dominated by synchronous `to-jyutping` lookup, <100 ms for a 50-line song).
- **Target**: 90th percentile first-analysis < 5 s on 4G.

## Bundle-size budget

- **Warning threshold**: 500 KB per chunk after minification (Vite default, enforced by `vite.config.js`)
- **Current largest chunk**: 568 KB (main). Several vendor chunks exceed 400 KB but are below threshold.
- **Strategy**: `vite-plugin-pwa` with `autoUpdate` + `workbox` precaching. Large deps (jspdf, html2canvas) are dynamically imported only when PDF export is triggered.

## PWA precache strategy

The service worker precaches all 14 `dist/` entries on install. The `to-jyutping` dictionary is **not** precached — it's fetched on demand and cached at runtime by the browser.

For future optimization: consider bundling a lightweight fallback dictionary (~100 KB, covering the demo song vocab) to eliminate the cold-start wait.