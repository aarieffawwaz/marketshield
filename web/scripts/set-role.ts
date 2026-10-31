/**
 * Creates (or updates) a console operator and sets their role claim + profile.
 * Usage: FIREBASE_SERVICE_ACCOUNT="$(cat key.json)" npm run set-role -- <email> <admin|bpbd|posko|donor> "<Full name>" "<Organisation>" [password]
 * Without a password an existing account keeps its own; a new account gets a random one printed once.
 * Pass "google" as the password to create a Google-only account (no password).
 */
import { randomBytes } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { auth, db } from "../src/lib/server/firebase";

const ROLES = ["admin", "bpbd", "posko", "donor"] as const;
const TITLES = { admin: { id: "Admin MarketShield", en: "MarketShield admin" }, bpbd: { id: "Operator Pusdalops", en: "Operations officer" }, posko: { id: "Koordinator posko", en: "Aid post coordinator" }, donor: { id: "Donatur & distributor", en: "Donor & distributor" } };

async function main() {
  const [email, role, name, org, given] = process.argv.slice(2);
  if (!email || !ROLES.includes(role as (typeof ROLES)[number]) || !name) {
    console.error('usage: npm run set-role -- <email> <admin|bpbd|posko|donor> "<Full name>" "<Organisation>" [password]');
    process.exit(1);
  }
  const a = auth(), store = db();
  if (!a || !store) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  let password: string | undefined = given;
  let user = await a.getUserByEmail(email).catch(() => null);
  if (!user && password === "google") {
    // Google-only account: no password; the Google provider is linked on first sign-in
    password = undefined;
    user = await a.createUser({ email, displayName: name, emailVerified: true });
    console.log(`created ${email} (Google sign-in)`);
  } else if (!user) {
    password ??= randomBytes(9).toString("base64url");
    user = await a.createUser({ email, password, displayName: name, emailVerified: true });
    console.log(`created ${email}`);
  } else if (password && password !== "google") {
    await a.updateUser(user.uid, { password, displayName: name });
  }
  await a.setCustomUserClaims(user.uid, { role });
  await store.collection("users").doc(user.uid).set({ name, org: org ?? "", role, title: TITLES[role as keyof typeof TITLES], email, volcanoIds: ["semeru"], updatedAt: Timestamp.now() }, { merge: true });
  console.log(`${email} → ${role}${password && !given ? `  password: ${password}` : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
