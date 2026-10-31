# Security self-assessment

Scope: the live deployment at <https://marketshield-inception.vercel.app>, the Firebase project `marketshield-brain`, the GitHub repository and its CI, and the Android APK. Assessed by the team on 31 October 2026 (WIB). This is a self-assessment, not a third-party audit.

## 1. Assets

| Asset | Why it matters |
|:-|:-|
| Aid-post status, alerts, intel | Wrong data could send residents to a full shelter or spread panic |
| Operator accounts and role claims | Control who can change public safety information |
| Service-account keys | Full read/write to Firestore |
| APK signing key | Lets updates replace the installed app |
| Residents' privacy | Location and messages they check |

## 2. Threat model

| Threat | Example | Main controls |
|:-|:-|:-|
| Unauthorised write | Someone marks every shelter "full" | Firestore rules by role claim; posko role limited to status fields; demo and view-only sessions never write |
| Privilege escalation in the browser | Editing `localStorage` to claim a role | Session object is UI-only; Firestore checks the ID token's custom claim |
| Credential leak | Service-account JSON pasted into a shared notebook | Separate least-privilege accounts, key disable/rotate procedure, contract forbids keys in cells |
| API abuse | Flooding `POST /signals/check` | Input length limit (2,000 chars); platform limits on Vercel; no expensive model call per request |
| Misinformation | Fake "official" alert | Only BPBD operators can broadcast; official level is a separate field set by admins |
| Supply chain | Malicious dependency or workflow change | Lockfiles committed; CI secrets scoped to the repository; reviews through pull requests |
| Privacy | Message text or location retained | Message text never stored; app usable without an account; location used on device |

## 3. Controls in place

- **Database authorisation:** `firebase/firestore.rules`; verified from an anonymous client (public collections 200, `signals` and `users` 403) and by an end-to-end operator write.
- **Least privilege:** `ms-server` = Datastore User + Firebase Auth Admin; `ms-colab` = Datastore User only (cannot manage users, verified).
- **Browser key restriction:** the Firebase web API key accepts requests only from `marketshield-inception.vercel.app`, project previews, `localhost` and the Firebase domains.
- **Transport:** HTTPS with HSTS on Vercel.
- **Secrets:** GitHub Actions secrets and Vercel encrypted env vars; `.env*`, `key.properties`, `*.jks` and AI helper files are in `.gitignore`.
- **APK integrity:** SHA-256 published per release; from v1.0.1 signed with a dedicated release key kept outside the repository.
- **Data minimisation:** `signals` keeps label, confidence, triggers, language and length only.

## 4. Findings

| ID | Severity | Finding | Status |
|:-|:-|:-|:-|
| F1 | High | A Datastore-only service-account key was pasted into a notebook shared by link, exposing read/write access to Firestore. | **Fixed.** Found during review; the key was disabled within minutes, a replacement was issued, no unexpected writes were found, and [ML-CONTRACT.md](../firebase/ML-CONTRACT.md) now requires Colab Secrets and restricted sharing. |
| F2 | Medium | The `posko` role can update the status of any aid post, not only its own. | Open. Plan: `users/{uid}.poskoIds` and a rule check. |
| F3 | Medium | The notebook account (`roles/datastore.user`) can write every collection; IAM cannot scope it per collection. | Accepted for the prototype. Plan: notebooks write through an authenticated API endpoint. |
| F4 | Medium | No application-level rate limit on `POST /api/v1/signals/check`. | Open. Plan: per-IP limit at the edge. |
| F5 | Low | Console session is stored in `localStorage`. | Accepted: it controls UI only; every write is checked by Firestore against the ID token. |
| F6 | Low | APK v1.0.0 is signed with a debug key. | Fixed for future releases (release key in CI); v1.0.0 testers reinstall once. |
| F7 | Info | API responses use `Access-Control-Allow-Origin: *`. | Accepted: public, read-only data; the only POST stores no personal data. |
| F8 | Info | EOX Sentinel-2 cloudless imagery is licensed for non-commercial use. | Compliance item before any commercial launch. |

## 5. Compliance status

| Standard | Status |
|:-|:-|
| UU PDP No. 27/2022 | Self-assessed: data minimisation, purpose and rights described in the privacy policy (`/privasi`) |
| PP 71/2019 (PSE registration) | Planned before a public Play Store release |
| OWASP ASVS L1 | Self-checked for the console and API; not independently tested |
| WCAG 2.2 AA | Target; partial |
| ISO/IEC 27001 | Roadmap after a district pilot |

No third-party certification is held in MarketShield's name. Vercel and Google Cloud hold their own certifications; those are not MarketShield's.

## 6. Reporting a vulnerability

Report privately through GitHub Security Advisories: <https://github.com/aarieffawwaz/marketshield/security/advisories/new>. Please do not access other people's data or disrupt the service while testing.
