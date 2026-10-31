# Firestore schema

Project `marketshield-brain`, database `(default)`, location `asia-southeast2` (Jakarta).
Times are Firestore `Timestamp` (UTC); the API returns ISO 8601. Bilingual text is `{ id, en }`.

| Collection | Doc id | Fields | Written by | Read by |
|:-|:-|:-|:-|:-|
| `volcanoes` | slug (`semeru`) | `name`, `lat`, `lon`, `level` (1–4, PVMBG), `levelSource`, `monitored`, `updatedAt` | admin, pipeline | public |
| `villages` | slug | `volcanoId`, `name`, `district`, `exposed`, `layer`, `vulnerability` (0–1), `aidReceived`, `needs{}`, `updatedAt` | admin, BPBD, pipeline | public |
| `posko` | slug | `volcanoId`, `name`, `kind{}`, `status` (`open`/`full`/`closed`), `capacity`, `filled`, `has{}`, `needs{}`, `km`, `updatedLabel{}`, `updatedAt` | admin, BPBD, posko operator (status fields) | public |
| `prices` | slug | `region`, `name{}`, `unit{}`, `het`, `marketAvg`, `verifiedOutlets`, `updatedAt` | admin, price pipeline | public |
| `alerts` | auto | `volcanoId`, `kind` (`level`/`sat`/`hoax`/`price`/`sector`/`posko`), `text{}`, `timeLabel{}`, `createdAt` | admin, BPBD | public |
| `intel` | auto | `verdict` (`HOAX`/`PANIC`/`VERIFIED`/`OFFICIAL`), `head{}`, `ctx{}`, `confidence`, `sources[]`, `timeLabel{}`, `createdAt` | admin, BPBD, ML notebook | public |
| `signals` | auto | `label`, `confidence`, `triggers[]`, `lang`, `length`, `model`, `source` (`api`/`colab`), `createdAt` | API, ML notebook | operators |
| `reports` | auto | `kind`, `payload{}`, `status` (`new`/`verified`/`rejected`), `createdAt` | API | operators |
| `users` | auth uid | `name`, `org`, `role`, `volcanoIds[]`, `createdAt` | admin | self, admin |

`signals` never stores the checked message text, only the outcome (UU PDP data minimisation).

Roles are Firebase Auth custom claims: `admin`, `bpbd`, `posko`, `donor`.

## Service accounts

| Account | Roles | Used by |
|:-|:-|:-|
| `ms-server@marketshield-brain` | Cloud Datastore User, Firebase Authentication Admin | Next.js API on Vercel (`FIREBASE_SERVICE_ACCOUNT`) |
| `ms-colab@marketshield-brain` | Cloud Datastore User | ML notebooks (IndoBERT) |

Keys are never committed. Rotate a key with `gcloud iam service-accounts keys create` and delete the old one.

## Seeding

```bash
cd web
FIREBASE_SERVICE_ACCOUNT="$(cat path/to/ms-server-key.json)" npm run seed
```
