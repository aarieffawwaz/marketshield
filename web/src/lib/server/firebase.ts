import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

/**
 * Firebase Admin, server-side only. Credentials come from FIREBASE_SERVICE_ACCOUNT
 * (the service-account JSON, raw or base64). Without it, callers fall back to static data.
 */
let app: App | null | undefined;

function credentials() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    console.error("FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON or base64 JSON");
    return null;
  }
}

function getApp(): App | null {
  if (app !== undefined) return app;
  if (getApps().length) return (app = getApps()[0]);
  const sa = credentials();
  app = sa ? initializeApp({ credential: cert(sa), projectId: sa.project_id }) : null;
  return app;
}

export function db(): Firestore | null {
  const a = getApp();
  return a ? getFirestore(a) : null;
}

export function auth(): Auth | null {
  const a = getApp();
  return a ? getAuth(a) : null;
}
