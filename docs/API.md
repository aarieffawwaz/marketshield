# MarketShield public API

Base URL: `https://marketshield-inception.vercel.app/api/v1`

- JSON over HTTPS, no authentication, `Access-Control-Allow-Origin: *`.
- Every response carries `source`: `"firestore"` when served from the live database, `"static"` when the database was unreachable and the bundled dataset was used.
- Cache: reference data `max-age=60`, aid posts / alerts / intel `max-age=30`, message checks are not cached.
- Errors: `{ "error": { "code": "…", "message": "…" } }` with an HTTP status.
- Levels follow PVMBG: `1` Normal, `2` Waspada, `3` Siaga, `4` Awas.

| Method | Path | Purpose |
|:-|:-|:-|
| GET | [`/volcanoes`](#get-volcanoes) | Mapped volcanoes with the official level |
| GET | [`/volcanoes/{id}/risk`](#get-volcanoesidrisk) | Official level, escalation probability, action window, indicators, model forecast |
| GET | [`/villages/priority`](#get-villagespriority) | Aid Priority Index ranking |
| GET | [`/prices`](#get-prices) | Emergency goods: price cap (HET), market average, deviation |
| GET | [`/posko`](#get-posko) | Aid posts and shelters: status, capacity, stock, needs |
| GET | [`/alerts`](#get-alerts) | Latest alerts from BPBD and satellites |
| GET | [`/intel`](#get-intel) | Verified claims: hoax, panic, verified, official |
| POST | [`/signals/check`](#post-signalscheck) | Classify a chain message and cross-check it |

## GET /volcanoes

```bash
curl https://marketshield-inception.vercel.app/api/v1/volcanoes
```

```json
{
  "source": "firestore",
  "data": [
    { "id": "semeru", "name": "Gunung Semeru", "lat": -8.108, "lon": 112.922, "level": 3, "monitored": true, "updated_at": "2026-10-31T15:29:18.046Z" }
  ]
}
```

25 volcanoes are returned; `level` is `null` where no official level is stored yet.

## GET /volcanoes/{id}/risk

Query: `level` (1–4, optional) to view a scenario; defaults to 3. Detailed risk is available for `semeru`.

```bash
curl https://marketshield-inception.vercel.app/api/v1/volcanoes/semeru/risk
```

```json
{
  "model": {
    "probability_7d": 0.9685,
    "window_days": 7,
    "top_drivers": ["Titik panas 3 minggu lalu", "Titik panas minggu ini", "Backscatter S1"],
    "name": "xgboost-thermal-v1",
    "updated_at": "2026-10-31T18:58:04.696Z"
  },
  "volcano": "semeru",
  "official_level": { "value": 3, "name": "Siaga", "source": "PVMBG" },
  "escalation_probability_7d": 0.71,
  "action_window": { "id": "± 36 jam jendela aksi", "en": "≈ 36-hour action window" },
  "drivers": ["SO₂ up 3 days in a row", "Radar change in the Besuk Kobokan channel", "Crater temperature anomaly +8 °C"],
  "indicators": [
    { "key": "s1", "dataset": "COPERNICUS/S1_GRD", "value": "−3,1 dB • 12 km²", "trend": "up", "acquired": "2 days ago" },
    { "key": "firms", "dataset": "FIRMS", "value": "7 titik • 34 MW", "trend": "up", "acquired": "6 h ago" },
    { "key": "so2", "dataset": "COPERNICUS/S5P/NRTI/L3_SO2", "value": "2,8 DU", "trend": "up", "acquired": "1 day ago" }
  ],
  "history": [
    { "day": "30/10", "probability": 0.61 },
    { "day": "31/10", "probability": 0.72 }
  ]
}
```

Fetched from production on 1 November 2026; `indicators` (7 in total) and `history` (16 days) are shortened here.

`model` is the latest XGBoost forecast (`xgboost-thermal-v1`) that `web/scripts/publish-forecast.ts` writes from `ml/results/risk_latest.json` to `volcanoes/{id}.forecast`; it is `null` when none exists. `probability_7d` is the chance of NASA FIRMS thermal activity within 5 km of the summit in the next 7 days, a satellite proxy and not the PVMBG level; `top_drivers` are the three largest SHAP contributions. `escalation_probability_7d`, `action_window`, `indicators` and `history` are scenario values that change with the requested level; `drivers` is fixed scenario text. The `model` block does not depend on `level`.

## GET /villages/priority

Query: `level` (1–4, default 3), `volcano` (default `semeru`).

```json
{
  "source": "firestore", "volcano": "semeru", "level": 3,
  "data": [
    { "rank": 1, "id": "supiturang", "village": "Supiturang", "district": "Pronojiwo", "exposed_population": 4120, "driving_layer": "S1 lahar + KRB III", "vulnerability": 0.82, "aid_received": 1, "needs": "N95 masks, clean water, tarps", "score": 1689 }
  ]
}
```

`score = exposed_population × hazard(level) × vulnerability ÷ (aid_received + 1)`, with hazard 0.4 / 0.7 / 1.0 / 1.2 for levels I–IV.

## GET /prices

```json
{
  "source": "firestore", "region": "Kab. Lumajang", "currency": "IDR",
  "data": [
    { "id": "n95-mask", "item": "N95 mask", "unit": "each", "het": 12000, "market_avg": 27500, "deviation": 1.292, "verified_outlets": 4, "flagged": true, "updated_at": "…" }
  ]
}
```

`deviation = (market_avg − het) ÷ het`; `flagged` when above 0.3.

## GET /posko

Query: `volcano` (default `semeru`).

```json
{
  "source": "firestore", "volcano": "semeru",
  "data": [
    { "id": "posko-pronojiwo", "name": "Posko Pronojiwo", "kind": "Aid post", "status": "closed", "capacity": 300, "filled": 0, "has": "-", "needs": "Moved to Sumbermujur", "updated_at": "…" }
  ]
}
```

`status` is `open`, `full` or `closed`. Operators change it from the console; the change is visible here within the cache window.

## GET /alerts

```json
{ "source": "firestore", "data": [ { "id": "seed-0", "kind": "sat", "text": { "id": "SO₂ melonjak 3× …", "en": "SO₂ jumped 3× …" }, "created_at": "…" } ] }
```

`kind`: `level`, `sat`, `hoax`, `price`, `sector`, `posko`. Newest first, up to 20.

## GET /intel

```json
{ "source": "firestore", "data": [ { "id": "seed-1", "verdict": "HOAX", "head": { "id": "…", "en": "…" }, "context": { "id": "…", "en": "…" }, "confidence": 0.94, "sources": ["IndoBERT", "Sentinel-1", "BPBD Lumajang"], "created_at": "…" } ] }
```

## POST /signals/check

Body: `{ "text": string (1–2000 chars), "lang"?: "id" | "en" }`.

```bash
curl -X POST https://marketshield-inception.vercel.app/api/v1/signals/check \
  -H 'Content-Type: application/json' \
  -d '{"text":"Katanya lahar sudah masuk Pronojiwo, segera tinggalkan rumah! Sebarkan!"}'
```

```json
{
  "label": "HOAX",
  "confidence": 0.97,
  "triggers": ["sudah masuk", "segera tinggalkan", "sebarkan", "katanya"],
  "satellite_check": "Radar Sentinel-1 tidak mendeteksi aliran baru ke Pronojiwo dalam 48 jam terakhir.",
  "nearest_fact": "PVMBG 08.20: Semeru tetap Level III. Tidak ada perintah evakuasi untuk wilayah ini."
}
```

`label`: `HOAX`, `PANIC`, `VERIFIED`, `OFFICIAL` or `UNVERIFIED`. The current classifier is rule-based (`rules-v1`); the fine-tuned IndoBERT model will replace it behind the same contract. The outcome (label, confidence, triggers, language, length) is logged to `signals`; **the message text is never stored**. Errors: `400 invalid_json`, `422 invalid_text`. `OPTIONS` answers CORS preflight.
