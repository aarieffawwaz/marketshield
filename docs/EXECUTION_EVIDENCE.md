# Execution evidence

What was run against the live system, when, and what it returned. Times are Asia/Jakarta (WIB). Re-run any command below to check it yourself.

## 1. Live endpoints

| Item | Value |
|:-|:-|
| Site | <https://marketshield-inception.vercel.app> (Vercel project `marketshield-inception`) |
| API | `https://marketshield-inception.vercel.app/api/v1` |
| Database | Firestore, project `marketshield-brain`, `asia-southeast2` |
| Repository | <https://github.com/aarieffawwaz/marketshield> |
| APK | <https://github.com/aarieffawwaz/marketshield/releases/tag/v1.0.0> |

## 2. API serves the live database

Checked 31 Oct 2026, 23:47 WIB:

```text
GET /volcanoes               200  source=firestore  rows=25
GET /volcanoes/semeru/risk   200  model forecast present
GET /villages/priority       200  source=firestore  rows=8
GET /prices                  200  source=firestore  rows=8
GET /posko                   200  source=firestore  rows=5
GET /alerts                  200  source=firestore  rows=6
GET /intel                   200  source=firestore  rows=4
```

Risk endpoint, model block (written by the risk-engine notebook):

```json
{"official_level": {"value": 3, "name": "Siaga", "source": "PVMBG"},
 "model": {"probability_7d": 0.75, "window_days": 5, "top_drivers": ["Tren SO2", "Hujan 72 Jam", "Backscatter S1"]}}
```

Message check:

```bash
curl -X POST https://marketshield-inception.vercel.app/api/v1/signals/check \
  -H 'Content-Type: application/json' \
  -d '{"text":"Katanya lahar sudah masuk Pronojiwo, segera tinggalkan rumah! Sebarkan!"}'
```

```json
{"label":"HOAX","confidence":0.97,"triggers":["sudah masuk","segera tinggalkan","sebarkan","katanya"],
 "satellite_check":"Radar Sentinel-1 tidak mendeteksi aliran baru ke Pronojiwo dalam 48 jam terakhir.",
 "nearest_fact":"PVMBG 08.20: Semeru tetap Level III. Tidak ada perintah evakuasi untuk wilayah ini."}
```

The resulting `signals` document holds `confidence, createdAt, label, lang, length, model, source, triggers`: no message text.

## 3. Firestore rules from an anonymous client

Checked 31 Oct 2026, 23:47 WIB, with no credentials, against `https://firestore.googleapis.com/v1/projects/marketshield-brain/databases/(default)/documents/<collection>`:

```text
volcanoes 200   villages 200   posko 200   prices 200   alerts 200   intel 200
signals   403   reports  403   users 403
```

## 4. End-to-end flows (Playwright, Chromium)

| Flow | Steps | Result |
|:-|:-|:-|
| Operator write | Sign in as `posko.demo@marketshield.test` → Posts tab → *Posko Pronojiwo* from *Tutup* to *Buka* | Firestore `closed → open`; toast "diperbarui untuk semua pengguna"; reverted to `closed` |
| Demo mode | *Data contoh* → Sari Wulandari → change the same post | Badge `Demo`; UI pill *Buka*; Firestore unchanged |
| Live view-only | *Data live* → Sari Wulandari → change the same post | Badge `Live · lihat`; change refused with a message; Firestore unchanged |
| Session after reload | *Data live* → overview → reload on `/app?tab=posko` | Badge stays `Live · lihat` (fixed in #19) |
| Service-account scope | `ms-colab` key: write + delete a test `signals` doc, then call `auth.listUsers` | Write OK, cleanup OK, Auth admin denied |

## 5. Page audit

Playwright visited 23 routes (19 pages plus 4 blog posts) at 1440×900 and 390×844, scrolled each page, and checked console errors, failed same-origin requests, horizontal overflow, broken images and the number of `h1` elements. Three issues were found and fixed (console login overflow on mobile, a missing `h1` on `/mobile`, a clipped price on `/harga`). The final run reported no issues.

## 6. Builds and delivery

- Pull requests #1–#19 merged with merge commits (branches kept); #20 and #21 open at the time of writing.
- Production deploys from `main` on 31 Oct: 6 succeeded, 4 were cancelled by a newer merge, 1 failed on Vercel's free upload quota (`api-upload-free`), after which PR previews were switched to build-only (#21).
- Flutter: `flutter analyze` → *No issues found*; `flutter test` → 7 passed; `flutter build web --release --base-href /mobile-app/ --no-web-resources-cdn` → built.
- Release signing: a locally built APK with the release key verifies as `CN=MarketShield, OU=BRAIN - Ayam Jago, O=BINUS University, L=Jakarta, C=ID`.

## 7. APK v1.0.0

Published 31 Oct 2026, 20:23 WIB.

```text
marketshield-arm64.apk  20,754,892 B  sha256:fcc028915bcc661055188f1ac80bf9bdd78d8915c8274ea86120444ea74f2155
marketshield-armv7.apk  18,270,566 B  sha256:884800d3bbc6d4f8875ed5aaa6101171af210b2f6461d4272df630b5b2b94b10
```

Verify: `shasum -a 256 marketshield-arm64.apk`.
