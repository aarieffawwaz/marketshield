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

Risk endpoint, model block (written by `web/scripts/publish-forecast.ts` from `ml/results/risk_latest.json`), re-checked on 1 Nov 2026:

```json
{"official_level": {"value": 3, "name": "Siaga", "source": "PVMBG"},
 "model": {"probability_7d": 0.9685, "window_days": 7,
           "top_drivers": ["Titik panas 3 minggu lalu", "Titik panas minggu ini", "Backscatter S1"],
           "name": "xgboost-thermal-v1", "updated_at": "2026-10-31T18:58:04.696Z"}}
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

## 8. Screenshot gallery

Captured on 1 November 2026 from the team's own accounts (emails, user IDs and key IDs blurred). Every image links to the full-size file.

### Backend: Firebase and Google Cloud

| | |
|:-:|:-:|
| [![Firebase project](evidence/firebase-overview.webp)](evidence/firebase-overview.webp)<br><sub>Firebase project `marketshield-brain` (Spark plan)</sub> | [![Firestore volcanoes/semeru](evidence/firestore-semeru.webp)](evidence/firestore-semeru.webp)<br><sub>`volcanoes/semeru` with the published XGBoost forecast (`xgboost-thermal-v1`)</sub> |
| [![Firestore posko](evidence/firestore-posko.webp)](evidence/firestore-posko.webp)<br><sub>`posko` collection, live aid-post status</sub> | [![Firestore rules](evidence/firestore-rules.webp)](evidence/firestore-rules.webp)<br><sub>Deployed security rules (role claims)</sub> |
| [![Firebase Auth](evidence/firebase-auth.webp)](evidence/firebase-auth.webp)<br><sub>Firebase Auth: operator accounts (email/password and Google)</sub> | [![Service accounts](evidence/gcp-iam-sa.webp)](evidence/gcp-iam-sa.webp)<br><sub>Least-privilege service accounts: `ms-server` (API), `ms-colab` (notebook)</sub> |

### Data and models: Earth Engine, Colab, Hugging Face

| | |
|:-:|:-:|
| [![Earth Engine console](evidence/earthengine-console.webp)](evidence/earthengine-console.webp)<br><sub>Earth Engine registered (non-commercial) for the feature pipeline</sub> | [![Earth Engine Code Editor](evidence/earthengine-codeeditor.webp)](evidence/earthengine-codeeditor.webp)<br><sub>Earth Engine Code Editor on the same project</sub> |
| [![Colab notebook](evidence/colab-hoax.webp)](evidence/colab-hoax.webp)<br><sub>`ml/hoax_classifier.ipynb` opened in Colab</sub> | [![Hugging Face dataset](evidence/hf-dataset.webp)](evidence/hf-dataset.webp)<br><sub>Training data: `mzuama/IndonesianHoaxdetection`</sub> |
| [![FIRMS](evidence/gee-firms.webp)](evidence/gee-firms.webp)<br><sub>Earth Engine catalog: NASA FIRMS</sub> | [![Sentinel-5P SO2](evidence/gee-s5p-so2.webp)](evidence/gee-s5p-so2.webp)<br><sub>Earth Engine catalog: Sentinel-5P SO₂</sub> |
| [![Sentinel-1](evidence/gee-s1.webp)](evidence/gee-s1.webp)<br><sub>Earth Engine catalog: Sentinel-1 GRD</sub> | [![Model results](../ml/results/risk_results.png)](../ml/results/risk_results.png)<br><sub>Risk engine results (ROC-AUC 0.899)</sub> |

### Delivery: Vercel and GitHub

| | |
|:-:|:-:|
| [![Vercel project](evidence/vercel-project.webp)](evidence/vercel-project.webp)<br><sub>Vercel production deployment</sub> | [![Vercel deployments](evidence/vercel-deployments.webp)](evidence/vercel-deployments.webp)<br><sub>Deployment history: one per merged PR</sub> |
| [![Vercel env](evidence/vercel-env.webp)](evidence/vercel-env.webp)<br><sub>Encrypted environment variable (names only)</sub> | [![GitHub Actions](evidence/github-actions.webp)](evidence/github-actions.webp)<br><sub>GitHub Actions: build checks and deploys</sub> |
| [![GitHub releases](evidence/github-releases.webp)](evidence/github-releases.webp)<br><sub>Signed APK releases with SHA-256</sub> | [![Merged PRs](evidence/github-prs.webp)](evidence/github-prs.webp)<br><sub>Merged pull requests, built step by step</sub> |

### Live product

| | |
|:-:|:-:|
| [![Status page](evidence/site-status.webp)](evidence/site-status.webp)<br><sub>`/status`: live checks of the API and map providers</sub> | [![Risk API](evidence/api-risk.webp)](evidence/api-risk.webp)<br><sub>`/api/v1/volcanoes/semeru/risk` serving the model forecast</sub> |
