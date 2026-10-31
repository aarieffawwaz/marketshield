# MarketShield web

Next.js 16 site: landing page, web console (`/app`), resident app host (`/mobile`), download page and the public API (`/api/v1`).

```bash
npm install
npm run dev
```

```
src/app/          routes and API handlers
src/components/   landing, map (MapLibre + three.js eruption layer), webapp (console), pages, site, ui
src/lib/          data.ts, geo.ts, classify.ts, store.ts (zustand, ID/EN, theme), release.ts (latest APK from GitHub)
public/           photos, screenshots, textures, partner logos, 3D models
```

`public/mobile-app/` is generated from `../app` by CI and is not committed. See the [root README](../README.md).
