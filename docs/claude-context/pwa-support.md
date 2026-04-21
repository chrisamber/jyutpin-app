# Browser & PWA Support

## Supported browsers

- Chrome / Edge 88+ (full PWA support)
- Safari 14.1+ on macOS and iOS
- Firefox 85+ (basic PWA — `manifest.json` + service worker, no install prompt)

## iOS install quirks

- iOS Safari does **not** fire the `beforeinstallprompt` event. The "Add to Home Screen" button must be implemented manually or deferred to a nudge UX.
- iOS requires a `192×192` and `512×512` PNG icon in the web app manifest (SVG alone is not sufficient for iOS).
- Home screen icon is rendered by iOS at `maskable` or `any` shape — verify the icon has sufficient padding.
- `display: standalone` works on iOS but does not suppress the browser chrome as completely as Android.

## Service worker update behavior

`vite-plugin-pwa` with `autoUpdate` strategy:

- On a new deployment, the service worker installs the new version in the background.
- The **old** service worker remains active until all tabs using it are closed.
- On next load, the user sees the updated app (no silent stale serve).
- To force an immediate update (rarely needed), the `SkipWaiting` + `Clients.claim()` flow is handled by the plugin.

To check which SW version is running:
```js
navigator.serviceWorker.controller?.scriptURL
```

## Offline scope

The app works offline for:
- All previously viewed songs (chords, lyrics, analysis cached in localStorage)
- PDF leadsheet export (jspdf + html2canvas are precached)
- TTS playback (audio files fetched at play time — requires network)
- **Demo song** (fully embedded, no network needed)

Offline **requires** network:
- Song search and LRCLIB fetch
- YouTube player
- TTS synthesis
- Fresh `to-jyutping` dictionary load (first analysis after clear cache)

## PWA manifest keys

See `vite.config.js` for full `VitePWA` config. Key fields:
- `name`: "華譜 WaaPou"
- `short_name`: "WaaPou"
- `theme_color`: `#D97706` (amber accent)
- `background_color`: `#FFFFFF`
- `display`: `standalone`
- `start_url`: `/`