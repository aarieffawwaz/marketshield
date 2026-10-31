# Changelog

All notable changes to MarketShield. Dates are Asia/Jakarta (WIB). Pull request numbers refer to <https://github.com/aarieffawwaz/marketshield/pulls>.

The competition asks for a changelog from the `submission-24h` tag to the `finalist-release` tag; those tags will be added at submission time and this file will be split accordingly.

## Unreleased

## APK v1.0.1 (2026-11-01)

- Demo vs Live data mode, 3D map button (in-app WebView), tidier map controls, 22 px gutter, SOS above toasts, fact-check layout fix (#20). First release signed with the MarketShield release key: uninstall v1.0.0 once before installing.

### Added
- Resident app: Demo vs Live data mode with a header badge; **3D** map button opening the eruption simulation in an in-app WebView; tidy map controls (#20).
- Website and console documentation, diagrams and declarations (this README, `docs/`).

### Changed
- CI builds pull requests without uploading and deploys only from `main`, after previews exhausted Vercel's free daily upload quota (#21).
- Resident app: 22 px page gutter, SOS button above toasts, re-exported website screenshots (#20).

### Fixed
- Console session (mode, operator, name) is kept across reloads; footer spacing; scroll island hidden over the footer (#19).
- Rolling numbers keep units on the same baseline (#18).
- Fact-check card layout and an incorrect photo caption in the app (#20).

## 2026-10-31 (WIB), evening: backend and live data

### Added
- **Backend:** Firebase project in `asia-southeast2`, Firestore schema and security rules, seed script, Firebase Admin data layer with static fallback; `/api/v1/posko`, `/alerts`, `/intel` (#10).
- **Console on live data:** realtime Firestore listeners, operator sign-in with role claims, aid-post status and broadcasts written to the database (#11).
- **Demo vs live modes** in the console, with a mode picker on sign-in (#16).
- **Sign in with Google** (#17).
- Risk API includes the latest XGBoost forecast from the ML notebook (#11).
- Resident app reads the live API with cache and bundled fallback; photo credits and data sources page (#14).
- Chrome-free 3D map at `/embed/peta` for the app (#13).
- Footer with live Semeru level, Jakarta clock and oversized wordmark (#12).

### Fixed
- Empty nudge chart, "Apotek," tab label, CORS preflight on `signals/check` (#15).

## 2026-10-31 (WIB), afternoon: platform

### Added
- Monorepo with the Next.js site (`web/`) and Flutter app (`app/`) (#1, #2).
- MapLibre globe with hazard zones for 25 volcanoes and a three.js eruption simulation (#3).
- Landing page, web console and public API, product, legal and company pages (#4–#6).
- Resident app host at `/mobile` and APK downloads from GitHub Releases (#7).
- GitHub Actions: deploy to Vercel and signed APK releases (#9).

### Released
- **APK v1.0.0** (arm64, armv7) on GitHub Releases with `SHA256SUMS.txt`.
