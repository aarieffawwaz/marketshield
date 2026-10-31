# Writing model outputs to Firestore

For notebooks and pipelines (IndoBERT hoax filter, XGBoost risk engine, Earth Engine jobs).
The web console and the app read these fields directly, so names and types matter.

## Credentials

- Use the `ms-colab` service-account key. **Never paste the key into a notebook cell.** Store it in Colab → Secrets (key icon) as `MS_FIRESTORE_KEY` and load it with `userdata.get("MS_FIRESTORE_KEY")`.
- Keep notebooks that touch Firestore shared with named people only, not "anyone with the link".

```python
import json, firebase_admin
from firebase_admin import credentials, firestore
from google.colab import userdata

firebase_admin.initialize_app(credentials.Certificate(json.loads(userdata.get("MS_FIRESTORE_KEY"))))
db = firestore.client()
```

## Risk engine → `volcanoes/{id}.forecast`

Merge only the `forecast` map (and `forecastUpdatedAt`). Do not overwrite `name`, `level`, `lat`, `lon`: `level` is the official PVMBG status and is set by operators.

```python
db.collection("volcanoes").document("semeru").set({
    "forecast": {
        "p_escalation_7d": 0.75,          # float 0–1
        "window_days": 5,                 # int
        "shap_top3": ["Tren SO2", "Hujan 72 Jam", "Backscatter S1"],
        "model": "xgboost-v1",
    },
    "forecastUpdatedAt": firestore.SERVER_TIMESTAMP,
}, merge=True)
```

## Hoax filter → `signals` (every prediction) and `intel` (curated, public)

`signals` stores the outcome only. **Do not store the message text** (it can contain personal data; UU PDP 27/2022).

```python
db.collection("signals").add({
    "label": "HOAX",                       # HOAX | PANIC | VERIFIED | OFFICIAL
    "confidence": 0.98,                    # float 0–1
    "triggers": ["sudah masuk", "segera tinggalkan"],
    "lang": "id",
    "length": len(text),
    "model": "indobert-v1",
    "source": "colab",
    "createdAt": firestore.SERVER_TIMESTAMP,
})
```

For a public claim that operators should see in the feed (e.g. a viral rumour), write a short, anonymised summary to `intel`:

```python
db.collection("intel").add({
    "verdict": "HOAX",
    "head": {"id": "Klaim lahar meluap ke Pronojiwo", "en": "Claim: lahar reached Pronojiwo"},
    "ctx":  {"id": "Sentinel-1 tidak mendeteksi aliran baru 48 jam terakhir.", "en": "Sentinel-1 shows no new flow in the last 48 h."},
    "confidence": 0.98,
    "sources": ["IndoBERT", "Sentinel-1"],
    "createdAt": firestore.SERVER_TIMESTAMP,
})
```

Use `createdAt` (camelCase) and the English verdict codes above; the console also accepts `HOAKS`/`PANIK`/`FAKTA`/`RESMI` but the canonical form is English.
