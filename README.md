<div align="center">

# MarketShield

**Gunung dibaca dari orbit. Warga bertindak sebelum panik.**

Satellite-based eruption early warning for residents, markets and aid posts around Indonesia's active volcanoes.

[**Live site**](https://marketshield-inception.vercel.app) · [**Web console**](https://marketshield-inception.vercel.app/app) · [**Resident app**](https://marketshield-inception.vercel.app/mobile) · [**Download APK**](https://github.com/aarieffawwaz/marketshield/releases/latest)

*BRAIN – Ayam Jago · BINUS University*

</div>

## Surfaces

| Surface | Route | For |
|:-|:-|:-|
| Landing page | `/` | Judges, partners, BPBD, donors |
| Web console | `/app` | BPBD operators, aid posts, donors, distributors |
| Resident app | `/mobile` | Residents; the Flutter app compiled to web, shown in a device frame on desktop |
| APK download | `/download` | Android install (arm64-v8a and armeabi-v7a), served from GitHub Releases |
| Marketing & resources | `/fitur` `/harga` `/docs` `/bantuan` `/kemitraan` `/blog` | Features, pricing, docs, help centre, partnerships, articles |
| Company & trust | `/tentang` `/pers` `/keamanan` `/status` `/changelog` | About, press kit, security & compliance, live status, release notes |
| Legal | `/privasi` `/syarat` `/kredit` | Privacy policy (UU PDP 27/2022), terms, photo & data credits |
| Public API | `/api/v1/*` | `volcanoes`, `volcanoes/{id}/risk`, `villages/priority`, `prices`, `POST signals/check` |

## What it does

1. **Sense**: Earth Engine datasets (Sentinel-1/2/5P, FIRMS, MODIS, GPM IMERG, GFS, WorldPop) become one 7-day escalation probability and an action window.
2. **Filter**: IndoBERT separates field reports from hoaxes and panic posts, with satellite cross-checks for lahar and ash claims.
3. **Act**: the app changes shape with the official PVMBG level (I Normal → IV Awas).
4. **Fair**: price-cap (HET) monitoring and a per-village Aid Priority Index.

## Repository layout

```
web/    Next.js 16 site: landing, web console, /mobile host, public API
app/    Flutter app (Android + web)
.github/workflows/
  deploy.yml        Flutter web → web/public/mobile-app, then Vercel (preview on PRs, production on main)
  release-apk.yml   tag v* → signed APKs on a GitHub Release
```

## Getting started

```bash
cd web
npm install
npm run dev            # http://localhost:3000
```

To see the resident app at `/mobile` locally, build it once into the site:

```bash
cd app
flutter build web --release --base-href /mobile-app/ --no-web-resources-cdn
cp -R build/web/. ../web/public/mobile-app/
```

## Shipping

- **Website + web app:** open a PR → CI posts a preview URL. Merge to `main` → production.
- **Android APK:** bump `version` in `app/pubspec.yaml`, then `git tag v1.0.1 && git push --tags`. CI builds, signs and publishes the release; `/download` picks it up automatically.

Required repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Motion, MapLibre GL, three.js, Recharts, Zustand · Flutter 3 (flutter_map) · Vercel · GitHub Actions.

## Known limitations

- No backend yet: values in the console and app are static and shaped like the Earth Engine pipeline outputs; actions such as logging deliveries or broadcasting alerts update only the current browser session.
- Levels follow PVMBG; MarketShield forecasts complement, never replace, official information.
- v1.0.0 APKs are signed with a debug key; releases from v1.0.1 use the release keystore, so testers need to uninstall v1.0.0 once before upgrading.
