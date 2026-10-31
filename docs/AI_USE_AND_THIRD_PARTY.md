# AI Use and Third-Party Declaration

We disclose AI use and third-party assets here. Last updated 31 October 2026.

## 1. AI inside the product

| Component | Model / method | Data | What it decides | Status |
|:-|:-|:-|:-|:-|
| Risk engine | XGBoost classifier with SHAP explanations | Google Earth Engine features (FIRMS, Sentinel-5P, Sentinel-1, GPM IMERG) for 25 volcanoes, 2019–2026 | Probability of thermal activity in the next 7 days and its top drivers. Never the official level. | Trained and evaluated in `ml/risk_engine.py` (ROC-AUC 0.90 on 2024–2026); forecast published to Firestore |
| Hoax filter | IndoBERT `indobenchmark/indobert-base-p1` (MIT), fine-tuned by the team | Public `mzuama/IndonesianHoaxdetection` (Hugging Face) + 60 team-written short disaster messages | A label and confidence for a pasted message | Trained in `ml/train_hoax.py` (98.4 % test accuracy); not yet served — the API and app use `rules-v1` meanwhile |
| Rule-based classifier | Trigger phrases + satellite cross-check (`web/src/lib/classify.ts`) | Written by the team | Label for message checks | In production |

Safety-relevant decisions (official level, evacuation, broadcasts) are never made by a model.

## 2. AI used to build the product

| Tool | Provider | Used for | Human control |
|:-|:-|:-|:-|
| Claude Code | Anthropic | Writing and refactoring code for the website, console, API, Flutter app and CI workflows; debugging; automated browser checks; writing this documentation and drawing its diagrams | Every change went through a pull request that the team reviewed, tested and merged |

Team members who used other AI assistants (for example in notebooks or for copywriting) should be added here.

No AI-generated photographs are used to depict real events; the volcano and disaster photos are credited below. Three illustrative images have no recorded source yet and must be confirmed or replaced (see §5).

## 3. Data sources

| Source | Licence / terms | Used for |
|:-|:-|:-|
| Google Earth Engine catalogue: Sentinel-1/2/5P (Copernicus), NASA FIRMS, MODIS, Landsat 9, GPM IMERG, NOAA GFS, Copernicus DEM GLO-30, WorldPop, ESA WorldCover | Each dataset's own terms (Copernicus open licence, NASA/NOAA open data, WorldPop CC BY 4.0, ESA WorldCover CC BY 4.0); Earth Engine terms of service | Risk features, hazard layers, exposed population |
| PVMBG / MAGMA Indonesia | Public government information | Official volcano levels |
| Government price caps (HET) | Public regulations | Price watch reference |
| `mzuama/IndonesianHoaxdetection` | Hugging Face dataset (licence not stated by the author) | IndoBERT training and evaluation |
| Natural Earth | Public domain | Land outline for the globe |

## 4. Maps and services

| Service | Licence / terms | Attribution shown |
|:-|:-|:-|
| Sentinel-2 cloudless 2023 by EOX | CC BY-NC-SA 4.0 (non-commercial) | Map attribution control |
| AWS Terrain Tiles (Terrarium) | Open data; sources include SRTM, ETOPO1 and others | Map attribution control |
| Esri basemaps | Esri terms of use | In-app map credit |
| OpenStreetMap | ODbL | In-app map credit |
| Firebase (Firestore, Auth), Vercel, GitHub Actions | Provider terms | – |

## 5. Images, models and brand marks

| Asset | Source | Licence |
|:-|:-|:-|
| `semeru_calm` | Jakub Hałun, Wikimedia Commons | CC BY-SA 4.0 |
| `mahameru` | Pambudiyoga, Wikimedia Commons | CC BY-SA 4.0 |
| `bridge` (houses buried in ash) | Antara TV, Wikimedia Commons | CC BY 3.0 |
| `kit_med` | Hanabishi, Wikimedia Commons | CC0 |
| `semeru_erupt` | European Space Agency, Wikimedia Commons | Attribution required (ESA) |
| `posko_scene`, `sar_lahar`, `semeru_cctv` | BNPB (Indonesian National Board for Disaster Management), Wikimedia Commons | Public domain |
| `map_hazard`, `map_posko`, `map_route` | Screenshots of MarketShield's own map (tiles credited above) | – |
| `logo`, app icon | MarketShield team | – |
| `avatar`, `factcheck_sat`, `kit_bag` | **Source not recorded: confirm or replace** | – |
| 3D models (aid box, face mask, first aid, pallet, respirator, water cooler, water) | NVIDIA SimReady Assets | CC BY 4.0 (`web/public/models/LICENSE-nvidia-simready.txt`) |
| Brand icons (Flutter, Firebase, Google Cloud, Earth Engine, Hugging Face, MapLibre, NASA, OpenStreetMap, Vercel, social networks) | Simple Icons | CC0; trademarks belong to their owners |
| Agency logos (BNPB, PVMBG, Kemendag, BMKG, Komdigi) | Respective agencies | Shown to identify data sources and target users only; no partnership or endorsement is implied |

Full photo credits with links: [`web/src/lib/photo-credits.json`](../web/src/lib/photo-credits.json) and <https://marketshield-inception.vercel.app/kredit>.

## 6. Fonts

Poppins, Geist and Geist Mono (website) and the Google Fonts bundled in the app: SIL Open Font License 1.1.

## 7. Open-source libraries

Website and console (`web/package.json`):

| Library | Licence |
|:-|:-|
| next 16.4, react 19.3, react-dom | MIT |
| tailwindcss 4, @tailwindcss/postcss | MIT |
| motion 14 | MIT |
| zustand 5 | MIT |
| recharts 3 | MIT |
| maplibre-gl 6.16 | BSD-3-Clause |
| three 0.186 | MIT |
| firebase 12, firebase-admin 13 | Apache-2.0 |
| driver.js 1.10 | MIT |
| lucide-react | ISC |
| gsap 3 | GSAP Standard License (free, not OSI) |
| lenis | MIT |
| clsx, tailwind-merge, qrcode, tsx | MIT |
| typescript, eslint, eslint-config-next | Apache-2.0 / MIT |

Resident app (`app/pubspec.yaml`):

| Package | Licence |
|:-|:-|
| Flutter SDK, flutter_map, http, shared_preferences, url_launcher, webview_flutter, web | BSD-3-Clause |
| google_fonts | Apache-2.0 |
| latlong2 (via flutter_map) | Apache-2.0 |
| cupertino_icons | MIT |

CI: GitHub Actions `actions/checkout`, `actions/setup-node`, `actions/setup-java` (MIT), `subosito/flutter-action` (MIT), `softprops/action-gh-release` (MIT); Vercel CLI (Apache-2.0).
