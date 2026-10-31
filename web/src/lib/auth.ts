"use client";

import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firebaseApp, firestore } from "./live";
import type { Role, Session } from "./store";

const TITLES: Record<Role, { id: string; en: string }> = {
  bpbd: { id: "Operator Pusdalops", en: "Operations officer" },
  posko: { id: "Koordinator posko", en: "Aid post coordinator" },
  donor: { id: "Donatur & distributor", en: "Donor & distributor" },
};

/** Real operator sign-in. Role comes from the Firebase Auth custom claim set by scripts/set-role.ts. */
export async function operatorSignIn(email: string, password: string): Promise<Session> {
  const auth = getAuth(firebaseApp());
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const claims = (await cred.user.getIdTokenResult(true)).claims;
  const raw = String(claims.role ?? "");
  if (!["admin", "bpbd", "posko", "donor"].includes(raw)) {
    await signOut(auth);
    throw Object.assign(new Error("no-role"), { code: "ms/no-role" });
  }
  const role: Role = raw === "admin" ? "bpbd" : (raw as Role);
  const p = (await getDoc(doc(firestore(), "users", cred.user.uid)).catch(() => null))?.data() ?? {};
  const name: string = p.name ?? cred.user.email ?? "Operator";
  const initials = name.split(/\s+/).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  return { name, initials, role, title: p.title ?? TITLES[role], org: p.org ?? "", email: cred.user.email ?? email, uid: cred.user.uid, admin: raw === "admin" };
}

export const operatorSignOut = () => signOut(getAuth(firebaseApp())).catch(() => {});

export const authErrorText = (code: string, t: (id: string, en: string) => string) =>
  code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found"
    ? t("Email atau kata sandi salah.", "Wrong email or password.")
    : code === "auth/too-many-requests"
      ? t("Terlalu banyak percobaan. Coba lagi beberapa menit lagi.", "Too many attempts. Try again in a few minutes.")
      : code === "ms/no-role"
        ? t("Akun ini belum punya peran operator. Hubungi admin.", "This account has no operator role yet. Contact an admin.")
        : code === "auth/network-request-failed"
          ? t("Tidak ada koneksi. Coba lagi atau pakai mode demo.", "No connection. Try again or use demo mode.")
          : t("Gagal masuk. Coba lagi.", "Sign-in failed. Try again.");
